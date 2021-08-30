import { computed, reactive } from 'vue';
import { erc20ContractService } from '@/services/erc20/erc20-contracts.service';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/constants/queryKeys';
import useWeb3 from '@/services/web3/useWeb3';

export default function useApprovalRequiredQuery(
  token: string,
  options: QueryObserverOptions<boolean> = {}
) {
  const { account, isWalletReady, appNetworkConfig } = useWeb3();
  const enabled = computed(() => isWalletReady.value);
  const queryKey = QUERY_KEYS.Farms.ApprovalRequired(token);

  const queryFn = async () => {
    const allowance = await erc20ContractService.erc20.allowance(
      token,
      account.value,
      appNetworkConfig.addresses.masterChef
    );

    return allowance.gt(0);
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<boolean>(queryKey, queryFn, queryOptions);
}
