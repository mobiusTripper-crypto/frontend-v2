<template>
  <div class="lg:container lg:mx-auto">
    <div
      class="grid grid-cols-1 lg:grid-cols-3 gap-y-8 gap-x-0 lg:gap-x-8 mt-8"
    >
      <div class="col-span-2 order-2 lg:order-1">
        <div class="grid grid-cols-1 gap-y-8">
          <div class="">
            <div class="lg:-ml-5">
              <img src="~@/assets/images/beets-lbp-headline.svg" />
            </div>
            <p class="font-medium">
              Before participating, please read our blog post explaining
              Liquidity Bootstrapping Pools
              <a
                href="https://beethovenxio.medium.com/drop-the-beets-ebf8c61c898"
                class="text-red-500 underline"
                >here</a
              >.
            </p>
          </div>
          <div class="px-1 lg:px-0">
            <BeetsLBPChart
              :loading="loadingTokenPrices || loadingPool"
              :lbp-token-name="lbpTokenName"
              :lbp-token-address="lbpTokenAddress"
              :lbp-pool-id="lbpPoolId"
              :lbp-end-time="lbpEndTime"
              :lbp-start-time="lbpStartTime"
              :token-prices="tokenPrices"
              :usdc-address="usdcAddress"
              :weight-step="0.00625"
              :time-step="60 * 7"
              :pool="pool"
            />
          </div>
          <div class="mb-4 px-1 lg:px-0">
            <BeetsLBPStatCards
              :pool="pool"
              :lbp-token-address="lbpTokenAddress"
              :lbp-token-name="lbpTokenName"
              :lbp-token-starting-amount="lbpTokenStartingAmount"
              :usdc-address="usdcAddress"
              :lbp-end-time="lbpEndTime"
              :loading="loadingPool"
              :lbp-pool-id="lbpPoolId"
            />

            <p class="text-gray-300 mt-4">
              *The predicted price is an estimation assuming no additional
              buyers or sellers.
            </p>
            <p class="text-gray-300">
              <span class="font-bold">Note</span>: Users can both
              <span class="font-bold text-green-500">BUY</span> and
              <span class="font-bold text-red-500">SELL</span>
              during this event. Please be careful.
            </p>
          </div>
        </div>
      </div>

      <div class="order-1 lg:order-2 px-1 lg:px-0">
        <div class="mb-6">
          <img src="~@/assets/images/ludwig-says.svg" />
        </div>

        <BalLoadingBlock v-if="appLoading || loadingTokenLists" class="h-96" />
        <template v-else>
          <LBPTradeCard
            :lbp-token-name="lbpTokenName"
            :lbp-token-address="lbpTokenAddressFormatted"
            :usdc-address="usdcAddressFormatted"
            :swap-enabled="swapEnabled"
            @on-tx="onNewTx"
          />
        </template>
      </div>
    </div>

    <div class="mt-24 mb-24">
      <LBPTable
        :lbp-token-name="lbpTokenName"
        :lbp-token-address="lbpTokenAddress"
        :lbp-pool-id="lbpPoolId"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, watch } from 'vue';
import * as PoolPageComponents from '@/components/pages/pool';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useQueryClient } from 'vue-query';
import useNumbers from '@/composables/useNumbers';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import { EXTERNAL_LINKS } from '@/constants/links';
import useWeb3 from '@/services/web3/useWeb3';
import useApp from '@/composables/useApp';
import BeetsLBPChart from '@/components/pages/lbp/BeetsLBPChart.vue';
import BeetsLBPStatCards from '@/components/pages/lbp/BeetsLBPStatCards.vue';
import LBPTradeCard from '@/components/cards/LBPTradeCard/LBPTradeCard.vue';
import LBPTable from '@/components/tables/LBPTable/LBPTable.vue';
import useSubgraphTokenPricesQuery from '@/composables/queries/useSubgraphTokenPricesQuery';
import {
  POOLS_ROOT_KEY,
  SWAPS_ROOT_KEY,
  TOKEN_PRICES_ROOT_KEY
} from '@/constants/queryKeys';
import useTokenLists from '@/composables/useTokenLists';

const BEETS_SYMBOL = 'BEETS';
const BEETS_ADDRESS = '0xa7d7e5ed1f90af81d7729f4931bbc03344397c4a';
const BEETS_STARTING_AMOUNT = 5_000_000;
const USDC_ADDRESS = '0x70b55af71b29c5ca7e67bd1995250364c4be5554';
const LBP_POOL_ID =
  '0x6e26f6d45f87af6593a892fad86c3843e493c3aa000200000000000000000028';
