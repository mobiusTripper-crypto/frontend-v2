import { computed, ComputedRef, ref } from 'vue';
import { flatten } from 'lodash';
import useFarmsQuery from '@/composables/queries/useFarmsQuery';
import { Farm, FarmWithPool, Pool } from '@/services/balancer/subgraph/types';
import BigNumber from 'bignumber.js';
import {
  calculateApr,
  calculateRewardsPerDay,
  calculateTvl
} from '@/lib/utils/farmHelper';
import useFarms from '@/composables/farms/useFarms';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import useAverageBlockTime from '@/composables/useAverageBlockTime';
import usePools from '@/composables/pools/usePools';
import useProtocolDataQuery from '@/composables/queries/useProtocolDataQuery';
import useAllFarmsForUserQuery from '@/composables/queries/useAllFarmsForUserQuery';

interface DecoratedFarm extends Farm {
  pool: Pool | undefined;
  tvl: number;
  rewards: number;
  stake: number;
  pendingBeets: number;
  pendingBeetsValue: number;
}

export default function useDecoratedFarms(): {
  decoratedFarms: ComputedRef<DecoratedFarm[]>;
  isLoadingDecoratedFarms: ComputedRef<boolean>;
} {
  const { farms, isLoadingFarms } = useFarms();
  const { selectedTokens } = usePoolFilters();
  const { blocksPerYear, blocksPerDay } = useAverageBlockTime();
  const { pools, isLoadingPools } = usePools(selectedTokens);
  const protocolDataQuery = useProtocolDataQuery();
  const beetsPrice = computed(
    () => protocolDataQuery.data?.value?.beetsPrice || 0
  );
  const allFarmsUserQuery = useAllFarmsForUserQuery();
  const allFarmsForUser = computed(() => allFarmsUserQuery.data.value || []);

  const isLoadingDecoratedFarms = computed(
    () =>
      isLoadingFarms.value ||
      isLoadingPools.value ||
      allFarmsUserQuery.isLoading.value
  );

  const decoratedFarms = computed(() => {
    if (farms.value.length === 0 || pools.value.length === 0) {
      return [];
    }

    return farms.value
      .map(farm => {
        const pool = pools.value.find(
          pool => pool.address.toLowerCase() === farm.pair.toLowerCase()
        );
        const farmUser = allFarmsForUser.value.find(
          userFarm => userFarm.pool.id === farm.id
        );

        const farmWithPool: FarmWithPool = { ...farm, pool };
        const tvl = calculateTvl(farmWithPool);
        const apr = calculateApr(
          farmWithPool,
          blocksPerYear.value,
          beetsPrice.value
        );
        const userShare = new BigNumber(farmUser?.amount || 0)
          .div(farm.slpBalance)
          .toNumber();

        return {
          ...farm,
          pool,
          tvl,
          rewards: calculateRewardsPerDay(farmWithPool, blocksPerDay.value),
          apr,
          stake: tvl * userShare,
          pendingBeets: farmUser?.pendingBeets || 0,
          pendingBeetsValue: (farmUser?.pendingBeets || 0) * beetsPrice.value
        };
      })
      .filter(farm => farm.pool !== undefined);
  });

  return {
    decoratedFarms,
    isLoadingDecoratedFarms
  };
}
