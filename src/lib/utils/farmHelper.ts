import { FarmWithPool } from '@/services/balancer/subgraph/types';
import { getAddress } from '@ethersproject/address';
import useTokens from '@/composables/useTokens';

export function calculateTvl(farm: FarmWithPool) {
  const { tokens, priceFor } = useTokens();

  if (farm.pool && farm.pool.totalShares !== '0' && farm.slpBalance !== '0') {
    const valuePerShare =
      parseFloat(farm.pool.totalLiquidity) / parseFloat(farm.pool.totalShares);

    return Number(parseInt(farm.slpBalance) / 1e18) * valuePerShare;
  }

  const address = getAddress(farm.pair);
  const price = priceFor(address);

  if (tokens.value[address] && price) {
    return Number(parseInt(farm.slpBalance) / 1e18) * price;
  }

  return 0;
}

export function calculateRewardsPerDay(
  farm: FarmWithPool,
  blocksPerDay: number
) {
  //TODO: load the beetxPerBlock from a subgraph
  const totalBeetxPerDay = 3 * blocksPerDay;

  return (farm.allocPoint / farm.masterChef.totalAllocPoint) * totalBeetxPerDay;
}

export function calculateApr(farm: FarmWithPool, blocksPerYear: number) {
  const tvl = calculateTvl(farm);

  if (tvl === 0) {
    return 0;
  }

  console.log('inside apr', blocksPerYear);

  //TODO: load the beetxPrice from a subgraph
  const beetxPrice = 0.01;
  const beetxPerBlock = Number(parseInt(farm.masterChef.beetxPerBlock) / 1e18);
  const beetxPerYear = beetxPerBlock * blocksPerYear;
  const farmBeetxPerYear =
    (farm.allocPoint / farm.masterChef.totalAllocPoint) * beetxPerYear;
  const valuePerYear = beetxPrice * farmBeetxPerYear;

  return valuePerYear / tvl;
}
