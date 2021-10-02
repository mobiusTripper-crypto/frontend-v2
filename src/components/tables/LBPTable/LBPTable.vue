<template>
  <h4 class="px-4 lg:px-0 mb-2">Transactions ({{ (data || []).length }})</h4>
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
      @load-more="loadMore"
      :isSortable="false"
      :is-paginated="hasNextPage"
      :isLoadingMore="isLoadingMore"
    />
  </BalCard>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import { useRouter } from 'vue-router';
import { SubgraphSwap } from '@/services/balancer/subgraph/types';
import { getAddress } from '@ethersproject/address';
import useNumbers from '@/composables/useNumbers';
import { ColumnDefinition } from '@/components/_global/BalTable/BalTable.vue';
import useDarkMode from '@/composables/useDarkMode';
import useBreakpoints from '@/composables/useBreakpoints';
import { isStableLike } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import { calculateRewardsPerDay } from '@/lib/utils/farmHelper';
import useWeb3 from '@/services/web3/useWeb3';
import { format } from 'date-fns';
import useSwapsQuery from '@/composables/queries/useSwapsQuery';
import { flatten } from 'lodash';

export default defineComponent({
  components: {
    //LiquidityMiningTooltip,
  },

  props: {
    lbpTokenName: { type: String, required: true },
    lbpTokenAddress: { type: String, required: true },
    lbpPoolId: { type: String, required: true },
    loading: { type: Boolean, default: false },
    loadMore: {
      type: Function as PropType<() => void>
    }
  },

  setup(props) {
    const { fNum } = useNumbers();
    const router = useRouter();
    const { darkMode } = useDarkMode();
    const { upToLargeBreakpoint } = useBreakpoints();
    const { tokens } = useTokens();
    const { isWalletReady } = useWeb3();
    const swapsQuery = useSwapsQuery({}, { poolIds: ref([props.lbpPoolId]) });

    const swaps = computed(() =>
      swapsQuery.data.value
        ? flatten(swapsQuery.data.value.pages.map(page => page.swaps))
        : []
    );

    function loadMoreSwaps() {
      swapsQuery.fetchNextPage.value();
    }

    const columns = ref<ColumnDefinition<SubgraphSwap>[]>([
      {
        name: 'Time',
        id: 'timestamp',
        accessor: 'timestamp',
        sortKey: 'timestamp',
        width: 250
      },
      {
        name: 'Type',
        id: 'type',
        accessor: 'type',
        sortKey: 'type'
      },
      {
        name: 'Input',
        id: 'input',
        accessor: 'input',
        sortKey: 'input'
      },
      {
        name: 'Output',
        id: 'output',
        accessor: 'output',
        sortKey: 'output'
      },
      {
        name: 'BEETS Price',
        id: 'price',
        accessor: 'price',
        sortKey: 'price'
      },
      {
        name: 'Wallet',
        id: 'wallet',
        accessor: 'wallet',
        sortKey: 'wallet'
      }
    ]);

    const data = computed(() => {
      return (swaps.value || []).map(swap => ({
        timestamp:
          format(swap.timestamp * 1000, 'MMM dd') +
          ' at ' +
          format(swap.timestamp * 1000, 'HH:mm'),
        type: swap.tokenOut === props.lbpTokenAddress ? 'Buy' : 'Sell',
        input: `${swap.tokenAmountIn} ${swap.tokenInSym}`,
        output: `${swap.tokenAmountOut} ${swap.tokenOutSym}`,
        price: `$${(swap.tokenAmountIn / swap.tokenAmountOut).toFixed(2)}`,
        wallet: `${swap.userAddress.id.substr(
          0,
          6
        )}...${swap.userAddress.id.substr(-4)}`
      }));
    });

    return {
      // data
      columns,
      data,

      // computed
      darkMode,
      upToLargeBreakpoint,

      // methods
      getAddress,
      fNum,
      isStableLike,
      calculateRewardsPerDay,
      loadMoreSwaps,
      isLoading: swapsQuery.isLoading,
      isLoadingMore: swapsQuery.isFetchingNextPage,
      hasNextPage: swapsQuery.hasNextPage
    };
  }
});
</script>
