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

const PAGE_SIZE = 20;

export default function useSwapsQuery(
  options: UseInfiniteQueryOptions<SwapsQueryResponse> = {},
  filterOptions?: FilterOptions
) {
  // COMPOSABLES
  const { appLoading } = useApp();

  // DATA
  const queryKey = QUERY_KEYS.Swaps.Current(filterOptions?.poolIds);

  // COMPUTED
  const enabled = computed(() => !appLoading.value);

  // METHODS
  const queryFn = async ({ pageParam = 0 }) => {
    const queryArgs: any = {
      first: filterOptions?.pageSize || PAGE_SIZE,
      skip: pageParam,
      where: {},
      orderBy: 'timestamp',
      orderDirection: 'desc'
    };

    if (filterOptions?.poolIds?.value.length) {
      queryArgs.where.poolId_in = filterOptions.poolIds.value;
    }

    const swaps = await balancerSubgraphService.swaps.get(queryArgs);

    return {
      swaps,
      skip: swaps.length >= PAGE_SIZE ? pageParam + PAGE_SIZE : undefined
    };
  };

  const queryOptions = reactive({
    enabled,
    getNextPageParam: (lastPage: SwapsQueryResponse) => lastPage.skip,
    ...options
  });

  return useInfiniteQuery<SwapsQueryResponse>(queryKey, queryFn, queryOptions);
}
