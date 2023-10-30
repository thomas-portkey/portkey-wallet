import { defaultColors } from 'assets/theme';
import Svg from 'components/Svg';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { pTd } from 'utils/unit';
import navigationService from 'utils/navigationService';
import PageContainer from 'components/PageContainer';
import { useLanguage } from 'i18n/hooks';
import { useGuardiansInfo } from 'hooks/store';
import GuardianItem from 'pages/Guardian/components/GuardianItem';
import Touchable from 'components/Touchable';
import { useGetVerifierServers, useRefreshGuardiansList } from 'hooks/guardian';
import useEffectOnce from 'hooks/useEffectOnce';
import GStyles from 'assets/theme/GStyles';

export default function GuardianHome() {
  const { t } = useLanguage();

  const { userGuardiansList } = useGuardiansInfo();
  const guardianList = useMemo(() => {
    if (!userGuardiansList) return [];
    return [...userGuardiansList].reverse();
  }, [userGuardiansList]);

  const getVerifierServers = useGetVerifierServers();
  const refreshGuardiansList = useRefreshGuardiansList();

  const init = useCallback(async () => {
    try {
      await getVerifierServers();
      refreshGuardiansList();
    } catch (error) {
      console.log(error, '==error');
    }
  }, [getVerifierServers, refreshGuardiansList]);
  useEffectOnce(() => {
    init();
  });

  const renderGuardianBtn = useCallback(
    () => <Svg icon="right-arrow" color={defaultColors.icon1} size={pTd(16)} />,
    [],
  );

  return (
    <PageContainer
      safeAreaColor={['blue', 'white']}
      titleDom={t('Guardians')}
      containerStyles={pageStyles.pageWrap}
      scrollViewProps={{ disabled: false }}
      rightDom={
        <TouchableOpacity
          style={{ padding: pTd(16) }}
          onPress={() => {
            navigationService.navigate('GuardianEdit');
          }}>
          <Svg icon="add1" size={pTd(20)} color={defaultColors.font2} />
        </TouchableOpacity>
      }>
      <View>
        {guardianList.map((guardian, idx) => (
          <Touchable
            key={idx}
            onPress={() => {
              navigationService.navigate('GuardianDetail', { guardian });
            }}>
            <GuardianItem
              guardianItem={guardian}
              isButtonHide
              renderBtn={renderGuardianBtn}
              isBorderHide={idx === guardianList.length - 1}
            />
          </Touchable>
        ))}
      </View>
    </PageContainer>
  );
}

const pageStyles = StyleSheet.create({
  pageWrap: {
    flex: 1,
    backgroundColor: defaultColors.bg1,
    ...GStyles.paddingArg(16, 20),
  },
});
