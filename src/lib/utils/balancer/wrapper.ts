import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { BigNumberish } from 'ethers';
import { BigNumber } from 'bignumber.js';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import configs from '@/lib/config';
import { configService } from '@/services/config/config.service';
import { getStETHByWstETH, getWstETHByStETH } from './lido';

export enum WrapType {
  NonWrap = 0,
  Wrap,
  Unwrap
}

export const isNativeAssetWrap = (
  tokenIn: string,
  tokenOut: string
): boolean => {
  const nativeAddress = configService.network.nativeAsset.address;
  const { weth } = configService.network.addresses;
  return tokenIn === nativeAddress && tokenOut === weth;
};

export const getWrapAction = (tokenIn: string, tokenOut: string): WrapType => {
  const nativeAddress = configService.network.nativeAsset.address;
  const { weth, stETH, wstETH } = configService.network.addresses;

  if (
    tokenIn.toLowerCase() === nativeAddress.toLowerCase() &&
    tokenOut.toLowerCase() === weth.toLowerCase()
  )
    return WrapType.Wrap;
  if (
    tokenIn.toLowerCase() === stETH.toLowerCase() &&
    tokenOut.toLowerCase() === wstETH.toLowerCase()
  )
    return WrapType.Wrap;

  if (
    tokenOut.toLowerCase() === nativeAddress.toLowerCase() &&
    tokenIn.toLowerCase() === weth.toLowerCase()
  )
    return WrapType.Unwrap;
  if (
    tokenOut.toLowerCase() === stETH.toLowerCase() &&
    tokenIn.toLowerCase() === wstETH.toLowerCase()
  )
    return WrapType.Unwrap;

  return WrapType.NonWrap;
};

export const getWrapOutput = (
  wrapper: string,
  wrapType: WrapType,
  wrapAmount: BigNumberish
) => {
  if (wrapType === WrapType.NonWrap) throw new Error('Invalid wrap type');
  const { weth, wstETH } = configService.network.addresses;

  if (wrapper.toLowerCase() === weth.toLowerCase()) return wrapAmount;
  if (wrapper.toLowerCase() === wstETH.toLowerCase()) {
    return wrapType === WrapType.Wrap
      ? getWstETHByStETH(wrapAmount)
      : getStETHByWstETH(wrapAmount);
  }
  throw new Error('Unknown wrapper');
};

export async function wrap(
  network: string,
  web3: Web3Provider,
  wrapper: string,
  amount: BigNumber
): Promise<TransactionResponse> {
  try {
    if (
      wrapper.toLowerCase() === configs[network].addresses.weth.toLowerCase()
    ) {
      return wrapNative(network, web3, amount);
    } else if (
      wrapper.toLowerCase() === configs[network].addresses.wstETH.toLowerCase()
    ) {
      return wrapLido(network, web3, amount);
    }
    throw new Error('Unrecognised wrapper contract');
  } catch (e) {
    console.log('[Wrapper] Wrap error:', e);
    return Promise.reject(e);
  }
}

export async function unwrap(
  network: string,
  web3: Web3Provider,
  wrapper: string,
  amount: BigNumber
): Promise<TransactionResponse> {
  try {
    if (
      wrapper.toLowerCase() === configs[network].addresses.weth.toLowerCase()
    ) {
      return unwrapNative(network, web3, amount);
    } else if (
      wrapper.toLowerCase() === configs[network].addresses.wstETH.toLowerCase()
    ) {
      return unwrapLido(network, web3, amount);
    }
    throw new Error('Unrecognised wrapper contract');
  } catch (e) {
    console.log('[Wrapper] Unwrap error:', e);
    return Promise.reject(e);
  }
}

const wrapNative = async (
  network: string,
  web3: Web3Provider,
  amount: BigNumber
): Promise<TransactionResponse> =>
  sendTransaction(
    web3,
    configs[network].addresses.weth,
    ['function deposit() payable'],
    'deposit',
    [],
    { value: amount.toString() }
  );

const unwrapNative = (
  network: string,
  web3: Web3Provider,
  amount: BigNumber
): Promise<TransactionResponse> =>
  sendTransaction(
    web3,
    configs[network].addresses.weth,
    ['function withdraw(uint256 wad)'],
    'withdraw',
    [amount.toString()]
  );

const wrapLido = async (
  network: string,
  web3: Web3Provider,
  amount: BigNumber
): Promise<TransactionResponse> =>
  sendTransaction(
    web3,
    configs[network].addresses.wstETH,
    ['function wrap(uint256 _stETHAmount) returns (uint256)'],
    'wrap',
    [amount.toString()]
  );

const unwrapLido = async (
  network: string,
  web3: Web3Provider,
  amount: BigNumber
): Promise<TransactionResponse> =>
  sendTransaction(
    web3,
    configs[network].addresses.wstETH,
    ['function unwrap(uint256 _wstETHAmount) returns (uint256)'],
    'unwrap',
    [amount.toString()]
  );
