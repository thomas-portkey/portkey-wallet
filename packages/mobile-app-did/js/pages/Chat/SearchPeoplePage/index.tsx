import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import GStyles from 'assets/theme/GStyles';
import { defaultColors } from 'assets/theme';
import { pTd } from 'utils/unit';
import navigationService from 'utils/navigationService';
import PageContainer from 'components/PageContainer';
import InputWithCancel from 'components/InputWithCancel';
import { useFocusEffect } from '@react-navigation/native';
import NoData from 'components/NoData';
import { TextL } from 'components/CommonText';
import Touchable from 'components/Touchable';
import FindMoreButton from '../components/FindMoreButton';
import { screenWidth } from '@portkey-wallet/utils/mobile/device';
import CommonAvatar from 'components/CommonAvatar';
import { useSearchChannel } from '@portkey-wallet/hooks/hooks-ca/im';
import useDebounce from 'hooks/useDebounce';
import useLockCallback from '@portkey-wallet/hooks/useLockCallback';
import CommonToast from 'components/CommonToast';
import { ChannelItem } from '@portkey-wallet/im/types';
import { useJumpToChatDetails, useJumpToChatGroupDetails } from 'hooks/chat';
import { Input } from '@rneui/base';
import LottieLoading from 'components/LottieLoading';

export default function SearchPeople() {
  const iptRef = useRef<Input>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [loading, setLoading] = useState(false);
  const searchChannel = useSearchChannel();
  const navToChatDetails = useJumpToChatDetails();
  const navToGroupChatDetails = useJumpToChatGroupDetails();

  const [keyword, setKeyword] = useState('');
  const debounceKeyword = useDebounce(keyword, 500);
  const [filterList, setFilterList] = useState<ChannelItem[]>([]);

  const fetchList = useLockCallback(async () => {
    try {
      setLoading(true);
      const list = await searchChannel(debounceKeyword);
      setFilterList(list);
    } catch (error) {
      CommonToast.failError(error);
    } finally {
      setLoading(false);
    }
  }, [debounceKeyword]);

  useEffect(() => {
    if (!debounceKeyword) return setFilterList([]);
    fetchList();
  }, [debounceKeyword, fetchList]);

  useFocusEffect(
    useCallback(() => {
      if (iptRef?.current) {
        timerRef.current = setTimeout(() => {
          iptRef.current?.focus();
        }, 300);
      }
    }, []),
  );

  useEffect(
    () => () => {
      if (timerRef?.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: ChannelItem }) => {
      const { toRelationId = '', channelUuid = '', displayName = '' } = item;
      return (
        <Touchable
          style={[GStyles.flexRow, GStyles.itemCenter, styles.itemWrap]}
          onPress={() => {
            item.channelType === 'G'
              ? navToGroupChatDetails({ toRelationId, channelUuid })
              : navToChatDetails({ toRelationId, channelUuid });
          }}>
          <CommonAvatar
            title={displayName}
            hasBorder
            svgName={item.channelType === 'G' ? 'chat-group-avatar' : undefined}
            avatarSize={pTd(36)}
            style={styles.avatarStyle}
          />
          <View style={styles.rightSection}>
            <TextL numberOfLines={1}>{displayName}</TextL>
          </View>
        </Touchable>
      );
    },
    [navToChatDetails, navToGroupChatDetails],
  );

  return (
    <PageContainer
      hideHeader
      safeAreaColor={['blue', 'white']}
      scrollViewProps={{ disabled: true }}
      hideTouchable={true}
      containerStyles={styles.containerStyles}
      titleDom="Search">
      <InputWithCancel
        ref={iptRef as any}
        placeholder="Name in Chats"
        value={keyword}
        clearText={() => setKeyword('')}
        onChangeText={v => setKeyword(v)}
        onCancel={() => navigationService.goBack()}
      />
      <FindMoreButton />
      {loading ? (
        <LottieLoading />
      ) : (
        <FlatList
          data={filterList}
          ListHeaderComponent={
            debounceKeyword && filterList.length > 0 ? <TextL style={styles.listHeader}>Chats</TextL> : null
          }
          ListEmptyComponent={debounceKeyword ? <NoData noPic message="No search result" /> : null}
          renderItem={renderItem}
        />
      )}
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  containerStyles: {
    backgroundColor: defaultColors.bg1,
    paddingHorizontal: 0,
    flex: 1,
  },
  listHeader: {
    ...GStyles.paddingArg(16, 20, 8),
    color: defaultColors.font9,
  },
  itemWrap: {
    width: screenWidth,
    height: pTd(72),
  },
  avatarStyle: {
    marginHorizontal: pTd(20),
    marginVertical: pTd(18),
  },
  rightSection: {
    height: pTd(72),
    flex: 1,
    borderBottomColor: defaultColors.border6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingRight: pTd(20),
    justifyContent: 'center',
  },
});
