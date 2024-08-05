import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { isIOS } from '@portkey-wallet/utils/mobile/device';
import * as Google from 'expo-auth-session/providers/google';
import Config from 'react-native-config';
import * as Application from 'expo-application';
import { AccessTokenRequest, makeRedirectUri } from 'expo-auth-session';
import { request } from '@portkey-wallet/api/api-did';
import {
  getGoogleUserInfo,
  parseAppleIdentityToken,
  parseFacebookJWTToken,
  parseTwitterToken,
} from '@portkey-wallet/utils/authentication';
import { randomId } from '@portkey-wallet/utils';
import { customFetch } from '@portkey-wallet/utils/fetch';
import { LoginType, SocialLoginEnum } from '@portkey-wallet/types/types-ca/wallet';
import { useInterface } from 'contexts/useInterface';
import { checkIsUserCancel, handleErrorMessage, sleep } from '@portkey-wallet/utils';
import { changeCanLock } from 'utils/LockManager';
import { AppState } from 'react-native';
import { useIsMainnet } from '@portkey-wallet/hooks/hooks-ca/network';
import { OperationTypeEnum } from '@portkey-wallet/types/verifier';
import TelegramOverlay from 'components/OauthOverlay/telegram';
import FacebookOverlay from 'components/OauthOverlay/facebook';
import { parseTelegramToken, parseKidFromJWTToken } from '@portkey-wallet/utils/authentication';
import { useVerifyManagerAddress } from '@portkey-wallet/hooks/hooks-ca/wallet';
import { useLatestRef } from '@portkey-wallet/hooks';
import {
  ReportUnsetLoginGuardianProps,
  VerifyTokenParams,
  VerifyZKLoginParams,
} from '@portkey-wallet/types/types-ca/authentication';
import { ZKLoginInfo } from '@portkey-wallet/types/verifier';
import { onAndroidFacebookAuthentication, onTwitterAuthentication } from 'utils/authentication';
import {
  TAppleAuthentication,
  IAuthenticationSign,
  TGoogleAuthResponse,
  TVerifierAuthParams,
} from 'types/authentication';
import appleAuth, { appleAuthAndroid } from '@invertase/react-native-apple-authentication';
import generateRandomNonce from '@portkey-wallet/utils/nonce';
import AElf from 'aelf-sdk';

if (!isIOS) {
  // todo_wade: fix the issue of GoogleSignin.configure
  // GoogleSignin.configure({
  //   offlineAccess: true,
  //   webClientId: Config.GOOGLE_WEB_CLIENT_ID,
  // });
} else {
  WebBrowser.maybeCompleteAuthSession();
}

