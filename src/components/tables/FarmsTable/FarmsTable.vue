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
      :is-loading="loading"
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
        <div v-if="!loading" class="px-6 py-4">
          <BalAssetSet
            :addresses="orderedTokenAddressesFor(farm)"
            :width="100"
          />
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
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
import { calculateRewardsPerDay } from '@/lib/utils/farmHelper';
import useFarms from '@/composables/farms/useFarms';
import usePools from '@/composables/pools/usePools';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import useAverageBlockTime from '@/composables/useAverageBlockTime';
import useWeb3 from '@/services/web3/useWeb3';
import useBeetsPrice from '@/composables/useBeetsPrice';
import { useI18n } from 'vue-i18n';
import useAllFarmsForUserQuery from '@/composables/queries/useAllFarmsForUserQuery';

export default defineComponent({
  components: {
    //LiquidityMiningTooltip,
  },

  emits: ['loadMore'],

  props: {
    decoratedFarms: {
      type: Array as PropType<any[]>,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    },
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
    const { t } = useI18n();

    const decoratedFarms = computed(() => {
      return (props.decoratedFarms || []).map(item => ({
        ...item,
        tvl: fNum(item.tvl, 'usd', {
          forcePreset: true
        }),
        rewards:
          fNum(item.rewards, 'token_lg', {
            forcePreset: true
          }) + ' BEETS / day',
        apr:
          item.apr === 0
            ? '0.00%'
            : fNum(item.apr, 'percent', { forcePreset: true }),
        stake: fNum(item.stake, 'usd'),
        pendingBeets: numeral(item.pendingBeets).format('0,0.[00]') + ' BEETS'
      }));
    });

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
        name: 'Pending Rewards',
        id: 'pendingBeets',
        accessor: 'pendingBeets',
        sortKey: 'pendingBeets',
        align: 'right',
        width: 200
      },
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

    return {
      // data
      columns,
      data: decoratedFarms,

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
