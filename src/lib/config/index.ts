import rinkeby from './rinkeby.json';
import fantom from './fantom.json';

export interface Config {
  key: string;
  chainId: number;
  chainName: string;
  name: string;
  shortName: string;
  network: string;
  unknown: boolean;
  rpc: string;
  publicRpc?: string;
  ws: string;
  loggingRpc: string;
  explorer: string;
  subgraph: string;
  farmSubgraph?: string;
  blockSubgraph?: string;
  poolsUrlV1: string;
  poolsUrlV2: string;
  nativeAsset: {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    deeplinkId: string;
    logoURI: string;
  };
  addresses: {
    exchangeProxy: string;
    merkleRedeem: string;
    multicall: string;
    vault: string;
    masterChef: string;
    weightedPoolFactory: string;
    stablePoolFactory: string;
    weth: string;
    stETH: string;
    wstETH: string;
    lidoRelayer: string;
    balancerHelpers: string;
  };
  strategies: Record<
    string,
    {
      type: string;
      name: string;
    }
  >;
}

const config: Record<string, Config> = {
  //'1': homestead,
  //'42': kovan,
  '4': rinkeby,
  '250': fantom
  //'137': polygon,
  //'12345': test,
  //'43113': fuji,
  // @ts-ignore
  //'17': docker
};

export default config;
