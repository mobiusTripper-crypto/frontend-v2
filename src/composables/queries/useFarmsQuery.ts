import { computed, reactive } from 'vue';
import { useInfiniteQuery } from 'vue-query';
import { UseInfiniteQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/constants/queryKeys';
import { Farm } from '@/services/balancer/subgraph/types';
import useApp from '../useApp';
import { farmSubgraphClient } from '@/services/balancer/subgraph/farm-subgraph.client';

type FarmsQueryResponse = {
  farms: Farm[];
  skip?: number;
};

export default function useFarmsQuery(
  options: UseInfiniteQueryOptions<FarmsQueryResponse> = {}
) {
  // COMPOSABLES
  //const { injectTokens, dynamicDataLoading, prices } = useTokens();
  //const { currency } = useUserSettings();
  const { appLoading } = useApp();

  // DATA
  const queryKey = QUERY_KEYS.Farms.All;

  // COMPUTED
  const enabled = computed(() => !appLoading.value);

  // METHODS
  const queryFn = async ({ pageParam = 0 }) => {
    const data = await farmSubgraphClient.getFarms();

    /*const tokens = flatten(pools.map(pool => pool.tokensList));
    await injectTokens(tokens);
    await forChange(dynamicDataLoading, false);

    const decoratedPools = await balancerSubgraphService.pools.decorate(
      pools,
      '24h',
      prices.value,
      currency.value
    );*/

    return {
      farms: data.farms
    };
  };

  const queryOptions = reactive({
    enabled,
    getNextPageParam: (lastPage: FarmsQueryResponse) => lastPage.skip,
    ...options
  });

  return useInfiniteQuery<FarmsQueryResponse>(queryKey, queryFn, queryOptions);
}
