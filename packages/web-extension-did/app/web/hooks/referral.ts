import { useCurrentNetworkInfo } from '@portkey-wallet/hooks/hooks-ca/network';
import { useReferral } from '@portkey-wallet/hooks/hooks-ca/referral';
import { useCallback } from 'react';
import singleMessage from 'utils/singleMessage';

export const useClickReferral = () => {
  const { setViewReferralStatusStatus, referralLink } = useReferral();
  const currentNetworkInfo = useCurrentNetworkInfo();
  return useCallback(() => {
    if (!referralLink) {
      singleMessage.info('loading...');
      return;
    }
    setViewReferralStatusStatus();
    const url = `${currentNetworkInfo?.referralUrl}/referral?shortLink=${referralLink}`;
    const openWinder = window.open(url, '_blank');
    if (openWinder) {
      openWinder.opener = null;
    }
  }, [currentNetworkInfo.referralUrl, referralLink, setViewReferralStatusStatus]);
};
