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
      :is-loading-more="isLoadingMore"
      skeleton-class="h-64"
      sticky="both"
      :square="upToLargeBreakpoint"
      :link="{
        to: 'farm-detail',
        getParams: farm => ({ id: farm.id })
      }"
      :on-row-click="handleRowClick"
      :is-paginated="isPaginated"
      @load-more="$emit('loadMore')"
      :initial-state="{
        sortColumn: 'poolValue',
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
      <!--      <template v-slot:poolNameCell="pool">
             <div v-if="!isLoading" class="px-6 py-4">
              <TokenPills
                 :tokens="orderedPoolTokens(pool)"
                 :isStablePool="isStableLike(pool)"
               />
             </div>
           </template>
           <template v-slot:aprCell="pool">
             <div class="px-6 py-4 -mt-1 flex justify-end">
               {{
                 Number(pool.dynamic.apr.pool) > 10000
                   ? '-'
                   : fNum(pool.dynamic.apr.total, 'percent')
               }}
               <LiquidityMiningTooltip :pool="pool" />
             </div>
           </template>-->
    </BalTable>
  </BalCard>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import {
  DecoratedPoolWithShares,
  PoolToken,
  Farm,
  FarmWithPool,
  DecoratedPool
} from '@/services/balancer/subgraph/types';

import { getAddress } from '@ethersproject/address';

import useNumbers from '@/composables/useNumbers';
import useFathom from '@/composables/useFathom';
import { ColumnDefinition } from '@/components/_global/BalTable/BalTable.vue';
import useDarkMode from '@/composables/useDarkMode';
import useBreakpoints from '@/composables/useBreakpoints';
import { isStableLike } from '@/composables/usePool';
import { Pool } from '@balancer-labs/sor/dist/types';

