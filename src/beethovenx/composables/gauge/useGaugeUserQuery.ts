import { reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import useWeb3 from '@/services/web3/useWeb3';
import { beethovenxService } from '@/beethovenx/services/beethovenx/beethovenx.service';
import { GqlGaugeUserShare } from '@/beethovenx/services/beethovenx/beethovenx-types';

export default function useGaugeUserQuery(
  poolId: string,
  options: QueryObserverOptions<GqlGaugeUserShare> = {}
) {
  const { account } = useWeb3();

  const queryKey = QUERY_KEYS.Gauges.User(poolId, account);

  const queryFn = async () => {
    const gauges = await beethovenxService.getGaugesUserShares(
      poolId,
      account.value
    );
    return { ...gauges, balanceUSD: '345' }; // TODO balances need to be calculate
  };

  const queryOptions = reactive({
    enabled: true,
    ...options,
    refetchInterval: 5000
  });

  return useQuery<GqlGaugeUserShare>(queryKey, queryFn, queryOptions);
}
