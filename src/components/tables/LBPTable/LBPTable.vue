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
      @load-more="$emit('loadMore')"
      :isSortable="false"
    >
      <template v-slot:iconColumnCell="farm">
        <div v-if="!isLoading" class="px-6 py-4">
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
import useWeb3 from '@/services/web3/useWeb3';

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
    const { blocksPerYear, blocksPerDay } = useAverageBlockTime();
    const { pools, isLoadingPools, isLoadingUserPools } = usePools(
      selectedTokens
    );

    const columns = ref<ColumnDefinition<FarmWithStatsAndPool>[]>([
      {
        name: 'Time',
        id: 'time',
        accessor: 'time',
        sortKey: 'time',
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

    const data = [
      {
        time: 'Sep 30, 2021, 09:03',
        type: 'Buy',
        input: '138.07 USDC',
        output: '10,000 BEETS',
        price: '$0.13',
        wallet: '0xa02c...5d02'
      },
      {
        time: 'Sep 30, 2021, 09:03',
        type: 'Buy',
        input: '138.07 USDC',
        output: '10,000 BEETS',
        price: '$0.13',
        wallet: '0xa02c...5d02'
      },
      {
        time: 'Sep 30, 2021, 09:03',
        type: 'Buy',
        input: '138.07 USDC',
        output: '10,000 BEETS',
        price: '$0.13',
        wallet: '0xa02c...5d02'
      },
      {
        time: 'Sep 30, 2021, 09:03',
        type: 'Buy',
        input: '138.07 USDC',
        output: '10,000 BEETS',
        price: '$0.13',
        wallet: '0xa02c...5d02'
      },
      {
        time: 'Sep 30, 2021, 09:03',
        type: 'Buy',
        input: '138.07 USDC',
        output: '10,000 BEETS',
        price: '$0.13',
        wallet: '0xa02c...5d02'
      }
    ];

    return {
      // data
      columns,
      data,
      isLoading: false,

      // computed
      darkMode,
      upToLargeBreakpoint,

      // methods
      getAddress,
      fNum,
      isStableLike,
      calculateRewardsPerDay
    };
  }
});
</script>
