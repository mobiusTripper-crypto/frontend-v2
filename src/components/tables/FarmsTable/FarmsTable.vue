<template>
  <BalCard
    shadow="lg"
    class="mt-4"
    :square="upToLargeBreakpoint"
    :noBorder="upToLargeBreakpoint"
    noPad
  >
    <BalTable
      :columns="columns"
      :data="data"
      :is-loading="isLoading"
      skeleton-class="h-64"
      sticky="both"
      :square="upToLargeBreakpoint"
      :link="{
        to: 'farm-detail',
        getParams: farm => ({ id: farm.id, poolId: farm.pool?.id })
      }"
      :on-row-click="handleRowClick"
      @load-more="$emit('loadMore')"
    >
      <template v-slot:iconColumnHeader>
        <div class="flex items-center">
          <img
            v-if="darkMode"
            :src="require('@/assets/images/icons/tokens_white.svg')"
          />
          <img
            v-else
            :src="require('@/assets/images/icons/tokens_black.svg')"
          />
        </div>
      </template>
      <template v-slot:iconColumnCell="farm">
        <div v-if="!isLoading" class="px-6 py-4">
          <BalAssetSet
            :addresses="orderedTokenAddressesFor(farm)"
            :width="100"
          />
        </div>
      </template>
      <div>abcdefg</div>
    </BalTable>
  </BalCard>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  DecoratedPool,
  DecoratedPoolWithShares,
  FarmWithPool,
  FarmWithStatsAndPool,
  PoolToken
} from '@/services/balancer/subgraph/types';
import { getAddress } from '@ethersproject/address';
import useNumbers from '@/composables/useNumbers';
import useFathom from '@/composables/useFathom';
import { ColumnDefinition } from '@/components/_global/BalTable/BalTable.vue';
import useDarkMode from '@/composables/useDarkMode';
import useBreakpoints from '@/composables/useBreakpoints';
import { isStableLike } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import numeral from 'numeral';
import {
  calculateApr,
  calculateRewardsPerDay,
  calculateTvl
} from '@/lib/utils/farmHelper';
import useFarms from '@/composables/farms/useFarms';
import usePools from '@/composables/pools/usePools';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import useAverageBlockTime from '@/composables/useAverageBlockTime';
import useWeb3 from '@/services/web3/useWeb3';
import useBeetsPrice from '@/composables/useBeetsPrice';
import { useI18n } from 'vue-i18n';
import useAllFarmsForUserQuery from '@/composables/queries/useAllFarmsForUserQuery';
import useFarmUserQuery from '@/composables/queries/useFarmUserQuery';
import BigNumber from 'bignumber.js';

