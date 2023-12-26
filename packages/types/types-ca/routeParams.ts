import { ChainId, ChainType } from '..';
import type { SendType } from './send';

export interface IToSendHomeAssetParamsBaseType {
  symbol: string;
  chainId: ChainId;
  balance: string;
  imageUrl: string;
  tokenContractAddress: string;
  [key: string]: any;
}

export interface IToSendTokenParamsType extends IToSendHomeAssetParamsBaseType {
  balanceInUsd: string;
  decimals: string;
}

export interface IToSendNftParamsType extends IToSendHomeAssetParamsBaseType {
  alias: string;
  tokenId: string;
}

export type IToSendAssetParamsType = IToSendTokenParamsType | IToSendNftParamsType;

export type ImTransferInfoType = {
  isGroupChat?: boolean;
  channelId?: string;
  toUserId?: string;
  name?: string;
  addresses?: { address: string; chainId: ChainId; chainName?: string }[];
};
export interface IToSendHomeParamsType {
  sendType: SendType;
  toInfo: {
    address: string;
    name: string;
    chainId?: ChainId;
    chainType?: ChainType;
  };
  assetInfo: IToSendAssetParamsType;
  imTransferInfo?: ImTransferInfoType;
}

export interface IToSendPreviewParamsType extends IToSendHomeParamsType {
  transactionFee: string | number;
  sendNumber: string | number;
  successNavigateName?: any;
}
