import { computed } from 'vue';
import useUserPoolDataQuery from '@/beethovenx/composables/queries/useUserPoolDataQuery';
import usePoolList from '@/beethovenx/composables/usePoolList';
import {
  GqlBeetsUserPoolData,
  UserPoolListItem
} from '@/beethovenx/services/beethovenx/beethovenx-types';

export default function useUserPoolData() {
  const userPoolDataQuery = useUserPoolDataQuery();
  const { poolList, poolListLoading } = usePoolList();

  const userPoolDataLoading = computed(
    () =>
      userPoolDataQuery.isLoading.value ||
      userPoolDataQuery.isIdle.value ||
      poolListLoading.value
  );

  const userPoolData = computed<GqlBeetsUserPoolData[]>(
    () => userPoolDataQuery.data.value ?? []
  );

  const userPoolList = computed<UserPoolListItem[]>(() => {
    const userPoolIds = userPoolData.value.map(item => item.poolId);

    return poolList.value
      .filter(pool => userPoolIds.includes(pool.id))
      .map(pool => {
        const data = userPoolData.value.find(item => item.poolId === pool.id);

        return {
          ...pool,
          userBalance: data?.balanceUSD || '0',
          hasUnstakedBpt: data?.hasUnstakedBpt
        };
      });
  });

  return {
    userPoolDataLoading,
    userPoolList
  };
}