export function useGoogleAuthentication() {
  const [androidResponse, setResponse] = useState<any>();
  const [googleAuthNonce] = useState(generateRandomNonce());
  // const [{ googleRequest, response, promptAsync, googleAuthNonce }, dispatch] = useInterface();
  const [googleRequest, response, promptAsync] = Google.useAuthRequest({
    iosClientId: Config.GOOGLE_IOS_CLIENT_ID,
    androidClientId: Config.GOOGLE_ANDROID_CLIENT_ID,
    shouldAutoExchangeCode: false,
    extraParams: {
      nonce: googleAuthNonce,
    },
  });
  const iosPromptAsync: () => Promise<TGoogleAuthResponse> = useCallback(async () => {
    await sleep(2000);
    if (AppState.currentState !== 'active') throw { message: '' };
    const info = await promptAsync();
    if (info.type === 'success') {
      const exchangeRequest = new AccessTokenRequest({
        clientId: Config.GOOGLE_IOS_CLIENT_ID,
        redirectUri: makeRedirectUri({
          native: `${Application.applicationId}:/oauthredirect`,
        }),
        code: info.params.code,
        extraParams: {
          code_verifier: googleRequest?.codeVerifier || '',
        },
      });
      const authentication = await exchangeRequest.performAsync(Google.discovery);

      const userInfo = await getGoogleUserInfo(authentication?.accessToken);
      return {
        user: {
          ...userInfo,
          photo: userInfo.picture,
          familyName: userInfo.family_name,
          givenName: userInfo.given_name,
        },
        ...authentication,
        nonce: googleAuthNonce,
      } as TGoogleAuthResponse;
    }
    const message =
      info.type === 'cancel' ? '' : 'It seems that the authorization with your Google account has failed.';
    throw { ...info, message };
  }, [promptAsync, googleRequest?.codeVerifier, googleAuthNonce]);

  const androidPromptAsync = useCallback(async () => {
    // sleep show loading
    await sleep(500);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // google services are available
    } catch (err) {
      throw Error('Portkey‘s services are not available in your device.');
    }
    try {
      const userInfo = await GoogleSignin.signIn();
      const token = await GoogleSignin.getTokens();
      await GoogleSignin.signOut();
      const googleResponse = { ...userInfo, ...token, nonce: googleAuthNonce } as TGoogleAuthResponse;
      setResponse(googleResponse);
      return googleResponse;
    } catch (error: any) {
      const message = error.code === statusCodes.SIGN_IN_CANCELLED ? '' : handleErrorMessage(error);
      // : 'It seems that the authorization with your Google account has failed.';
      throw { ...error, message };
    }
  }, [googleAuthNonce]);

  /*
  const androidPromptAsyncOneTap = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleOneTapSignIn.signIn({
        webClientId: Config.GOOGLE_WEB_CLIENT_ID,
        nonce: googleRequest?.nonce,
      });
      const token = await GoogleSignin.getTokens();
      await GoogleSignin.signOut();
      const googleResponse = { ...userInfo, ...token, nonce: googleRequest?.nonce } as TGoogleAuthResponse;
      setResponse(googleResponse);
      return googleResponse;
    } catch (error: any) {
      const message = error.code === statusCodes.SIGN_IN_CANCELLED ? '' : handleErrorMessage(error);
      // : 'It seems that the authorization with your Google account has failed.';
      throw { ...error, message };
    }
  }, [googleRequest?.nonce]);
  */

  const googleSign = useCallback(async () => {
    changeCanLock(false);
    try {
      return await (isIOS ? iosPromptAsync : androidPromptAsync)();
    } finally {
      changeCanLock(true);
    }
  }, [androidPromptAsync, iosPromptAsync]);

  return useMemo(
    () => ({
      googleResponse: isIOS ? response : androidResponse,
      googleSign,
    }),
    [androidResponse, googleSign, response],
  );
}

export function useAppleAuthentication() {
  const [response, setResponse] = useState<TAppleAuthentication>();
  const [androidResponse, setAndroidResponse] = useState<TAppleAuthentication>();
  const isMainnet = useIsMainnet();
  const [nonce] = useState(generateRandomNonce());

  useEffect(() => {
    if (isIOS) return;
    appleAuthAndroid.configure({
      clientId: Config.APPLE_CLIENT_ID,
      redirectUri: isMainnet ? Config.APPLE_MAIN_REDIRECT_URI : Config.APPLE_TESTNET_REDIRECT_URI,
      scope: appleAuthAndroid.Scope.ALL,
      responseType: appleAuthAndroid.ResponseType.ALL,
      nonce,
    });
  }, [isMainnet, nonce]);

  const iosPromptAsync = useCallback(async () => {
    setResponse(undefined);
    try {
      const appleInfo = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        nonce,
      });

      const user = parseAppleIdentityToken(appleInfo.identityToken);
      if (appleInfo.fullName?.familyName) {
        try {
          await request.verify.sendAppleUserExtraInfo({
            params: {
              identityToken: appleInfo.identityToken,
              userInfo: {
                name: {
                  firstName: appleInfo.fullName?.givenName,
                  lastName: appleInfo.fullName?.familyName,
                },
                email: user?.email || appleInfo.email,
              },
            },
          });
        } catch (error) {
          console.log(error, '======error');
        }
      }
      const userInfo = {
        ...appleInfo,
        user: { ...user, id: user?.userId },
        idToken: appleInfo.identityToken,
        nonce: AElf.utils.sha256(appleInfo.nonce),
      } as TAppleAuthentication;
      setResponse(userInfo);
      return userInfo;
    } catch (error: any) {
      console.log(error, '======error');

      const message = error?.code === appleAuth.Error.CANCELED ? '' : handleErrorMessage(error);
      // : 'It seems that the authorization with your Apple ID has failed.';
      throw { ...error, message };
    }
  }, [nonce]);

  const androidPromptAsync = useCallback(async () => {
    setAndroidResponse(undefined);
    try {
      const appleInfo = await appleAuthAndroid.signIn();
      const user = parseAppleIdentityToken(appleInfo.id_token);
      if (appleInfo.user?.name?.lastName) {
        try {
          await request.verify.sendAppleUserExtraInfo({
            params: {
              identityToken: appleInfo.id_token,
              userInfo: {
                name: {
                  firstName: appleInfo.user.name.firstName,
                  lastName: appleInfo.user.name.lastName,
                },
                email: user?.email || appleInfo.user.email,
              },
            },
          });
        } catch (error) {
          console.log(error, '======error');
        }
      }
      const userInfo = {
        identityToken: appleInfo.id_token,
        fullName: {
          givenName: appleInfo.user?.name?.firstName,
          familyName: appleInfo.user?.name?.lastName,
        },
        user: { ...user, id: user?.userId },
        nonce: AElf.utils.sha256(appleInfo.nonce),
      } as TAppleAuthentication;
      setAndroidResponse(userInfo);
      return userInfo;
    } catch (error: any) {
      const message = error?.message === appleAuthAndroid.Error.SIGNIN_CANCELLED ? '' : handleErrorMessage(error);
      // : 'It seems that the authorization with your Apple ID has failed.';
      throw { ...error, message };
    }
  }, []);

  const appleSign = useCallback(async () => {
    changeCanLock(false);
    try {
      return await (isIOS ? iosPromptAsync : androidPromptAsync)();
    } finally {
      changeCanLock(true);
    }
  }, [androidPromptAsync, iosPromptAsync]);

  return useMemo(
    () => ({
      appleResponse: isIOS ? response : androidResponse,
      appleSign,
    }),
    [androidResponse, appleSign, response],
  );
}