const LBP_START_TIME = '2021-10-04T11:19:00+0000';
const LBP_END_TIME = '2021-10-04T14:19:00+0000';

const BEETS_ADDRESS_FORMATTED = '0xa7d7e5eD1f90aF81D7729F4931bbc03344397C4A';
const USDC_ADDRESS_FORMATTED = '0x70b55Af71B29c5Ca7e67bD1995250364C4bE5554';

interface LbpPageData {
  refetchQueriesOnBlockNumber: number;
}

const REFETCH_QUERIES_BLOCK_BUFFER = 3;

export default defineComponent({
  components: {
    ...PoolPageComponents,
    BeetsLBPChart,
    BeetsLBPStatCards,
    LBPTradeCard,
    LBPTable
  },

  setup() {
    /**
     * COMPOSABLES
     */
    const { appLoading } = useApp();
    const router = useRouter();
    const { t } = useI18n();
    const route = useRoute();
    const { fNum } = useNumbers();
    const { isWalletReady } = useWeb3();
    const queryClient = useQueryClient();
    const { blockNumber } = useWeb3();
    const { loadingTokenLists } = useTokenLists();

    const poolQuery = usePoolQuery(LBP_POOL_ID);
    const loadingPool = computed(
      () =>
        poolQuery.isLoading.value ||
        poolQuery.isIdle.value ||
        poolQuery.error.value
    );
    const pool = computed(() => {
      console.log(poolQuery.data.value);
      return poolQuery.data.value;
    });
    const enabled = computed(() => !!pool.value?.id);
    const swapEnabled = computed(() => poolQuery.data.value?.swapEnabled);

    const tokenPricesQuery = useSubgraphTokenPricesQuery(
      ref(LBP_POOL_ID),
      ref(BEETS_ADDRESS)
    );
    const tokenPrices = computed(() => tokenPricesQuery.data.value || []);
    const loadingTokenPrices = computed(
      () =>
        tokenPricesQuery.isLoading.value ||
        tokenPricesQuery.isIdle.value ||
        tokenPricesQuery.error.value
    );

    const data = reactive<LbpPageData>({ refetchQueriesOnBlockNumber: 0 });

    /**
     * METHODS
     */
    function onNewTx(): void {
      queryClient.invalidateQueries([POOLS_ROOT_KEY]);
      queryClient.invalidateQueries([POOLS_ROOT_KEY, 'current', LBP_POOL_ID]);
      queryClient.invalidateQueries([SWAPS_ROOT_KEY]);
      queryClient.invalidateQueries([TOKEN_PRICES_ROOT_KEY]);
      data.refetchQueriesOnBlockNumber =
        blockNumber.value + REFETCH_QUERIES_BLOCK_BUFFER;
    }

    /**
     * WATCHERS
     */
    watch(blockNumber, () => {
      if (data.refetchQueriesOnBlockNumber === blockNumber.value) {
        queryClient.invalidateQueries([POOLS_ROOT_KEY]);
        queryClient.invalidateQueries([POOLS_ROOT_KEY, 'current', LBP_POOL_ID]);
        queryClient.invalidateQueries([SWAPS_ROOT_KEY]);
        queryClient.invalidateQueries([TOKEN_PRICES_ROOT_KEY]);
      } else {
        poolQuery.refetch.value();
        tokenPricesQuery.refetch.value();
      }
    });

    return {
      EXTERNAL_LINKS,
      appLoading,
      fNum,
      pool,
      enabled,
      lbpPoolId: LBP_POOL_ID,
      lbpTokenAddress: BEETS_ADDRESS,
      lbpTokenName: BEETS_SYMBOL,
      lbpTokenStartingAmount: BEETS_STARTING_AMOUNT,
      lbpStartTime: LBP_START_TIME,
      lbpEndTime: LBP_END_TIME,
      usdcAddress: USDC_ADDRESS,

      lbpTokenAddressFormatted: BEETS_ADDRESS_FORMATTED,
      usdcAddressFormatted: USDC_ADDRESS_FORMATTED,
      loadingPool,
      tokenPrices,
      loadingTokenPrices,
      loadingTokenLists,
      swapEnabled,
      onNewTx
    };
  }
});
</script>
