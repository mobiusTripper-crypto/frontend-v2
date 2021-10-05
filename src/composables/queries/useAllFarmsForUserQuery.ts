import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/constants/queryKeys';
import { farmSubgraphClient } from '@/services/balancer/subgraph/farm-subgraph.client';
import useWeb3 from '@/services/web3/useWeb3';
import { FarmUser } from '@/services/balancer/subgraph/types';
import useApp from '@/composables/useApp';
import { masterChefContractsService } from '@/services/farm/master-chef-contracts.service';
import useBeetsPrice from '@/composables/useBeetsPrice';

export default function useAllFarmsForUserQuery(
  options: QueryObserverOptions<FarmUser[]> = {}
) {
  const { account, isWalletReady } = useWeb3();
  const { appLoading } = useApp();
  const beetsPrice = useBeetsPrice();
  const enabled = computed(
    () => isWalletReady.value && account.value != null && !appLoading.value
  );
  const queryKey = QUERY_KEYS.Farms.UserAllFarms(account);

  const queryFn = async () => {
    try {
      const userFarms = await farmSubgraphClient.getUserDataForAllFarms(
        account.value
      );
      const decoratedUserFarms: FarmUser[] = [];

      for (const userFarm of userFarms) {
        const pendingBeets = await masterChefContractsService.masterChef.getPendingBeetsForFarm(
          userFarm.pool.id,
          account.value
        );

        decoratedUserFarms.push({
          ...userFarm,
          pendingBeets,
          pendingBeetsValue: pendingBeets * beetsPrice
        });
      }

      return decoratedUserFarms;
    } catch (e) {
      console.log('ERROR', e);
      return [];
    }
  };

  const queryOptions = reactive({
    enabled,
    refetchInterval: 3000,
    ...options
  });

  return useQuery<FarmUser[]>(queryKey, queryFn, queryOptions);
}
