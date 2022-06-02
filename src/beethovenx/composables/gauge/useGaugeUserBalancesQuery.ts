import { reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import useWeb3 from '@/services/web3/useWeb3';
import { Contract } from '@ethersproject/contracts';
import GAUGE_CONTRACT_ABI from '@/beethovenx/abi/LiquidityGaugeV5.json';
import { formatFixed } from '@ethersproject/bignumber';
import usePoolList from '@/beethovenx/composables/usePoolList';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { configService } from '@/services/config/config.service';

export default function useGaugeUserBalancesQuery(
  guageAddress: string | null,
  options: QueryObserverOptions<string> = {}
) {
  const { account, getProvider } = useWeb3();
  const provider = getProvider();
  const { poolList } = usePoolList();
  const gaugeAddresses = poolList.value
    .filter(item => item.gauge)
    .map(item => item.gauge?.address || '');

  const queryKey = QUERY_KEYS.Gauges.UserBalances(gaugeAddresses, account);

  const queryFn = async () => {
    const multicaller = new Multicaller(
      configService.network.key,
      provider,
      GAUGE_CONTRACT_ABI
    );

    gaugeAddresses.forEach(gaugeAddress => {
      multicaller.call(gaugeAddress, gaugeAddress, 'balanceOf', [
        account.value
      ]);
    });

    const result = await multicaller.execute({});

    const gaugeContract = new Contract(
      guageAddress,
      GAUGE_CONTRACT_ABI,
      provider
    );

    const balance = await gaugeContract.balanceOf(account.value);

    return formatFixed(balance, 18);
  };

  const queryOptions = reactive({
    enabled: true,
    ...options,
    refetchInterval: 5000
  });

  return useQuery<string>(queryKey, queryFn, queryOptions);
}