export function useTelegramAuthentication() {
  // todo: add Telegram authentication
  return useMemo(
    () => ({
      appleResponse: '',
      telegramSign: TelegramOverlay.sign,
    }),
    [],
  );
}

const onFacebookAuthentication = async () => {
  try {
    return await (isIOS ? FacebookOverlay.sign : onAndroidFacebookAuthentication)();
  } catch (error) {
    if (checkIsUserCancel(error)) throw new Error('');
    throw error;
  }
};

export function useFacebookAuthentication() {
  return useMemo(
    () => ({
      appleResponse: '',
      // facebookSign: ,
      facebookSign: onFacebookAuthentication,
    }),
    [],
  );
}

export function useTwitterAuthentication() {
  return useMemo(
    () => ({
      appleResponse: '',
      twitterSign: onTwitterAuthentication,
    }),
    [],
  );
}
export function useAuthenticationSign() {
  const { appleSign } = useAppleAuthentication();
  const { googleSign } = useGoogleAuthentication();
  const { telegramSign } = useTelegramAuthentication();
  const { twitterSign } = useTwitterAuthentication();
  const { facebookSign } = useFacebookAuthentication();
  return useCallback<IAuthenticationSign['sign']>(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    type => {
      switch (type) {
        case LoginType.Google:
          return googleSign();
        case LoginType.Apple:
          return appleSign();
        case LoginType.Telegram:
          return telegramSign();
        case LoginType.Twitter:
          return twitterSign();
        case LoginType.Facebook:
          return facebookSign();
        default:
          throw new Error('Unsupported login type');
      }
    },
    [appleSign, googleSign, telegramSign, twitterSign, facebookSign],
  );
}

