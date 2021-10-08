import { computed, Ref, ref } from 'vue';

import { flatten } from 'lodash';

import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import useUserPoolsQuery from '@/composables/queries/useUserPoolsQuery';
import useFarms from '@/composables/farms/useFarms';
import { addFarmAprToPool } from '@/lib/utils/farmHelper';
import useAverageBlockTime from '@/composables/useAverageBlockTime';
import useProtocolDataQuery from '@/composables/queries/useProtocolDataQuery';

export default function usePools(poolsTokenList: Ref<string[]> = ref([])) {
  // COMPOSABLES
  const poolsQuery = usePoolsQuery(poolsTokenList);
  const userPoolsQuery = useUserPoolsQuery();
  const protocolDataQuery = useProtocolDataQuery();
  const beetsPrice = computed(
    () => protocolDataQuery.data?.value?.beetsPrice || 0
  );

  const { farms } = useFarms();
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
      addFarmAprToPool(pool, farms.value, blocksPerYear.value, beetsPrice.value)
    );
  });

  const tokens = computed(() =>
    poolsQuery.data.value
      ? flatten(poolsQuery.data.value.pages.map(page => page.tokens))
      : []
  );

  const userPools = computed(() => {
    return userPoolsQuery.data.value?.pools.map(pool =>
      addFarmAprToPool(pool, farms.value, blocksPerYear.value, beetsPrice.value)
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
