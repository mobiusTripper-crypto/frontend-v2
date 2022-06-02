import { reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import useWeb3 from '@/services/web3/useWeb3';
import { Contract } from '@ethersproject/contracts';
import { formatFixed } from '@ethersproject/bignumber';
import ERC20Abi from '@/lib/abi/ERC20.json';

export default function useGaugeBptBalanceQuery(
  poolAddress: string,
  gaugeAddress: string | null,
  options: QueryObserverOptions<string> = {}
) {
  const { getProvider } = useWeb3();
  const provider = getProvider();

  const queryKey = QUERY_KEYS.Gauges.GaugeBalance(
    gaugeAddress || 'gauge',
    poolAddress
  );

  const queryFn = async () => {
    if (!gaugeAddress) {
      return '0';
    }

    const pool = new Contract(poolAddress, ERC20Abi, provider);

    const balance = await pool.balanceOf(gaugeAddress);

    return formatFixed(balance, 18);
  };

  const queryOptions = reactive({
    enabled: true,
    ...options,
    refetchInterval: 15000
  });

  return useQuery<string>(queryKey, queryFn, queryOptions);
}
