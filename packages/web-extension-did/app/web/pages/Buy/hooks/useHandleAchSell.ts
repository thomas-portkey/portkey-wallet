import { ACH_MERCHANT_NAME } from '@portkey-wallet/constants/constants-ca/payment';
import { useAssets } from '@portkey-wallet/hooks/hooks-ca/assets';
import { useCurrentChain } from '@portkey-wallet/hooks/hooks-ca/chainList';
import { useSellTransfer } from '@portkey-wallet/hooks/hooks-ca/payment';
import { useCurrentWalletInfo } from '@portkey-wallet/hooks/hooks-ca/wallet';
import { AchTxAddressReceivedType } from '@portkey-wallet/types/types-ca/payment';
import { timesDecimals } from '@portkey-wallet/utils/converter';
import { message } from 'antd';
import { useCallback, useMemo } from 'react';
import { useLoading } from 'store/Provider/hooks';
import { useCurrentNetworkInfo } from '@portkey-wallet/hooks/hooks-ca/network';
import aes from '@portkey-wallet/utils/aes';
import InternalMessage from 'messages/InternalMessage';
import InternalMessageTypes from 'messages/InternalMessageTypes';
import getTransactionRaw from 'utils/sandboxUtil/getTransactionRaw';
import AElf from 'aelf-sdk';
import { getWallet } from '@portkey-wallet/utils/aelf';
import SparkMD5 from 'spark-md5';
import { chromeStorage } from 'store/utils';

export const useHandleAchSell = () => {
  const { setLoading } = useLoading();
  const sellTransfer = useSellTransfer();

  const { accountToken } = useAssets();
  const aelfToken = useMemo(
    () => accountToken.accountTokenList.find((item) => item.symbol === 'ELF' && item.chainId === 'AELF'),
    [accountToken],
  );
  const chainInfo = useCurrentChain('AELF');
  const wallet = useCurrentWalletInfo();
  const currentNetwork = useCurrentNetworkInfo();

  const paymentSellTransfer = useCallback(
    async (params: AchTxAddressReceivedType) => {
      if (!chainInfo) throw new Error('Sell Transfer: No ChainInfo');

      const getSeedResult = await InternalMessage.payload(InternalMessageTypes.GET_SEED).send();
      const pin = getSeedResult.data.privateKey;
      const privateKey = await aes.decrypt(wallet.AESEncryptPrivateKey, pin);
      if (!privateKey) throw new Error('Sell Transfer: No PrivateKey');

      if (!aelfToken) throw new Error('Sell Transfer: No Token');
      const manager = getWallet(privateKey);
      if (!manager?.keyPair) throw new Error('Sell Transfer: No keyPair');
      const guardiansApprovedStr = await chromeStorage.getItem('portkeyOffRampGuardiansApproveList');
      const rawResult = await getTransactionRaw({
        contractAddress: chainInfo.caContractAddress,
        rpcUrl: chainInfo?.endPoint || '',
        chainType: currentNetwork.walletType,
        methodName: 'ManagerForwardCall',
        privateKey,
        paramsOption: {
          caHash: wallet?.caHash || '',
          contractAddress: aelfToken.tokenContractAddress || '',
          methodName: 'Transfer',
          args: {
            symbol: aelfToken.symbol,
            to: `ELF_${params.address}_AELF`,
            amount: timesDecimals(params.cryptoAmount, aelfToken.decimals).toNumber(),
          },
          guardiansApproved: JSON.parse(guardiansApprovedStr || ''),
        },
      });
      if (!rawResult || !rawResult.result) {
        throw new Error('Failed to get raw transaction.');
      }
      const publicKey = manager.keyPair.getPublic('hex');
      const message = SparkMD5.hash(`${params.orderId}${rawResult.result.data}`);
      const signature = AElf.wallet.sign(Buffer.from(message).toString('hex'), manager.keyPair).toString('hex');
      return {
        rawTransaction: rawResult.result.data,
        publicKey,
        signature,
      };
    },
    [aelfToken, chainInfo, currentNetwork.walletType, wallet.AESEncryptPrivateKey, wallet?.caHash],
  );

  return useCallback(
    async (orderId: string) => {
      try {
        setLoading(true, 'Payment is being processed and may take around 10 seconds to complete.');
        await sellTransfer({
          merchantName: ACH_MERCHANT_NAME,
          orderId,
          paymentSellTransfer,
        });
        message.success('Transaction completed.');
      } catch (error: any) {
        if (error?.code === 'TIMEOUT') {
          message.warn(error?.message || 'The waiting time is too long, it will be put on hold in the background.');
        } else {
          message.error(error.message);
        }
      } finally {
        setLoading(false);
      }
    },
    [paymentSellTransfer, sellTransfer, setLoading],
  );
};
