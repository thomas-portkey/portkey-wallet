import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import PageContainer from 'components/PageContainer';
import { useLanguage } from 'i18n/hooks';
import navigationService from 'utils/navigationService';
import { IContactProfile } from '@portkey-wallet/types/types-ca/contact';
import CommonButton from 'components/CommonButton';
import GStyles from 'assets/theme/GStyles';
import useRouterParams from '@portkey-wallet/hooks/useRouterParams';
import { defaultColors } from 'assets/theme';
import ProfileHeaderSection from 'pages/My/components/ProfileHeaderSection';
import ProfileHandleSection from 'pages/My/components/ProfileHandleSection';
import ProfileIDSection from 'pages/My/components/ProfileIDSection';
import ProfileAddressSection from 'pages/My/components/ProfileAddressSection';
import im from '@portkey-wallet/im';
import { useIsStranger } from '@portkey-wallet/hooks/hooks-ca/im';
import CommonToast from 'components/CommonToast';
import { pTd } from 'utils/unit';
import { useJumpToChatDetails } from 'hooks/chat';
import { useAddStrangerContact, useContactInfo, useReadImputation } from '@portkey-wallet/hooks/hooks-ca/contact';
import ActionSheet from 'components/ActionSheet';
import { useLatestRef } from '@portkey-wallet/hooks';
import Loading from 'components/Loading';
import useLockCallback from '@portkey-wallet/hooks/useLockCallback';
import ProfileLoginAccountsSection from '../components/ProfileLoginAccountsSection';
import { useFocusEffect } from '@react-navigation/native';

type RouterParams = {
  relationId?: string; // if relationId exist, we should fetch
  contactId?: string;
  isCheckImputation?: boolean;
  isFromNoChatProfileEditPage?: boolean;
};

const ContactProfile: React.FC = () => {
  const {
    contactId,
    relationId,
    isCheckImputation = false,
    isFromNoChatProfileEditPage,
  } = useRouterParams<RouterParams>();

  const { t } = useLanguage();
  const addStranger = useAddStrangerContact();

  const [profileInfo, setProfileInfo] = useState<IContactProfile>();

  const storeContactInfo = useContactInfo({
    contactId,
    relationId,
  });

  const contactInfo = useMemo<IContactProfile | undefined>(
    () => profileInfo || storeContactInfo,
    [storeContactInfo, profileInfo],
  );

  const isStranger = useIsStranger(relationId || contactInfo?.imInfo?.relationId || '');

  const readImputation = useReadImputation();
  const isCheckedImputationRef = useRef(false);
  const checkImputation = useCallback(
    (beCheckedInfo: IContactProfile) => {
      if (isCheckImputation && beCheckedInfo?.isImputation) {
        if (isCheckedImputationRef.current) return;
        isCheckedImputationRef.current = true;

        console.log('readImputation', beCheckedInfo);
        readImputation(beCheckedInfo);
        ActionSheet.alert({
          message:
            'Portkey has grouped contacts with the same Portkey ID together and removed duplicate contacts with the same address.',
          buttons: [
            {
              title: 'OK',
            },
          ],
        });
      }
    },
    [isCheckImputation, readImputation],
  );
  const checkImputationRef = useLatestRef(checkImputation);

  useEffect(() => {
    if (contactInfo) {
      checkImputationRef.current(contactInfo);
    }
  }, [checkImputationRef, contactInfo]);

  const isShowPortkeyId = useMemo(() => !!contactInfo?.caHolderInfo?.userId, [contactInfo?.caHolderInfo?.userId]);

  const navToChatDetail = useJumpToChatDetails();

  const getProfile = useCallback(async () => {
    const isLoadingShow = !contactInfo;
    try {
      isLoadingShow && Loading.show();
      const { data } = await im.service.getProfile({ relationId: relationId || contactInfo?.imInfo?.relationId || '' });

      setProfileInfo(data);
    } catch (error) {
      console.log(error);
      CommonToast.failError(error);
    } finally {
      isLoadingShow && Loading.hide();
    }
  }, [relationId, contactInfo]);
  const getProfileRef = useLatestRef(getProfile);

  useFocusEffect(
    useCallback(() => {
      getProfileRef.current();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const addContact = useLockCallback(async () => {
    try {
      const id = relationId || contactInfo?.imInfo?.relationId || '';
      if (!id) return;
      const result = await addStranger(id);
      setProfileInfo(result.data);
      CommonToast.success('Contact Added');
    } catch (error) {
      console.log('addContact', error);
      CommonToast.failError(error);
    }
  }, [addStranger, contactInfo?.imInfo?.relationId, relationId]);

  return (
    <PageContainer
      titleDom="Details"
      safeAreaColor={['blue', 'gray']}
      containerStyles={pageStyles.pageWrap}
      scrollViewProps={{ disabled: true }}
      leftCallback={isFromNoChatProfileEditPage ? () => navigationService.pop(2) : navigationService.goBack}
      hideTouchable={true}>
      <ScrollView alwaysBounceVertical={true} style={pageStyles.scrollWrap}>
        <ProfileHeaderSection
          noMarginTop={false}
          showRemark={!isStranger}
          name={contactInfo?.caHolderInfo?.walletName || contactInfo?.imInfo?.name || ''}
          remark={contactInfo?.name}
        />
        <ProfileHandleSection
          isAdded={!isStranger}
          onPressAdded={addContact}
          onPressChat={async () => {
            try {
              navToChatDetail({ toRelationId: relationId || contactInfo?.imInfo?.relationId || '' });
            } catch (error) {
              CommonToast.failError(error);
            }
          }}
        />
        <ProfileIDSection
          title={isShowPortkeyId ? 'Portkey ID' : 'ID'}
          id={isShowPortkeyId ? contactInfo?.caHolderInfo?.userId : contactInfo?.imInfo?.relationId}
        />
        <ProfileAddressSection addressList={contactInfo?.addresses || []} />
        <ProfileLoginAccountsSection list={contactInfo?.loginAccounts || []} />
        <View style={pageStyles.blank} />
      </ScrollView>
      {!isStranger && (
        <CommonButton
          type="primary"
          containerStyle={pageStyles.btnWrap}
          onPress={async () => {
            navigationService.navigate('ChatContactProfileEdit', { contact: contactInfo });
          }}>
          {t('Edit')}
        </CommonButton>
      )}
    </PageContainer>
  );
};

export default ContactProfile;

export const pageStyles = StyleSheet.create({
  pageWrap: {
    flex: 1,
    backgroundColor: defaultColors.bg4,
    ...GStyles.paddingArg(0, 0, 18),
  },
  scrollWrap: {
    paddingHorizontal: pTd(20),
  },
  blank: {
    height: pTd(24),
  },
  btnWrap: {
    paddingTop: pTd(16),
    paddingHorizontal: pTd(20),
  },
});