export default defineComponent({
  components: {
    //LiquidityMiningTooltip,
  },

  emits: ['loadMore'],

  props: {
    noPoolsLabel: {
      type: String,
      default: 'No pools'
    }
  },

  setup() {
    const { fNum } = useNumbers();
    const router = useRouter();
    const { trackGoal, Goals } = useFathom();
    const { darkMode } = useDarkMode();
    const { upToLargeBreakpoint } = useBreakpoints();
    const { tokens } = useTokens();
    const { isWalletReady } = useWeb3();
    const { farms, isLoadingFarms } = useFarms();
    const { selectedTokens } = usePoolFilters();
    const { t } = useI18n();
    const { blocksPerYear, blocksPerDay } = useAverageBlockTime();
    const { pools, isLoadingPools, isLoadingUserPools } = usePools(
      selectedTokens
    );
    const beetsPrice = useBeetsPrice();
    const allFarmsUserQuery = useAllFarmsForUserQuery();
    const allFarmsForUser = computed(() => allFarmsUserQuery.data.value || []);

    const decoratedFarms = computed(() =>
      farms.value.length > 0 && pools.value.length > 0
        ? farms.value.map(farm => {
            const pool = pools.value.find(
              pool => pool.address.toLowerCase() === farm.pair.toLowerCase()
            );
            const farmUser = allFarmsForUser.value.find(
              userFarm => userFarm.pool.id === farm.id
            );

            const farmWithPool = { ...farm, pool };
            const tvl = calculateTvl(farmWithPool);
            const apr = calculateApr(
              farmWithPool,
              blocksPerYear.value,
              beetsPrice
            );
            const userShare = new BigNumber(farmUser?.amount || 0)
              .div(farm.slpBalance)
              .toNumber();

            return {
              ...farm,
              tvl: fNum(tvl, 'usd', {
                forcePreset: true
              }),
              rewards:
                fNum(
                  calculateRewardsPerDay(farmWithPool, blocksPerDay.value),
                  'token_lg',
                  {
                    forcePreset: true
                  }
                ) + ' BEETS / day',
              apr:
                apr === 0
                  ? '0.00%'
                  : fNum(apr, 'percent', { forcePreset: true }),
              pool,
              stake: fNum(tvl * userShare, 'usd'),
              pendingBeets:
                numeral(farmUser?.pendingBeets || 0).format('0,0.[00]') +
                ' BEETS'
            };
          })
        : []
    );

    const columns = ref<ColumnDefinition<FarmWithStatsAndPool>[]>([
      {
        name: 'Icons',
        id: 'icons',
        accessor: 'uri',
        Header: 'iconColumnHeader',
        Cell: 'iconColumnCell',
        width: 125,
        noGrow: true
      },
      {
        name: 'Name',
        id: 'name',
        accessor: farm => {
          if (farm.pool) {
            return farm.pool.name;
          }

          for (const address of Object.keys(tokens.value)) {
            if (address.toLowerCase() === farm.pair.toLowerCase()) {
              return tokens.value[address].symbol;
            }
          }

          return '';
        },
        sortKey: farm => farm.pool?.name,
        width: 250
      },
      {
        name: 'TVL',
        id: 'tvl',
        accessor: 'tvl',
        sortKey: 'tvl',
        align: 'right',
        width: 150
      },
      {
        name: t('myBalance'),
        id: 'stake',
        accessor: 'stake',
        sortKey: 'stake',
        align: 'right',
        width: 150
      },
      {
        name: 'My Claimable',
        id: 'pendingBeets',
        accessor: 'pendingBeets',
        sortKey: 'pendingBeets',
        align: 'right',
        width: 200
      },
      /*{
        name: 'Rewards',
        id: 'rewards',
        accessor: 'rewards',
        sortKey: 'rewards',
        align: 'right',
        width: 200
      },*/
      {
        name: 'Farm APR',
        id: 'apr',
        accessor: 'apr',
        sortKey: 'apr',
        align: 'right',
        width: 150
      }
    ]);

    function orderedTokenAddressesFor(farm: FarmWithPool) {
      if (!farm.pool) {
        return [getAddress(farm.pair)];
      }

      const sortedTokens = orderedPoolTokens(farm.pool);
      return sortedTokens.map(token => getAddress(token.address));
    }

    function orderedPoolTokens(pool: DecoratedPool): PoolToken[] {
      if (isStableLike(pool)) return pool.tokens;

      const sortedTokens = pool.tokens.slice();
      sortedTokens.sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));
      return sortedTokens;
    }

    function handleRowClick(pool: DecoratedPoolWithShares) {
      trackGoal(Goals.ClickPoolsTableRow);
      router.push({ name: 'farm-detail', params: { id: pool.id } });
    }

    const isLoading = computed(
      () =>
        !isWalletReady.value ||
        isLoadingFarms.value ||
        isLoadingPools.value ||
        isLoadingUserPools.value
    );

    return {
      // data
      columns,
      data: decoratedFarms,
      isLoading,

      // computed
      darkMode,
      upToLargeBreakpoint,

      // methods
      handleRowClick,
      getAddress,
      fNum,
      isStableLike,
      orderedTokenAddressesFor,
      calculateRewardsPerDay
    };
  }
});
</script>
