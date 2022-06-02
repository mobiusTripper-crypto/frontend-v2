import { computed, ref, Ref } from 'vue';
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
import useTokens from '@/composables/useTokens';
import useGaugeUserBalancesQuery from '@/beethovenx/composables/gauge/useGaugeUserBalancesQuery';
import { getAddress } from '@ethersproject/address';

export default function useUserPoolsData() {
  const userPoolDataQuery = useUserPoolDataQuery();
  const { poolList, poolListLoading } = usePoolList();
  const { balanceFor } = useTokens();
  const gaugeAddresses = computed(() =>
    poolList.value
      .filter(item => item.gauge)
      .map(item => item.gauge?.address || '')
  );
  const {
    data: gaugeUserBalances,
    isLoading: gaugeUserBalancesLoading
  } = useGaugeUserBalancesQuery(gaugeAddresses);

  const userPoolDataLoading = computed(
    () =>
      userPoolDataQuery.isLoading.value ||
      userPoolDataQuery.isIdle.value ||
      poolListLoading.value ||
      gaugeUserBalancesLoading.value
  );

  const userPoolsData = computed<GqlBeetsUserPoolData>(() => {
    /*const gaugeTotalBalanceUSD = gaugeUserPools.value
      ? gaugeUserPools.value
          .map(item => parseFloat(item.amountUSD))
          .reduce((total, value) => total + value)
      : 0;*/

    //console.log('gaugeUserBalances', gaugeUserBalances);

    const data = userPoolDataQuery.data.value ?? {
      totalBalanceUSD: '0',
      totalFarmBalanceUSD: '0',
      averageFarmApr: '0',
      averageApr: '0',
      pools: []
    };

    return {
      ...data,
      /*totalBalanceUSD: (
        gaugeTotalBalanceUSD + parseFloat(data.totalBalanceUSD)
      ).toString()*/
      totalBalanceUSD: '0'
    };
  });

  const userPools = computed<GqlBeetsUserPoolPoolData[]>(
    () => userPoolsData.value.pools
  );

  const userPoolList = computed<UserPoolListItem[]>(() => {
    const abc = poolList.value
      .filter(
        item =>
          parseFloat(balanceFor(item.address)) > 0 ||
          parseFloat(
            gaugeUserBalances.value && item.gauge
              ? gaugeUserBalances.value[item.gauge.address]
              : '0'
          ) > 0
      )
      .map(pool => {
        const bptInWallet = parseFloat(balanceFor(pool.address));
        const bptStaked = parseFloat(
          gaugeUserBalances.value && pool.gauge
            ? gaugeUserBalances.value[pool.gauge.address]
            : '0'
        );
        const userBptTotal = bptInWallet + bptStaked;

        return {
          ...pool,
          userBalance: `${parseFloat(pool.totalLiquidity) *
            (userBptTotal / parseFloat(pool.totalShares))}`,
          hasUnstakedBpt: pool.gauge && parseFloat(balanceFor(pool.address)) > 0
        };
      })
      .filter(pool => Number(pool.userBalance) > MINIMUM_DUST_VALUE_USD);

    return abc;
  });

  return {
    userPoolDataLoading,
    userPoolList,
    userPoolsData
  };
}
