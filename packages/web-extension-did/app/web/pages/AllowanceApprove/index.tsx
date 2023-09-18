import { useCurrentCaHash, useCurrentWallet, useOriginChainId } from '@portkey-wallet/hooks/hooks-ca/wallet';
import usePromptSearch from 'hooks/usePromptSearch';
import { message } from 'antd';
import { handleErrorMessage } from '@portkey-wallet/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { closeTabPrompt } from 'utils/lib/serviceWorkerAction';
import errorHandler from 'utils/errorHandler';
import { ExtensionContractBasic } from 'utils/sandboxUtil/ExtensionContractBasic';
import aes from '@portkey-wallet/utils/aes';
import InternalMessage from 'messages/InternalMessage';
import InternalMessageTypes from 'messages/InternalMessageTypes';
import { useCurrentChain } from '@portkey-wallet/hooks/hooks-ca/chainList';
import { ResponseCode } from '@portkey/provider-types';
import { ApproveMethod } from '@portkey-wallet/constants/constants-ca/dapp';
import { getLocalStorage } from 'utils/storage/chromeStorage';
import { useCheckManagerSyncState } from 'hooks/wallet';
import { ChainId } from '@portkey-wallet/types';
import { IGuardiansApproved, ManagerApproveInner } from '@portkey/did-ui-react';
import './index.less';

export default function AllowanceApprove() {
  const { origin, chainId, icon, method, transactionInfoId } = usePromptSearch<{
    origin: string;
    transactionInfoId: string;
    icon: string;
    method: string;
    chainId: ChainId;
  }>();
  const caHash = useCurrentCaHash();
  const { walletInfo } = useCurrentWallet();
  const originChainId = useOriginChainId();
  const chainInfo = useCurrentChain(chainId);

  const [txParams, setTxParams] = useState<any>();

  console.log(txParams, '===txParams');

  const privateKeyRef = useRef<string>('');

  const getInitState = useCallback(async () => {
    const getSeedResult = await InternalMessage.payload(InternalMessageTypes.GET_SEED).send();
    const pin = getSeedResult.data.privateKey;
    const privateKey = aes.decrypt(walletInfo.AESEncryptPrivateKey, pin);
    if (!privateKey) return;
    privateKeyRef.current = privateKey;
  }, [walletInfo.AESEncryptPrivateKey]);

  useEffect(() => {
    getInitState();
  }, [getInitState]);

  const onFinish = useCallback(
    async ({ amount, guardiansApproved }: { amount: string; guardiansApproved: IGuardiansApproved[] }) => {
      try {
        if (!txParams) throw Error('invalid params(txParams)');
        if (method !== ApproveMethod.token && method !== ApproveMethod.ca) throw 'Please check method';
        if (!privateKeyRef.current) throw 'Invalid user information, please check';

        if (!chainInfo?.endPoint || !caHash) {
          closeTabPrompt({
            ...errorHandler(400001),
            data: { code: ResponseCode.ERROR_IN_PARAMS, msg: 'invalid params' },
          });
          return;
        }
        if (chainInfo?.endPoint !== txParams?.rpcUrl) {
          closeTabPrompt({
            ...errorHandler(400001),
            data: { code: ResponseCode.ERROR_IN_PARAMS, msg: 'invalid rpcUrl' },
          });
          return;
        }
        const contract = await new ExtensionContractBasic({
          privateKey: privateKeyRef.current,
          rpcUrl: chainInfo.endPoint,
          contractAddress: chainInfo.caContractAddress,
        });

        const options = {
          caHash,
          spender: txParams.params.paramsOption.spender,
          symbol: txParams.params.paramsOption.symbol,
          amount,
          guardiansApproved,
        };
        console.log(options, 'ManagerApprove==options====');
        const result = await contract.callSendMethod('ManagerApprove', '', options, {
          onMethod: 'transactionHash',
        });
        console.log(result, 'ManagerApprove==result====');
        closeTabPrompt({
          ...errorHandler(0),
          data: result.data,
        });
      } catch (error) {
        closeTabPrompt(errorHandler(700002, handleErrorMessage(error)));
      }
    },
    [caHash, chainInfo, method, txParams],
  );

  const checkManagerSyncState = useCheckManagerSyncState();
  const [, setIsManagerSynced] = useState(false);

  const getTxPayload = useCallback(async () => {
    const txPayload = await getLocalStorage<{ [x: string]: any }>('txPayload');

    if (!txPayload[transactionInfoId]) {
      closeTabPrompt({
        ...errorHandler(400001),
        data: { code: ResponseCode.ERROR_IN_PARAMS },
      });
      return;
    }
    const params = JSON.parse(txPayload[transactionInfoId]);

    setTxParams(params);
    const _isManagerSynced = await checkManagerSyncState(chainId);
    setIsManagerSynced(_isManagerSynced);
    if (_isManagerSynced) {
      // getFee(params);
      // setErrMsg('');
    } else {
      message.error('Synchronizing on-chain account information...', 10000);
    }
  }, [checkManagerSyncState, chainId, transactionInfoId]);

  useEffect(() => {
    getTxPayload();
  }, [getTxPayload]);

  return (
    <div className="common-content1">
      {txParams && (
        <ManagerApproveInner
          originChainId={originChainId}
          caHash={caHash || ''}
          amount={txParams.params.paramsOption.amount}
          symbol={txParams.params.paramsOption.symbol}
          dappInfo={{
            icon,
            href: origin,
            name: new URL(origin).hostname,
          }}
          onCancel={() => {
            closeTabPrompt(errorHandler(200003));
          }}
          onFinish={onFinish}
          onError={(error) => {
            message.error(handleErrorMessage(error));
          }}
        />
      )}
    </div>
  );
}
