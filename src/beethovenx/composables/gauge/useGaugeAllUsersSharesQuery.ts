import { reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import useWeb3 from '@/services/web3/useWeb3';
import { beethovenxService } from '@/beethovenx/services/beethovenx/beethovenx.service';
import { GqlGaugeUserShare } from '@/beethovenx/services/beethovenx/beethovenx-types';

export default function useGaugeAllUsersSharesQuery(
  options: QueryObserverOptions<GqlGaugeUserShare[]> = {}
) {
  const { account } = useWeb3();

  const queryKey = QUERY_KEYS.Gauges.UserData(account);

  const queryFn = async () => {
    const gauges = await beethovenxService.getGaugesAllUserShares(
      account.value
    );
    return gauges;
  };

  const queryOptions = reactive({
    enabled: true,
    ...options,
    refetchInterval: 5000
  });

  return useQuery<GqlGaugeUserShare[]>(queryKey, queryFn, queryOptions);
}
