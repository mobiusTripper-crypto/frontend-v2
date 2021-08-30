import { computed, ComputedRef } from 'vue';
import { flatten } from 'lodash';
import useFarmsQuery from '@/composables/queries/useFarmsQuery';
import { Farm } from '@/services/balancer/subgraph/types';

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
  };
}