export default defineComponent({
  components: {
    //LiquidityMiningTooltip,
  },

  emits: ['loadMore'],

  props: {
    data: {
      type: Array
    },
    isLoading: {
      type: Boolean
    },
    isLoadingMore: {
      type: Boolean,
      default: false
    },
    showPoolShares: {
      type: Boolean,
      default: false
    },
    noPoolsLabel: {
      type: String,
      default: 'No pools'
    },
    isPaginated: {
      type: Boolean,
      default: false
    },
    blocksPerDay: {
      type: Number,
      default: 0
    },
    blocksPerYear: {
      type: Number,
      default: 0
    }
  },

  setup(props) {
    // COMPOSABLES
    const { fNum } = useNumbers();
    const router = useRouter();
    const { t } = useI18n();
    const { trackGoal, Goals } = useFathom();
    const { darkMode } = useDarkMode();
    const { upToLargeBreakpoint } = useBreakpoints();

    // DATA
    const columns = ref<ColumnDefinition<FarmWithPool>[]>([
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
        accessor: farm => farm.pool?.name || ''
      },
      {
        name: 'TVL',
        id: 'tvl',
        accessor: farm =>
          fNum(calculateTvl(farm), 'usd', { forcePreset: true }),
        sortKey: farm => calculateTvl(farm),
        align: 'right'
      },
      {
        name: 'Rewards',
        id: 'rewards',
        accessor: farm =>
          fNum(calculateRewardsPerDay(farm, props.blocksPerDay), 'token_lg', {
            forcePreset: true
          }) + ' BEETx / day',
        sortKey: farm => calculateRewardsPerDay(farm, props.blocksPerDay),
        align: 'right'
      },
      {
        name: 'Farm APR',
        id: 'apr',
        accessor: farm => {
          const apr = calculateApr(farm, props.blocksPerYear);

          if (apr === 0) {
            return '';
          }

          return fNum(apr, 'percent', { forcePreset: true });
        },
        sortKey: farm => calculateApr(farm, props.blocksPerYear),
        align: 'right'
      }
      /*{
        name: t('myBalance'),
        accessor: pool => fNum(pool.shares, 'usd', { forcePreset: true }),
        align: 'right',
        id: 'myBalance',
        hidden: !props.showPoolShares,
        sortKey: pool => Number(pool.shares),
        width: 150
      },
      {
        name: 'TVL',
        accessor: pool => fNum(pool.totalLiquidity, 'usd'),
        align: 'right',
        id: 'poolValue',
        sortKey: pool => {
          const apr = Number(pool.totalLiquidity);
          if (apr === Infinity || isNaN(apr)) return 0;
          return apr;
        },
        width: 150
      },
      {
        name: 'Rewards',
        accessor: pool => fNum(pool.dynamic.volume, 'usd'),
        align: 'right',
        id: 'poolVolume',
        sortKey: pool => {
          const apr = Number(pool.dynamic.volume);
          if (apr === Infinity || isNaN(apr)) return 0;
          return apr;
        },
        width: 175
      },
      {
        name: 'Farm APR',
        Cell: 'aprCell',
        accessor: pool => pool.dynamic.apr.total,
        align: 'right',
        id: 'poolApr',
        sortKey: pool => {
          const apr = Number(pool.dynamic.apr.total);
          if (apr === Infinity || isNaN(apr)) return 0;
          return apr;
        },
        width: 150
      }*/
    ]);

    // METHODS
    function orderedTokenAddressesFor(farm: FarmWithPool) {
      if (!farm.pool) {
        return [farm.pair];
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

    function calculateTvl(farm: FarmWithPool) {
      //TODO: if this is a single token, use that
      if (
        !farm.pool ||
        farm.pool.totalShares === '0' ||
        farm.slpBalance === '0'
      ) {
        return 0;
      }

      console.log(
        farm.pool.name,
        farm.pool.totalLiquidity,
        farm.pool.totalShares,
        farm.slpBalance
      );

      const valuePerShare =
        parseFloat(farm.pool.totalLiquidity) /
        parseFloat(farm.pool.totalShares);

      return Number(parseInt(farm.slpBalance) / 1e18) * valuePerShare;
    }

    function calculateRewardsPerDay(farm: FarmWithPool, blocksPerDay: number) {
      //TODO: load the beetxPerBlock from a subgraph
      const totalBeetxPerDay = 3 * blocksPerDay;

      return (
        (farm.allocPoint / farm.masterChef.totalAllocPoint) * totalBeetxPerDay
      );
    }

    function calculateApr(farm: FarmWithPool, blocksPerYear: number) {
      if (!farm.pool) {
        return 0;
      }

      //TODO: load the beetxPrice from a subgraph
      const beetxPrice = 0.01;
      //TODO: load the beetxPerBlock from a subgraph
      const beetxPerBlock = 3;
      const beetxPerYear = beetxPerBlock * blocksPerYear;
      const farmBeetxPerDay =
        (farm.allocPoint / farm.masterChef.totalAllocPoint) * beetxPerYear;
      const valuePerYear = beetxPrice * farmBeetxPerDay * 365;
      const valuePerShare =
        parseFloat(farm.pool.totalLiquidity) /
        parseFloat(farm.pool.totalShares);

      const tvl = Number(parseInt(farm.slpBalance) / 1e18) * valuePerShare;

      return valuePerYear / tvl;
      //return fNum(valuePerYear / tvl, 'percent', { forcePreset: true });
    }

    function handleRowClick(pool: DecoratedPoolWithShares) {
      trackGoal(Goals.ClickPoolsTableRow);
      router.push({ name: 'farm-detail', params: { id: pool.id } });
    }

    return {
      // data
      columns,

      // computed
      darkMode,
      upToLargeBreakpoint,

      // methods
      handleRowClick,
      getAddress,
      fNum,
      isStableLike,
      orderedTokenAddressesFor,
      calculateTvl,
      calculateRewardsPerDay,
      calculateApr
    };
  }
});
</script>
