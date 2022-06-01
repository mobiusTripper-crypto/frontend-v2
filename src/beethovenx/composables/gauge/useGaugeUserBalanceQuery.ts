import { reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import useWeb3 from '@/services/web3/useWeb3';
import { Contract } from '@ethersproject/contracts';
import GAUGE_CONTRACT_ABI from '@/beethovenx/abi/LiquidityGaugeV5.json';
import { formatFixed } from '@ethersproject/bignumber';

export default function useGaugeUserBalanceQuery(
  guageAddress: string | null,
  options: QueryObserverOptions<string> = {}
) {
  const { account, getProvider } = useWeb3();
  const provider = getProvider();

  const queryKey = QUERY_KEYS.Gauges.UserBalance(
    guageAddress || 'gauge',
    account
  );

  const queryFn = async () => {
    if (!guageAddress) {
      return '0';
    }

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
