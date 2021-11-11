import { computed, reactive } from 'vue';
import { erc20ContractService } from '@/services/erc20/erc20-contracts.service';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/constants/queryKeys';
import useWeb3 from '@/services/web3/useWeb3';
import { BigNumber } from 'ethers';

export default function useAllowanceAvailableQuery(
  token: string,
  options: QueryObserverOptions<BigNumber> = {}
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

    return allowance;
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<BigNumber>(queryKey, queryFn, queryOptions);
}
