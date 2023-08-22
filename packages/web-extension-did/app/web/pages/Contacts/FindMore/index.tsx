import { ChangeEvent, ChangeEventHandler, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import CustomModal from 'pages/components/CustomModal';
import { useCommonState, useWalletInfo } from 'store/Provider/hooks';
import { ContactItemType } from '@portkey-wallet/types/types-ca/contact';
import FindMorePrompt from './Prompt';
import FindMorePopup from './Popup';
import { BaseHeaderProps } from 'types/UI';
import im from '@portkey-wallet/im';
import { useDebounceCallback } from '@portkey-wallet/hooks';
import { message } from 'antd';
import { handleErrorMessage } from '@portkey-wallet/utils';
import { useContactRelationIdMap } from '@portkey-wallet/hooks/hooks-ca/contact';
import { useIsChatShow } from '@portkey-wallet/hooks/hooks-ca/cms';
import { getAddressInfo } from '@portkey-wallet/utils/aelf';

export interface IFindMoreProps extends BaseHeaderProps {
  myPortkeyId: string;
  contact: Partial<ContactItemType>;
  showChat: boolean;
  isAdded?: boolean;
  isSearch?: boolean;
  goBack: () => void;
  handleSearch: ChangeEventHandler<HTMLInputElement>;
  clickItem: () => void;
  clickChat: (e: any, item: Partial<ContactItemType>) => void;
}

export default function FindMore() {
  const navigate = useNavigate();
  const { isPrompt, isNotLessThan768 } = useCommonState();
  const { state } = useLocation();
  const showChat = useIsChatShow();
  const { userId } = useWalletInfo();
  const contactRelationIdMap = useContactRelationIdMap();
  const [isAdded, setIsAdded] = useState(false);
  const [isSearch, setIsSearch] = useState(false);

  const headerTitle = 'Find More';
  const [contact, setContact] = useState({});
  // mock data
  // {
  //   index: 'B',
  //   name: 'by',
  //   addresses: [{ chainId: 'AELF' as ChainId, address: 'H8CXvfy' }],
  //   userId: '3fe8e56b',
  //   isDeleted: false,
  //   modificationTime: 1684829521408,
  //   id: '0be66c93',
  // },

  const handleSearch = useDebounceCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (!value) {
      setContact({});
      setIsAdded(false);
      setIsSearch(false);
      return;
    }
    try {
      const addressTrans = getAddressInfo(value.trim());
      const res = await im.service.getUserInfo({ address: addressTrans.address });

      if (res?.data?.portkeyId === userId) {
        message.error('Unable to add yourself as a contact');
      } else {
        setContact({ ...res?.data, index: res?.data?.name?.substring(0, 1).toLocaleUpperCase() });
        setIsAdded(!!contactRelationIdMap?.[res?.data?.relationId]);
        setIsSearch(true);
      }
    } catch (error) {
      const err = handleErrorMessage(error, 'handle display error');
      message.error(err);
      setContact({});
      setIsAdded(false);
      setIsSearch(false);
    }
  }, []);

  const goBack = () => {
    if (state?.from === 'chat-search') {
      navigate('/chat-list-search', { state });
    } else {
      navigate(-1);
    }
  };

  const handleChat = useCallback(
    (e: any, item: Partial<ContactItemType>) => {
      e.stopPropagation();

      if (isPrompt) {
        CustomModal({
          content: (
            <>{`Please click on the Portkey browser extension in the top right corner to access the chat feature`}</>
          ),
        });
      } else {
        navigate('/setting/contacts/view', { state: item });
      }
    },
    [isPrompt, navigate],
  );

  return isNotLessThan768 ? (
    <FindMorePrompt
      headerTitle={headerTitle}
      myPortkeyId={userId || ''}
      contact={contact}
      showChat={showChat}
      isAdded={isAdded}
      isSearch={isSearch}
      goBack={goBack}
      handleSearch={handleSearch}
      clickItem={() => {
        navigate('/setting/contacts/view', { state: contact });
      }}
      clickChat={(e, item) => handleChat(e, item)}
    />
  ) : (
    <FindMorePopup
      headerTitle={headerTitle}
      myPortkeyId={userId || ''}
      contact={contact}
      showChat={showChat}
      isAdded={isAdded}
      isSearch={isSearch}
      goBack={goBack}
      handleSearch={handleSearch}
      clickItem={() => {
        navigate('/setting/contacts/view', { state: contact });
      }}
      clickChat={(e, item) => handleChat(e, item)}
    />
  );
}
