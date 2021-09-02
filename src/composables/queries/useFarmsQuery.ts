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
  const { appLoading } = useApp();

  // DATA
  const queryKey = QUERY_KEYS.Farms.All;

  // COMPUTED
  const enabled = computed(() => !appLoading.value);

  // METHODS
  const queryFn = async () => {
    const data = await farmSubgraphClient.getFarms();

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
