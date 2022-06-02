import { computed, reactive, Ref } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import useWeb3 from '@/services/web3/useWeb3';
import GAUGE_CONTRACT_ABI from '@/beethovenx/abi/LiquidityGaugeV5.json';
import { formatFixed } from '@ethersproject/bignumber';
import usePoolList from '@/beethovenx/composables/usePoolList';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { configService } from '@/services/config/config.service';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import { mapValues } from 'lodash';

export default function useGaugeUserBalancesQuery(
  gaugeAddresses: Ref<string[]>,
  options: QueryObserverOptions<BalanceMap> = {}
) {
  const { account, getProvider, isWalletReady } = useWeb3();
  const enabled = computed(
    () => isWalletReady.value && gaugeAddresses.value.length > 0
  );

  const queryKey = QUERY_KEYS.Gauges.UserBalances(
    gaugeAddresses.value,
    account
  );

  const queryFn = async () => {
    const provider = getProvider();
    const multicaller = new Multicaller(
      configService.network.key,
      provider,
      GAUGE_CONTRACT_ABI
    );

    gaugeAddresses.value.forEach(gaugeAddress => {
      multicaller.call(gaugeAddress, gaugeAddress, 'balanceOf', [
        account.value
      ]);
    });

    const result = await multicaller.execute({});

    return mapValues(result, value => formatFixed(value, 18));
  };

  const queryOptions = reactive({
    enabled,
    ...options,
    refetchInterval: 5000
  });

  return useQuery<BalanceMap>(queryKey, queryFn, queryOptions);
}
