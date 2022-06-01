import { computed, Ref } from 'vue';
import useUserPoolDataQuery from '@/beethovenx/composables/queries/useUserPoolDataQuery';
import usePoolList from '@/beethovenx/composables/usePoolList';
import {
  GqlBeetsUserPoolData,
  GqlBeetsUserPoolPoolData,
  GqlGaugeUserShare,
  UserPoolListItem
} from '@/beethovenx/services/beethovenx/beethovenx-types';
import { MINIMUM_DUST_VALUE_USD } from '@/beethovenx/constants/dust';
import { configService } from '@/services/config/config.service';
import useGaugeAllUsersSharesQuery from '@/beethovenx/composables/gauge/useGaugeAllUsersSharesQuery';

export default function useUserPoolsData() {
  const userPoolDataQuery = useUserPoolDataQuery();
  const gaugeAllUsersShareQuery = useGaugeAllUsersSharesQuery();
  const { poolList, poolListLoading } = usePoolList();
  const { featureFlags } = configService;

  const userPoolDataLoading = computed(
    () =>
      userPoolDataQuery.isLoading.value ||
      userPoolDataQuery.isIdle.value ||
      poolListLoading.value
  );

  const userPoolsData = computed<GqlBeetsUserPoolData>(() => {
    const gaugeTotalBalanceUSD = gaugeUserPools.value
      ? gaugeUserPools.value
          .map(item => parseFloat(item.amountUSD))
          .reduce((total, value) => total + value)
      : 0;

    const data = userPoolDataQuery.data.value ?? {
      totalBalanceUSD: '0',
      totalFarmBalanceUSD: '0',
      averageFarmApr: '0',
      averageApr: '0',
      pools: []
    };

    return {
      ...data,
      totalBalanceUSD: (
        gaugeTotalBalanceUSD + parseFloat(data.totalBalanceUSD)
      ).toString()
    };
  });

  const userPools = computed<GqlBeetsUserPoolPoolData[]>(
    () => userPoolsData.value.pools
  );
  const gaugeUserPools = computed<GqlGaugeUserShare[]>(
    () => gaugeAllUsersShareQuery.data.value || []
  );

  const userPoolList = computed<UserPoolListItem[]>(() => {
    const userPoolIds = userPools.value.map(item => item.poolId);

    return poolList.value
      .filter(pool => userPoolIds.includes(pool.id))
      .map(pool => {
        const data = userPools.value.find(item => item.poolId === pool.id);
        const gaugeData = gaugeUserPools.value.find(
          item => item.poolId === pool.id
        );

        return {
          ...pool,
          userBalance: (
            parseFloat(data?.balanceUSD || '0') +
            parseFloat(gaugeData?.amountUSD || '0')
          ).toString(),
          hasUnstakedBpt:
            data?.hasUnstakedBpt && featureFlags.supportsMasterChef
        };
      })
      .filter(pool => Number(pool.userBalance) > MINIMUM_DUST_VALUE_USD);
  });

  return {
    userPoolDataLoading,
    userPoolList,
    userPoolsData
  };
}
