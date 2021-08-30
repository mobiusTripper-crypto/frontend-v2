import { computed, reactive, ref, Ref } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/constants/queryKeys';
import { farmSubgraphClient } from '@/services/balancer/subgraph/farm-subgraph.client';
import { masterChefContractsService } from '@/services/farm/master-chef-contracts.service';
import useWeb3 from '@/services/web3/useWeb3';
import { FarmUser } from '@/services/balancer/subgraph/types';
import { getAddress } from '@ethersproject/address';
import { MaxUint256 } from '@ethersproject/constants';
import { erc20ContractService } from '@/services/erc20/erc20-contracts.service';
import { bnum } from '@/lib/utils';

export default function useFarmUserQuery(
  farmId: string,
  options: QueryObserverOptions<FarmUser> = {}
) {
  const { account, isWalletReady, appNetworkConfig } = useWeb3();
  const enabled = computed(() => isWalletReady.value && account.value != null);
  const queryKey = QUERY_KEYS.Farms.User(farmId, account);

  const queryFn = async () => {
    const userData = await farmSubgraphClient.getUserDataForFarm(
      farmId,
      account.value
    );
    const pendingBeetx = await masterChefContractsService.masterChef.getPendingBeetxForFarm(
      farmId,
      account.value
    );

    return {
      ...userData,
      pendingBeetx
    };
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<FarmUser>(queryKey, queryFn, queryOptions);
}
