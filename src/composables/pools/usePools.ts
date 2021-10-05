import { computed, Ref, ref } from 'vue';

import { flatten } from 'lodash';

import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import useUserPoolsQuery from '@/composables/queries/useUserPoolsQuery';
import useFarmsQuery from '@/composables/queries/useFarmsQuery';
import useFarms from '@/composables/farms/useFarms';
import { addFarmAprToPool, calculateApr } from '@/lib/utils/farmHelper';
import useBeetsPrice from '@/composables/useBeetsPrice';
import useAverageBlockTime from '@/composables/useAverageBlockTime';
import { DecoratedPool } from '@/services/balancer/subgraph/types';

export default function usePools(poolsTokenList: Ref<string[]> = ref([])) {
  // COMPOSABLES
  const poolsQuery = usePoolsQuery(poolsTokenList);
  const userPoolsQuery = useUserPoolsQuery();

  const { farms } = useFarms();
  const beetsPrice = useBeetsPrice();
  const { blocksPerYear } = useAverageBlockTime();

  // COMPUTED
  const pools = computed(() => {
    if (!poolsQuery.data.value) {
      return [];
    }

    const flattened = flatten(
      poolsQuery.data.value.pages.map(page => page.pools)
    );

    return flattened.map(pool =>
      addFarmAprToPool(pool, farms.value, blocksPerYear.value, beetsPrice)
    );
  });

  const tokens = computed(() =>
    poolsQuery.data.value
      ? flatten(poolsQuery.data.value.pages.map(page => page.tokens))
      : []
  );

  const userPools = computed(() => {
    return userPoolsQuery.data.value?.pools.map(pool =>
      addFarmAprToPool(pool, farms.value, blocksPerYear.value, beetsPrice)
    );
  });

  const totalInvestedAmount = computed(
    () => userPoolsQuery.data.value?.totalInvestedAmount
  );

  const isLoadingPools = computed(
    () => poolsQuery.isLoading.value || poolsQuery.isIdle.value
  );

  const isLoadingUserPools = computed(
    () => userPoolsQuery.isLoading.value || userPoolsQuery.isIdle.value
  );

  const poolsHasNextPage = computed(() => poolsQuery.hasNextPage?.value);
  const poolsIsFetchingNextPage = computed(
    () => poolsQuery.isFetchingNextPage?.value
  );

  // METHODS
  function loadMorePools() {
    poolsQuery.fetchNextPage.value();
  }

  return {
    // computed
    pools,
    tokens,
    userPools,
    totalInvestedAmount,
    isLoadingPools,
    isLoadingUserPools,
    poolsHasNextPage,
    poolsIsFetchingNextPage,

    // methods
    loadMorePools
  };
}
