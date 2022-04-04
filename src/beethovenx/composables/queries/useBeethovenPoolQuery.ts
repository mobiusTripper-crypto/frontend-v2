import { computed, reactive, Ref } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import {
  GqlBalancerPool,
  PoolListItem,
  UserPortfolio
} from '@/beethovenx/services/beethovenx/beethovenx-types';
import useWeb3 from '@/services/web3/useWeb3';
import { beethovenxService } from '@/beethovenx/services/beethovenx/beethovenx.service';
import useApp from '@/composables/useApp';

export default function useBeethovenPoolQuery(
  id: Ref<string>,
  options: QueryObserverOptions<GqlBalancerPool> = {}
) {
  const queryKey = reactive(QUERY_KEYS.Pools.Beethoven(id.value));

  const queryFn = async () => {
    const pool = await beethovenxService.getPool(id.value);

    return pool;
  };

  const queryOptions = reactive({
    enabled: true,
    ...options,
    refetchInterval: 30000
  });

  return useQuery<GqlBalancerPool>(queryKey, queryFn, queryOptions);
}
