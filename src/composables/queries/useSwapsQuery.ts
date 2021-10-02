import { computed, reactive, ref, Ref } from 'vue';
import { useInfiniteQuery } from 'vue-query';
import { UseInfiniteQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/constants/queryKeys';
import { POOLS } from '@/constants/pools';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { SubgraphSwap } from '@/services/balancer/subgraph/types';
import useApp from '../useApp';

type SwapsQueryResponse = {
  swaps: SubgraphSwap[];
  skip?: number;
};

type FilterOptions = {
  poolIds?: Ref<string[]>;
  pageSize?: number;
};

export default function useSwapsQuery(
  options: UseInfiniteQueryOptions<SwapsQueryResponse> = {},
  filterOptions?: FilterOptions
) {
  // COMPOSABLES
  const { appLoading } = useApp();

  // DATA
  const queryKey = QUERY_KEYS.Swaps.All(filterOptions?.poolIds);

  // COMPUTED
  const enabled = computed(() => !appLoading.value);

  // METHODS
  const queryFn = async ({ pageParam = 0 }) => {
    const queryArgs: any = {
      first: filterOptions?.pageSize || POOLS.Pagination.PerPage,
      skip: pageParam,
      where: {}
    };

    if (filterOptions?.poolIds?.value.length) {
      queryArgs.where.poolId_in = filterOptions.poolIds.value;
    }

    const swaps = await balancerSubgraphService.swaps.get(queryArgs);

    return {
      swaps,
      skip:
        swaps.length >= POOLS.Pagination.PerPage
          ? pageParam + POOLS.Pagination.PerPage
          : undefined
    };
  };

  const queryOptions = reactive({
    enabled,
    getNextPageParam: (lastPage: SwapsQueryResponse) => lastPage.skip,
    ...options
  });

  return useInfiniteQuery<SwapsQueryResponse>(queryKey, queryFn, queryOptions);
}
