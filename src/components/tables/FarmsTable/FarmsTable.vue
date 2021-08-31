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
        getParams: farm => ({ id: farm.id, poolId: farm.pool?.id })
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
      <div>abcdefg</div>
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
import useTokens from '@/composables/useTokens';
import useFarmStats from '@/composables/farms/useFarmStats';

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
    const { fNum } = useNumbers();
    const router = useRouter();
    const { t } = useI18n();
    const { trackGoal, Goals } = useFathom();
    const { darkMode } = useDarkMode();
    const { upToLargeBreakpoint } = useBreakpoints();
    const { tokens, priceFor } = useTokens();

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
        }
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

    function calculateTvl(farm: FarmWithPool) {
      if (
        farm.pool &&
        farm.pool.totalShares !== '0' &&
        farm.slpBalance !== '0'
      ) {
        const valuePerShare =
          parseFloat(farm.pool.totalLiquidity) /
          parseFloat(farm.pool.totalShares);

        return Number(parseInt(farm.slpBalance) / 1e18) * valuePerShare;
      }

      const address = getAddress(farm.pair);
      const price = priceFor(address);

      if (tokens.value[address] && price) {
        return Number(parseInt(farm.slpBalance) / 1e18) * price;
      }

      return 0;
    }

    function calculateRewardsPerDay(farm: FarmWithPool, blocksPerDay: number) {
      //TODO: load the beetxPerBlock from a subgraph
      const totalBeetxPerDay = 3 * blocksPerDay;

      return (
        (farm.allocPoint / farm.masterChef.totalAllocPoint) * totalBeetxPerDay
      );
    }

    function calculateApr(farm: FarmWithPool, blocksPerYear: number) {
      const tvl = calculateTvl(farm);
      if (tvl === 0) {
        return 0;
      }

      //TODO: load the beetxPrice from a subgraph
      const beetxPrice = 0.01;
      const beetxPerBlock = Number(
        parseInt(farm.masterChef.beetxPerBlock) / 1e18
      );
      const beetxPerYear = beetxPerBlock * blocksPerYear;
      const farmBeetxPerYear =
        (farm.allocPoint / farm.masterChef.totalAllocPoint) * beetxPerYear;
      const valuePerYear = beetxPrice * farmBeetxPerYear;

      return valuePerYear / tvl;
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
      calculateRewardsPerDay
    };
  }
});
</script>
