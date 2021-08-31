import { ref, Ref } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';
import useEthers from '@/composables/useEthers';
import useTransactions from '../useTransactions';
import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { default as abi } from '@/lib/abi/ERC20.json';
import { MaxUint256 } from '@ethersproject/constants';
import { bnum } from '@/lib/utils';
import { erc20ContractService } from '@/services/erc20/erc20-contracts.service';
import {
  DecoratedPool,
  Farm,
  FarmWithPool
} from '@/services/balancer/subgraph/types';
import { masterChefContractsService } from '@/services/farm/master-chef-contracts.service';
import BigNumber from 'bignumber.js';
import { getAddress } from '@ethersproject/address';
import useTokens from '@/composables/useTokens';
import {
  calculateApr,
  calculateRewardsPerDay,
  calculateTvl
} from '@/lib/utils/farm/farmHelper';
import useAverageBlockTime from '@/composables/useAverageBlockTime';

export default function useFarmStats(
  farm?: Farm,
  pool?: DecoratedPool
): {
  calculateTvl: Function;
  calculateApr: Function;
  calculateRewardsPerDay: Function;
} {
  const { blocksPerDay } = useAverageBlockTime();

  function calculateTvl() {
    if (!farm) {
      return 0;
    }
    const { tokens, priceFor } = useTokens();

    if (pool && pool.totalShares !== '0' && farm.slpBalance !== '0') {
      const valuePerShare =
        parseFloat(pool.totalLiquidity) / parseFloat(pool.totalShares);

      return Number(parseInt(farm.slpBalance) / 1e18) * valuePerShare;
    }

    const address = getAddress(farm.pair);
    const price = priceFor(address);

    if (tokens.value[address] && price) {
      return Number(parseInt(farm.slpBalance) / 1e18) * price;
    }

    return 0;
  }

  function calculateRewardsPerDay() {
    if (!farm) {
      return 0;
    }
    //TODO: load the beetxPerBlock from a subgraph
    const totalBeetxPerDay = 3 * blocksPerDay.value;

    return (
      (farm.allocPoint / farm.masterChef.totalAllocPoint) * totalBeetxPerDay
    );
  }

  function calculateApr(farm: FarmWithPool, blocksPerYear: number) {
    const tvl = calculateTvl();
    if (tvl === 0) {
      return 0;
    }

    //TODO: load the beetxPrice from a subgraph
    const beetxPrice = 0.01;
    const beetxPerBlock = Number(
      parseInt(farm.masterChef.beetxPerBlock) / 1e18
    );
    const beetxPerYear = beetxPerBlock * blocksPerYear;
    const farmBeetxPerYear =
      (farm.allocPoint / farm.masterChef.totalAllocPoint) * beetxPerYear;
    const valuePerYear = beetxPrice * farmBeetxPerYear;

    return valuePerYear / tvl;
  }

  return {
    calculateApr,
    calculateTvl,
    calculateRewardsPerDay
  };
}
