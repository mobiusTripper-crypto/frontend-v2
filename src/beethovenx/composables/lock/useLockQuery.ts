import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import useApp from '@/composables/useApp';
import { beethovenxService } from '@/beethovenx/services/beethovenx/beethovenx.service';
import {
  GqlLock,
  GqlRewardToken
} from '@/beethovenx/services/beethovenx/beethovenx-types';

interface QueryResponse {
  locker: GqlLock;
  lockingRewardTokens: GqlRewardToken[];
}

export default function useLockQuery() {
  const { appLoading } = useApp();
  const queryKey = reactive(QUERY_KEYS.Lock.all);
  const enabled = computed(() => !appLoading.value);

  const queryFn = async () => {
    const data = await beethovenxService.getLockData();
    return data;
  };

  const queryOptions = reactive({
    enabled
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
