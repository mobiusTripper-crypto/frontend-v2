import { computed, ComputedRef, ref, Ref } from 'vue';
import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import useUserPoolsQuery from '@/composables/queries/useUserPoolsQuery';
import { flatten } from 'lodash';
import useFarmsQuery from '@/composables/queries/useFarmsQuery';
import { Farm } from '@/services/balancer/subgraph/types';
/*export function useMasterChefFarms(swrConfig = undefined) {
  const { chainId } = useActiveWeb3React();
  const shouldFetch =
    chainId &&
    [SupportedChainId.AVALANCHE, SupportedChainId.AVALANCHE_TESTNET].includes(
      chainId
    );
  const { data } = useSWR(
    shouldFetch ? 'masterChefV1Farms' : null,
    () => getMasterChefFarms(chainId),
    swrConfig
  );
  return useMemo(() => {
    if (!data) return [];
    return data.map(data => ({ ...data, chef: Chef.MASTERCHEF }));
  }, [data]);
}*/

export default function useFarms(): {
  farms: ComputedRef<Farm[]>;
  isLoadingFarms: ComputedRef<boolean>;
} {
  // COMPOSABLES
  const farmsQuery = useFarmsQuery();
  //const userPoolsQuery = useUserPoolsQuery();

  // COMPUTED
  const farms: ComputedRef<Farm[]> = computed(() =>
    farmsQuery.data.value
      ? flatten(farmsQuery.data.value.pages.map(page => page.farms))
      : []
  );

  const isLoadingFarms = computed(
    () => farmsQuery.isLoading.value || farmsQuery.isIdle.value
  );

  /*const tokens = computed(() =>
    poolsQuery.data.value
      ? flatten(poolsQuery.data.value.pages.map(page => page.tokens))
      : []
  );*/

  /*const userPools = computed(() => userPoolsQuery.data.value?.pools);

  const totalInvestedAmount = computed(
    () => userPoolsQuery.data.value?.totalInvestedAmount
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
  }*/

  return {
    // computed
    farms,
    isLoadingFarms
    /*tokens,
    userPools,
    totalInvestedAmount,
    isLoadingPools,
    isLoadingUserPools,
    poolsHasNextPage,
    poolsIsFetchingNextPage,*/

    // methods
    //loadMorePools
  };
}
