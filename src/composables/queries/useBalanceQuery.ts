import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/constants/queryKeys';
import useWeb3 from '@/services/web3/useWeb3';
import { erc20ContractService } from '@/services/erc20/erc20-contracts.service';

export default function useBalanceQuery(
  token: string,
  options: QueryObserverOptions<string> = {}
) {
  /**
   * COMPOSABLES
   */
  const { account, isWalletReady } = useWeb3();

  /**
   * COMPUTED
   */
  const enabled = computed(() => isWalletReady.value);

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Farms.TokenBalance(token);

  const queryFn = async () => {
    return erc20ContractService.erc20.balanceOf(token, account.value);
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<string>(queryKey, queryFn, queryOptions);
}
