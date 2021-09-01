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
      :initial-state="{
        sortColumn: 'tvl',
        sortDirection: 'desc'
      }"
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
import {
  calculateApr,
  calculateRewardsPerDay,
  calculateTvl
} from '@/lib/utils/farmHelper';
import useFarms from '@/composables/farms/useFarms';
import usePools from '@/composables/pools/usePools';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import useAverageBlockTime from '@/composables/useAverageBlockTime';

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

  setup(props) {
    const { fNum } = useNumbers();
    const router = useRouter();
    const { trackGoal, Goals } = useFathom();
    const { darkMode } = useDarkMode();
    const { upToLargeBreakpoint } = useBreakpoints();
    const { tokens } = useTokens();

    const { farms, isLoadingFarms } = useFarms();

    // // userFarmToken.approvedAll.value = true;
    // console.log(userFarmToken)
    // userFarmToken.approveAllowances()
    const { selectedTokens } = usePoolFilters();

    const { pools, isLoadingPools, isLoadingUserPools } = usePools(
      selectedTokens
    );

    const { blocksPerYear, blocksPerDay } = useAverageBlockTime();

    const decoratedFarms = computed(() =>
      farms.value.length > 0 && pools.value.length > 0
        ? farms.value.map(farm => {
            const pool = pools.value.find(
              pool => pool.address.toLowerCase() === farm.pair.toLowerCase()
            );
            const farmWithPool = { ...farm, pool };
            const apr = calculateApr(farmWithPool, blocksPerYear.value);

            return {
              ...farm,
              tvl: fNum(calculateTvl(farmWithPool), 'usd', {
                forcePreset: true
              }),
              rewards:
                fNum(
                  calculateRewardsPerDay(farmWithPool, blocksPerDay.value),
                  'token_lg',
                  {
                    forcePreset: true
                  }
                ) + ' BEETx / day',
              apr: apr === 0 ? '' : fNum(apr, 'percent', { forcePreset: true }),
              pool
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
        sortKey: farm => farm.pool?.name
      },
      {
        name: 'TVL',
        id: 'tvl',
        accessor: 'tvl',
        sortKey: 'tvl',
        align: 'right'
      },
      {
        name: 'Rewards',
        id: 'rewards',
        accessor: 'rewards',
        sortKey: 'rewards',
        align: 'right'
      },
      {
        name: 'Farm APR',
        id: 'apr',
        accessor: 'apr',
        sortKey: 'apr',
        align: 'right'
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

    return {
      // data
      columns,
      data: decoratedFarms,
      isLoading: isLoadingFarms || isLoadingPools || isLoadingUserPools,

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
