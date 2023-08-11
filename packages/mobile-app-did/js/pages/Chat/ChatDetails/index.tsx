import React, { useCallback } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import PageContainer from 'components/PageContainer';
import { defaultColors } from 'assets/theme';
import GStyles from 'assets/theme/GStyles';
import { pTd } from 'utils/unit';
import { TextM } from 'components/CommonText';

import Chats from '../components/Chats';
import Svg from 'components/Svg';
import Touchable from 'components/Touchable';
import ChatOverlay from '../components/ChatOverlay';
import navigationService from 'utils/navigationService';
import { ChatOperationsEnum } from '@portkey-wallet/constants/constants-ca/chat';

const ChatDetails = () => {
  const onPressMore = useCallback((event: { nativeEvent: { pageX: any; pageY: any } }) => {
    const { pageX, pageY } = event.nativeEvent;
    ChatOverlay.showChatPopover({
      list: [
        { title: ChatOperationsEnum.PROFILE, onPress: () => navigationService.navigate('Profile') },
        { title: ChatOperationsEnum.MUTE },
      ],
      px: pageX,
      py: pageY,
      position: 'left',
    });
  }, []);

  return (
    <PageContainer
      hideTouchable
      safeAreaColor={['blue', 'gray']}
      scrollViewProps={{ disabled: true }}
      containerStyles={styles.container}
      titleDom={
        <View style={GStyles.flexRow}>
          <Image
            source={{ uri: 'https://lmg.jj20.com/up/allimg/1111/05161Q64001/1P516164001-3-1200.jpg' }}
            style={{ width: 40, height: 40 }}
          />
          <TextM>Masosn</TextM>
        </View>
      }
      rightDom={
        <Touchable onPress={onPressMore}>
          <Svg size={30} icon="more" color={defaultColors.bg1} />
        </Touchable>
      }>
      <Chats />
    </PageContainer>
  );
};

export default ChatDetails;

const styles = StyleSheet.create({
  container: {
    backgroundColor: defaultColors.bg4,
    flex: 1,
    ...GStyles.paddingArg(0),
  },
  svgWrap: {
    padding: pTd(16),
  },
});
