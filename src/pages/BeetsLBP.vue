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
              Liquidity Bootstrap Pools
              <a href="#" class="text-red-500 underline">here</a>.
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
              :lb-start-price="lbpStartPrice"
              :usdc-address="usdcAddress"
              :weight-step="0.00625"
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
            />

            <p class="text-gray-300 mt-4">
              *The predicted price is an estimation assuming no additional
              buyers or sellers.
            </p>
            <p class="text-gray-300">
              <span class="font-bold">Note</span>: Users can both
              <span class="text-green-500">BUY</span> and
              <span class="text-red-500">SELL</span>
              during this event. Please be careful.
            </p>
          </div>
        </div>
      </div>

      <div class="order-1 lg:order-2 px-1 lg:px-0">
        <div class="mb-6">
          <img src="~@/assets/images/ludwig-says.svg" />
        </div>
        <LBPTradeCard
          :lbp-token-name="lbpTokenName"
          :lbp-token-address="lbpTokenAddress"
        />
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
import { computed, defineComponent, ref, watch } from 'vue';
import * as PoolPageComponents from '@/components/pages/pool';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useQueryClient } from 'vue-query';
import useNumbers from '@/composables/useNumbers';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import { EXTERNAL_LINKS } from '@/constants/links';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import useApp from '@/composables/useApp';
import BeetsLBPChart from '@/components/pages/lbp/BeetsLBPChart.vue';
import BeetsLBPStatCards from '@/components/pages/lbp/BeetsLBPStatCards.vue';
import LBPTradeCard from '@/components/cards/LBPTradeCard/LBPTradeCard.vue';
import LBPTable from '@/components/tables/LBPTable/LBPTable.vue';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import useSubgraphTokenPricesQuery from '@/composables/queries/useSubgraphTokenPricesQuery';

const BEETS_SYMBOL = 'BEETS';
const BEETS_ADDRESS = '0x8850fd0c65d9b2b168153fac6baa269a566c4ef7';
const BEETS_STARTING_AMOUNT = 5_000_000;
const USDC_ADDRESS = '0x70b55af71b29c5ca7e67bd1995250364c4be5554';
const LBP_POOL_ID =
  '0x07d91b61b149a0717952ad33d97cb4293b0bdb1a000200000000000000000025';
const LBP_START_TIME = '2021-09-23T15:30:00+0000';
const LBP_END_TIME = '2021-09-24T15:30:00+0000';
const LBP_START_PRICE = 0.17;

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
    const { prices } = useTokens();
    const { blockNumber } = useWeb3();

    const poolQuery = usePoolQuery(LBP_POOL_ID);
    const loadingPool = computed(
      () =>
        poolQuery.isLoading.value ||
        poolQuery.isIdle.value ||
        poolQuery.error.value
    );
    const pool = computed(() => poolQuery.data.value);
    const enabled = computed(() => !!pool.value?.id);

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

    const beets = computed(() => {
      return pool.value?.tokens.find(
        token => token.address.toLowerCase() === BEETS_ADDRESS
      );
    });
    const usdc = computed(() =>
      pool.value?.tokens.find(
        token => token.address.toLowerCase() === USDC_ADDRESS
      )
    );
    /*const beetsSold = computed(() => {
      if (beets.value) {
        console.log('BEETS sold', beets.value);
        return beets.value.amount - BEETS_STARTING_AMOUNT;
      }

      return 0;
    });*/

    /**
     * METHODS
     */
    /*function onNewTx(): void {
      queryClient.invalidateQueries([POOLS_ROOT_KEY, 'current', data.id]);
      data.refetchQueriesOnBlockNumber =
        blockNumber.value + REFETCH_QUERIES_BLOCK_BUFFER;
    }*/

    /**
     * WATCHERS
     */
    /*watch(blockNumber, () => {
      if (data.refetchQueriesOnBlockNumber === blockNumber.value) {
        queryClient.invalidateQueries([POOLS_ROOT_KEY]);
      } else {
        poolQuery.refetch.value();
      }
    });

    watch(poolQuery.error, () => {
      console.log('poolQuery.error', poolQuery.error);
      router.push({ name: 'home' });
    });*/

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
      lbpStartPrice: LBP_START_PRICE,
      loadingPool,
      tokenPrices,
      loadingTokenPrices
    };
  }
});
</script>
