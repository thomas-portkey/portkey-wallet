import { ChainId, ChainType, NetworkType } from '@portkey-wallet/types';
import { isAddress as web3IsAddress } from 'web3-utils';
import { isAelfAddress, isDIDAelfAddress } from './aelf';
import * as uuid from 'uuid';

/**
 * format address like "aaa...bbb" to "ELF_aaa...bbb_AELF"
 * @param address
 * @param chainId
 * @param chainType
 * @returns
 */
export const addressFormat = (
  address: string = 'address',
  chainId: ChainId = 'AELF',
  chainType: ChainType = 'aelf',
): string => {
  if (chainType !== 'aelf') return address;
  const arr = address.split('_');
  if (address.includes('_') && arr.length < 3) return address;
  if (address.includes('_')) return `ELF_${arr[1]}_${chainId}`;
  return `ELF_${address}_${chainId}`;
};

export function isAddress(address: string, chainType: ChainType = 'aelf') {
  if (chainType === 'aelf') return isAelfAddress(address);
  return web3IsAddress(address);
}

export function isDIDAddress(address: string, chainType: ChainType = 'aelf') {
  if (chainType === 'aelf') return isDIDAelfAddress(address);
  return web3IsAddress(address);
}

export const getChainIdByAddress = (address: string, chainType: ChainType = 'aelf') => {
  // if (!isAddress(address)) throw Error(`${address} is not address`);

  if (chainType === 'aelf') {
    if (address.includes('_')) {
      const arr = address.split('_');
      return arr[arr.length - 1];
    } else {
      return 'AELF';
    }
  }
  throw Error('Not support');
};

const protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;
const localhostDomainRE = /^localhost[\:?\d]*(?:[^\:?\d]\S*)?$/;
const nonLocalhostDomainRE = /^[^\s\.]+\.\S{2,}$/;

export function isUrl(string: string) {
  if (typeof string !== 'string') {
    return false;
  }

  const match = string.match(protocolAndDomainRE);
  if (!match) {
    return false;
  }

  const everythingAfterProtocol = match[1];
  if (!everythingAfterProtocol) {
    return false;
  }

  if (localhostDomainRE.test(everythingAfterProtocol) || nonLocalhostDomainRE.test(everythingAfterProtocol)) {
    return true;
  }

  return false;
}

export const enumToMap = (v: object) => {
  const newMap: any = {};
  Object.entries(v).forEach(([index, value]) => {
    newMap[index] = value;
    newMap[value] = index;
  });
  return newMap;
};

export function formatRpcUrl(rpc: string) {
  rpc = rpc.trim();
  const length = rpc.length;
  if (rpc[length - 1] === '/') return rpc.slice(0, length - 1);
  return rpc;
}

/**
 *
 * @param str
 * @param keyword
 * @returns
 */
export function strIncludes(str: string, keyword: string) {
  return str.toLocaleUpperCase().includes(keyword.toLocaleUpperCase().trim());
}

export const sleep = (time: number) => {
  return new Promise<void>(resolve => {
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      resolve();
    }, time);
  });
};

export function getExploreLink(
  explorerUrl: string,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block' = 'address',
): string {
  const prefix = explorerUrl[explorerUrl.length - 1] !== '/' ? explorerUrl + '/' : explorerUrl;
  switch (type) {
    case 'transaction': {
      return `${prefix}tx/${data}`;
    }
    case 'token': {
      return `${prefix}token/${data}`;
    }
    case 'block': {
      return `${prefix}block/${data}`;
    }
    case 'address':
    default: {
      return `${prefix}address/${data}`;
    }
  }
}

export function isPrivateKey(privateKey?: string) {
  try {
    if (privateKey && typeof privateKey === 'string')
      return Uint8Array.from(Buffer.from(privateKey, 'hex')).length === 32;
  } catch (error) {
    return false;
  }
  return false;
}

export const isExtension = () => process.env.DEVICE === 'extension';

export const randomId = () => uuid.v4().replace(/-/g, '');

export const handleError = (error: any) => {
  return error?.error || error;
};

export const handleErrorMessage = (error: any, errorText?: string) => {
  error = handleError(error);
  if (!error) return errorText;
  if (typeof error === 'string') return error;
  if (typeof error.message === 'string') return error.message;
  return errorText;
};

export const chainShowText = (chain: ChainId) => (chain === 'AELF' ? 'MainChain' : 'SideChain');
export const handleErrorCode = (error: any) => {
  return handleError(error)?.code;
};

/**
 * format information like "MainChain AELF" or "MainChain AELF Testnet"
 * @param chainId
 * @param isMainChain
 * @returns
 */
export const formatChainInfoToShow = (
  chainId: ChainId = 'AELF',
  networkType?: NetworkType,
  chainType: ChainType = 'aelf',
): string => {
  if (chainType !== 'aelf') return chainType;
  if (typeof networkType === 'string')
    return `${chainId === 'AELF' ? 'MainChain' : 'SideChain'} ${chainId} ${networkType === 'MAIN' ? '' : 'Testnet'}`;

  return `${chainId === 'AELF' ? 'MainChain' : 'SideChain'} ${chainId}`;
};

/**
 * this function is to format address,just like "formatStr2EllipsisStr" ---> "for...ess"
 * @param address
 * @param digit
 * @param type
 * @returns
 */
export const formatStr2EllipsisStr = (address = '', digit = 10, type: 'middle' | 'tail' = 'middle'): string => {
  if (!address) return '';

  const len = address.length;

  if (type === 'tail') return `${address.slice(0, digit)}...`;

  if (len < 2 * digit) return address;
  const pre = address.substring(0, digit);
  const suffix = address.substring(len - digit - 1);
  return `${pre}...${suffix}`;
};

/**
 * "aelf:ELF_xxx_AELF" to "ELF_xxx_AELF"
 * @param address
 * @returns
 */
export const formatAddress2NoPrefix = (address: string): string => {
  if (address.match(/^aelf:.+/)) {
    return address.split(':')[1];
  }
  return address;
};

/**
 * check current networkType
 * @param network
 * @returns
 */
export const isMainNet = (network: NetworkType): boolean => network === 'MAIN';

export const getAddressChainId = (toAddress: string, defaultChainId: ChainId) => {
  if (!toAddress.includes('_')) return defaultChainId;
  const arr = toAddress.split('_');
  const addressChainId = arr[arr.length - 1];
  // no suffix
  if (isAelfAddress(addressChainId)) {
    return defaultChainId;
  }
  return addressChainId;
};

/**
 *  check is the same address
 * @param address1
 * @param address2
 * @returns
 */
export const isSameAddresses = (address1: string, address2: string): boolean => address1.trim() === address2.trim();

export function handlePhoneNumber(str?: string) {
  if (str) {
    str = str.replace(/\s/g, '');
    if (str[0] !== '+') str = '+' + str;
  }
  return str || '';
}

export const handleLoopFetch = async <T>(
  fetch: () => Promise<T>,
  times = 0,
  interval = 0,
  checkIsContinue?: () => boolean,
): Promise<T> => {
  try {
    return await fetch();
  } catch (error) {
    const isContinue = checkIsContinue ? checkIsContinue() : true;
    if (!isContinue) throw new Error('fetch invalid');
    if (times === 1) throw error;
    console.log('handleLoopFetch: error', times, error);
  }
  await sleep(interval);
  return handleLoopFetch(fetch, times - 1, interval, checkIsContinue);
};
