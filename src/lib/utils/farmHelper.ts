import { FarmWithPool } from '@/services/balancer/subgraph/types';
import { getAddress } from '@ethersproject/address';
import useTokens from '@/composables/useTokens';
import BigNumber from 'bignumber.js';

export function calculateTvl(farm: FarmWithPool) {
  const { tokens, priceFor } = useTokens();

  console.log('tvl', farm.pool?.totalShares, farm.slpBalance);

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
  const totalBeetxPerDay = new BigNumber(
    farm.masterChef.beetxPerBlock
  ).multipliedBy(blocksPerDay);

  return totalBeetxPerDay
    .multipliedBy(farm.allocPoint / farm.masterChef.totalAllocPoint)
    .dividedBy(1e18)
    .toNumber();
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