export function useVerifyZKLogin() {
  return useCallback(async (params: VerifyZKLoginParams) => {
    const { verifyToken, jwt, salt, kid, nonce } = params;
    const proofParams = { jwt, salt };
    console.log('aaaa useVerifyZKLogin params: ', proofParams);
    const proofResult = await customFetch('https://zklogin-prover-sha256.aelf.dev/v1/prove', {
      method: 'POST',
      headers: {
        Accept: 'text/plain;v=1.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proofParams),
    });

    const verifyParams = {
      identifierHash: proofResult.identifierHash,
      salt,
      nonce,
      kid,
      proof: proofResult.proof,
    };
    const verifyResult = await customFetch('https://zklogin-prover-sha256.aelf.dev//v1/verify', {
      method: 'POST',
      headers: {
        Accept: 'text/plain;v=1.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verifyParams),
    });

    const portkeyVerifyResult = await request.verify.verifyZKLogin({
      params: {
        ...verifyToken,
        identifierHash: proofResult.identifierHash,
        salt,
      },
    });

    console.log('portkeyVerifyResult : ', portkeyVerifyResult);

    console.log('verifyResult : ', verifyResult);
    const zkProof = decodeURIComponent(verifyParams.proof);
    if (verifyResult.valid) {
      const zkLoginInfo: ZKLoginInfo = {
        guardianIdentifierHash: portkeyVerifyResult.guardianIdentifierHash,
        identifierHash: verifyParams.identifierHash,
        salt: verifyParams.salt,
        zkProof,
        jwt: jwt ?? '',
        nonce: nonce ?? '',
        circuitId: proofResult.circuitId,
      };
      return { zkLoginInfo };
    } else {
      throw new Error('zkLogin verification failed');
    }
  }, []);
}

export function useVerifyGoogleToken() {
  const { googleSign } = useGoogleAuthentication();
  const verifyZKLogin = useVerifyZKLogin();
  return useCallback(
    async (params: VerifyTokenParams) => {
      let accessToken = params.accessToken;
      let idToken = params.idToken;
      let isRequest = !accessToken;
      let nonce = params.nonce;
      if (accessToken) {
        try {
          const { id } = await getGoogleUserInfo(accessToken);
          if (!id || id !== params.id) isRequest = true;
        } catch (error) {
          isRequest = true;
        }
      }
      if (isRequest) {
        const userInfo = await googleSign();
        accessToken = userInfo?.accessToken;
        idToken = userInfo?.idToken;
        nonce = userInfo?.nonce;
        if (userInfo.user.id !== params.id) throw new Error('Account does not match your guardian');
      }
      if (!idToken) {
        throw new Error('Invalid idToken');
      }
      const rst = await verifyZKLogin({
        verifyToken: {
          type: SocialLoginEnum.Google,
          accessToken,
          verifierId: params.verifierId,
          chainId: params.chainId,
          operationType: params.operationType,
        },
        jwt: idToken,
        salt: params.salt ? params.salt : randomId(),
        kid: parseKidFromJWTToken(idToken),
        nonce,
      });
      return {
        ...rst,
        accessToken,
      };
    },
    [googleSign, verifyZKLogin],
  );
}

export function useVerifyAppleToken() {
  const { appleSign } = useAppleAuthentication();
  const verifyZKLogin = useVerifyZKLogin();
  return useCallback(
    async (params: VerifyTokenParams) => {
      let accessToken = params.accessToken;
      let idToken = params.idToken;
      let nonce = params.nonce;
      const { isExpired: tokenIsExpired } = parseAppleIdentityToken(accessToken) || {};
      if (!accessToken || tokenIsExpired) {
        const info = await appleSign();
        accessToken = info.identityToken || undefined;
        idToken = info.idToken;
        nonce = info.nonce;
      }
      const { userId } = parseAppleIdentityToken(accessToken) || {};
      if (userId !== params.id) throw new Error('Account does not match your guardian');

      if (!idToken) {
        throw new Error('Invalid idToken');
      }
      const rst = await verifyZKLogin({
        verifyToken: {
          type: SocialLoginEnum.Apple,
          accessToken,
          verifierId: params.verifierId,
          chainId: params.chainId,
          operationType: params.operationType,
        },
        jwt: idToken,
        salt: params.salt ? params.salt : randomId(),
        kid: parseKidFromJWTToken(idToken),
        nonce,
      });

      return {
        ...rst,
        accessToken,
      };
    },
    [appleSign, verifyZKLogin],
  );
}
export function useVerifyTelegramToken() {
  const { telegramSign } = useTelegramAuthentication();
  return useCallback(
    async (params: VerifyTokenParams) => {
      let accessToken = params.accessToken;
      const { isExpired: tokenIsExpired } = parseTelegramToken(accessToken) || {};
      if (!accessToken || tokenIsExpired) {
        const info = await telegramSign();
        accessToken = info.accessToken || undefined;
      }
      const { userId } = parseTelegramToken(accessToken) || {};
      if (userId !== params.id) throw new Error('Account does not match your guardian');

      const rst = await request.verify.verifyTelegramToken({
        params: { ...params, accessToken },
      });

      return {
        ...rst,
        accessToken,
      };
    },
    [telegramSign],
  );
}

export function useVerifyTwitterToken() {
  const { twitterSign } = useTwitterAuthentication();
  return useCallback(
    async (params: VerifyTokenParams) => {
      let accessToken = params.accessToken;
      const { isExpired: tokenIsExpired } = parseTwitterToken(accessToken) || {};
      if (!accessToken || tokenIsExpired) {
        const info = await twitterSign();
        accessToken = info.accessToken || undefined;
      }
      const { userId, accessToken: accessTwitterToken } = parseTwitterToken(accessToken) || {};

      if (userId !== params.id) throw new Error('Account does not match your guardian');

      const rst = await request.verify.verifyTwitterToken({
        params: { ...params, accessToken: accessTwitterToken },
      });

      return {
        ...rst,
        accessToken,
      };
    },
    [twitterSign],
  );
}

export function useVerifyFacebookToken() {
  const { facebookSign } = useFacebookAuthentication();
  const verifyZKLogin = useVerifyZKLogin();
  return useCallback(
    async (params: VerifyTokenParams) => {
      console.log('useVerifyFacebookToken params : ', params);
      let accessToken = params.accessToken;
      let idToken = params.idToken;
      const nonce = params.nonce;
      const { isExpired: tokenIsExpired } = parseFacebookJWTToken(idToken, accessToken) || {};
      if (!accessToken || tokenIsExpired) {
        const info = await facebookSign();
        accessToken = info.accessToken || undefined;
        idToken = info.idToken || undefined;
      }
      const { userId } = parseFacebookJWTToken(idToken, accessToken) || {};

      if (userId !== params.id) throw new Error('Account does not match your guardian');

      if (!idToken) {
        throw new Error('Invalid idToken');
      }
      const rst = await verifyZKLogin({
        verifyToken: {
          type: SocialLoginEnum.Facebook,
          jwt: idToken,
          accessToken,
          verifierId: params.verifierId,
          chainId: params.chainId,
          operationType: params.operationType,
        },
        jwt: idToken,
        salt: params.salt ? params.salt : randomId(),
        kid: parseKidFromJWTToken(idToken),
        nonce,
      });

      return {
        ...rst,
        accessToken,
      };
    },
    [facebookSign, verifyZKLogin],
  );
}

export function useReportUnsetLoginGuardian() {
  return useCallback(async (params: ReportUnsetLoginGuardianProps): Promise<boolean> => {
    const res = await request.verify.reportUnsetLoginGuardian({
      params: { ...params },
    });
    return !!res;
  }, []);
}

export function useVerifyToken() {
  const verifyGoogleToken = useVerifyGoogleToken();
  const verifyAppleToken = useVerifyAppleToken();
  const verifyTelegramToken = useVerifyTelegramToken();
  const verifyTwitterToken = useVerifyTwitterToken();
  const verifyFacebookToken = useVerifyFacebookToken();
  const verifyManagerAddress = useVerifyManagerAddress();
  const latestVerifyManagerAddress = useLatestRef(verifyManagerAddress);
  return useCallback(
    (type: LoginType, params: VerifyTokenParams) => {
      let fun = verifyGoogleToken;
      switch (type) {
        case LoginType.Google:
          fun = verifyGoogleToken;
          break;
        case LoginType.Apple:
          fun = verifyAppleToken;
          break;
        case LoginType.Telegram:
          fun = verifyTelegramToken;
          break;
        case LoginType.Twitter:
          fun = verifyTwitterToken;
          break;
        case LoginType.Facebook:
          fun = verifyFacebookToken;
          break;
        default:
          throw new Error('Unsupported login type');
      }
      return fun({
        operationDetails: JSON.stringify({ manager: latestVerifyManagerAddress.current }),
        ...params,
      });
    },
    [
      verifyGoogleToken,
      latestVerifyManagerAddress,
      verifyAppleToken,
      verifyTelegramToken,
      verifyTwitterToken,
      verifyFacebookToken,
    ],
  );
}
export function useVerifierAuth() {
  const verifyToken = useVerifyToken();
  return useCallback(
    async ({
      guardianItem,
      originChainId,
      operationType = OperationTypeEnum.communityRecovery,
      authenticationInfo,
    }: TVerifierAuthParams) => {
      return verifyToken(guardianItem.guardianType, {
        accessToken: authenticationInfo?.[guardianItem.guardianAccount],
        idToken: authenticationInfo?.idToken,
        nonce: authenticationInfo?.nonce,
        salt: guardianItem?.salt,
        id: guardianItem.guardianAccount,
        verifierId: guardianItem.verifier?.id,
        chainId: originChainId,
        operationType,
      });
    },
    [verifyToken],
  );
}
