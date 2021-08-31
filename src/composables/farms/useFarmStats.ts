import { FarmWithPool } from '@/services/balancer/subgraph/types';
import { Ref } from 'vue';
import useTokens from '@/composables/useTokens';
import { getAddress } from '@ethersproject/address';
import useAverageBlockTime from '@/composables/useAverageBlockTime';

export default function useFarmStats(farm: FarmWithPool) {
  const { tokens, priceFor } = useTokens();
  const { blocksPerDay, blocksPerYear } = useAverageBlockTime();

  function calculateTvl() {
    if (farm.pool && farm.pool.totalShares !== '0' && farm.slpBalance !== '0') {
      const valuePerShare =
        parseFloat(farm.pool.totalLiquidity) /
        parseFloat(farm.pool.totalShares);

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
    //TODO: load the beetxPerBlock from a subgraph
    const totalBeetxPerDay = 3 * blocksPerDay.value;

    return (
      (farm.allocPoint / farm.masterChef.totalAllocPoint) * totalBeetxPerDay
    );
  }

  function calculateApr() {
    const tvl = calculateTvl();

    if (tvl === 0) {
      return 0;
    }

    console.log('inside apr', blocksPerYear);

    //TODO: load the beetxPrice from a subgraph
    const beetxPrice = 0.01;
    const beetxPerBlock = Number(
      parseInt(farm.masterChef.beetxPerBlock) / 1e18
    );
    const beetxPerYear = beetxPerBlock * blocksPerYear.value;
    const farmBeetxPerYear =
      (farm.allocPoint / farm.masterChef.totalAllocPoint) * beetxPerYear;
    const valuePerYear = beetxPrice * farmBeetxPerYear;

    return valuePerYear / tvl;
  }

  return {
    calculateApr,
    calculateRewardsPerDay,
    calculateTvl
  };
}
