import {
  DecoratedPool,
  Farm,
  FarmUser,
  FarmWithPool,
  Pool
} from '@/services/balancer/subgraph/types';
import { getAddress } from '@ethersproject/address';
import useTokens from '@/composables/useTokens';
import BigNumber from 'bignumber.js';
import { computed } from 'vue';
import numeral from 'numeral';

export function decorateFarms(
  pools: DecoratedPool[],
  farms: Farm[],
  allFarmsForUser: FarmUser[],
  blocksPerYear: number,
  blocksPerDay: number,
  beetsPrice: number
) {
  console.log('inside decorate farms');
  if (farms.length === 0 || pools.length === 0) {
    return [];
  }

  return farms.map(farm => {
    const pool = pools.find(
      pool => pool.address.toLowerCase() === farm.pair.toLowerCase()
    );
    const farmUser = allFarmsForUser.find(
      userFarm => userFarm.pool.id === farm.id
    );

    const farmWithPool: FarmWithPool = { ...farm, pool };
    const tvl = calculateTvl(farmWithPool);
    const apr = calculateApr(farmWithPool, blocksPerYear, beetsPrice);
    const userShare = new BigNumber(farmUser?.amount || 0)
      .div(farm.slpBalance)
      .toNumber();

    return {
      ...farm,
      pool,
      tvl,
      rewards: calculateRewardsPerDay(farmWithPool, blocksPerDay),
      apr,
      stake: tvl * userShare,
      pendingBeets: farmUser?.pendingBeets || 0,
      pendingBeetsValue: (farmUser?.pendingBeets || 0) * beetsPrice
    };
  });
}

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
  const totalBeetsPerDay = new BigNumber(
    farm.masterChef.beetsPerBlock
  ).multipliedBy(blocksPerDay);

  return totalBeetsPerDay
    .multipliedBy(farm.allocPoint / farm.masterChef.totalAllocPoint)
    .dividedBy(1e18)
    .toNumber();
}

export function calculateApr(
  farm: FarmWithPool,
  blocksPerYear: number,
  beetsPrice: number
) {
  const tvl = calculateTvl(farm);

  if (tvl === 0) {
    return 0;
  }

  const beetsPerBlock = Number(parseInt(farm.masterChef.beetsPerBlock) / 1e18);
  const beetsPerYear = beetsPerBlock * blocksPerYear;
  const farmBeetsPerYear =
    (farm.allocPoint / farm.masterChef.totalAllocPoint) * beetsPerYear;
  const valuePerYear = beetsPrice * farmBeetsPerYear;

  return valuePerYear / tvl;
}
