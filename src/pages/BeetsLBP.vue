<template>
  <div class="lg:container lg:mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-3 mt-8 mb-4">
      <div class="col-span-2 order-2 lg:order-1 lg:-ml-6">
        <img src="~@/assets/images/beets-lbp-headline.svg" />
        <p class="font-medium pl-4 mr-12">
          This event is designed to disincentivize bots, front-running and
          speculation. The price will start high, and then decrease by design.
          Please, go in Adagio (slow) & Pianissimo (soft).
        </p>
        <p class="font-medium pl-4 mr-12 pt-4">
          Before participating in this event, please read our blog post
          explaining Liquidity Bootstrap Pools
          <a href="#" class="text-red-500 underline">here</a>.
        </p>
      </div>
      <div class="order-1 lg:order-2 px-1 lg:px-0">
        <img src="~@/assets/images/ludwig-says.svg" />
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-y-8 gap-x-0 lg:gap-x-8">
      <!--      <div class="hidden lg:block" />-->

      <div class="col-span-2 order-2 lg:order-1">
        <div class="grid grid-cols-1 gap-y-8">
          <div class="px-1 lg:px-0">
            <BeetsLBPChart :loading="false" />
          </div>
          <div class="mb-4 px-1 lg:px-0">
            <BeetsLBPStatCards />

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

          <!--          <div class="mb-4">
            <h4 v-text="$t('poolComposition')" class="px-4 lg:px-0 mb-4" />
            <PoolBalancesCard :pool="pool" :loading="loadingPool" />
          </div>

          <div>
            <h4 v-text="$t('poolTransactions')" class="px-4 lg:px-0 mb-2" />
            <PoolActivitiesCard :pool="pool" :loading="loadingPool" />
          </div>-->
        </div>
      </div>

      <div class="order-1 lg:order-2 px-1 lg:px-0">
        <LBPTradeCard
          lbp-token-name="BEETS"
          lbp-token-address="0x8850Fd0C65d9B2B168153FAc6bAa269A566c4ef7"
        />

        <!--        <img src="~@/assets/images/chillin-banner.svg" />-->
        <!--        <BalLoadingBlock
          v-if="loadingPool"
          :class="['h-96', 'top-24', titleTokens.length > 3 ? '' : 'sticky']"
        />-->
        <!--        <PoolActionsCard
          v-else-if="!noInitLiquidity"
          :pool="pool"
          :missing-prices="missingPrices"
          @on-tx="onNewTx"
          :class="['top-24', titleTokens.length > 3 ? '' : 'sticky']"
        />-->
      </div>
    </div>

    <div class="mt-24 mb-24">
      <h4 class="px-4 lg:px-0 mb-2">Transactions (1,245)</h4>
      <LBPTable />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed, watch } from 'vue';
import * as PoolPageComponents from '@/components/pages/pool';
import GauntletIcon from '@/components/images/icons/GauntletIcon.vue';
import LiquidityMiningTooltip from '@/components/tooltips/LiquidityMiningTooltip.vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useQueryClient } from 'vue-query';
import useNumbers from '@/composables/useNumbers';
import { usePool } from '@/composables/usePool';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import usePoolSnapshotsQuery from '@/composables/queries/usePoolSnapshotsQuery';
import { useRouter } from 'vue-router';
import { POOLS_ROOT_KEY } from '@/constants/queryKeys';
import { POOLS } from '@/constants/pools';
import { EXTERNAL_LINKS } from '@/constants/links';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import useApp from '@/composables/useApp';
import TradeCard from '@/components/cards/TradeCard/TradeCard.vue';
import BeetsLBPChart from '@/components/pages/lbp/BeetsLBPChart.vue';
import BeetsLBPStatCards from '@/components/pages/lbp/BeetsLBPStatCards.vue';
import LBPTradeCard from '@/components/cards/LBPTradeCard/LBPTradeCard.vue';
import LBPTable from '@/components/tables/LBPTable/LBPTable.vue';

interface PoolPageData {
  id: string;
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
    const { prices } = useTokens();
    const { blockNumber } = useWeb3();
    /*
    /!**
     * QUERIES
     *!/
    const poolQuery = usePoolQuery(route.params.id as string);
    const poolSnapshotsQuery = usePoolSnapshotsQuery(
      route.params.id as string,
      30
    );

    /!**
     * STATE
     *!/
    const data = reactive<PoolPageData>({
      id: route.params.id as string,
      refetchQueriesOnBlockNumber: 0
    });

    /!**
     * COMPUTED
     *!/
    const pool = computed(() => poolQuery.data.value);
    const { isStableLikePool } = usePool(poolQuery.data);

    const noInitLiquidity = computed(
      () =>
        !loadingPool.value &&
        pool.value &&
        Number(pool.value.onchain.totalSupply) === 0
    );

    const communityManagedFees = computed(
      () => pool.value?.owner == POOLS.DelegateOwner
    );
    const feesManagedByGauntlet = computed(
      () =>
        communityManagedFees.value &&
        POOLS.DynamicFees.Gauntlet.includes(data.id)
    );
    const feesFixed = computed(() => pool.value?.owner == POOLS.ZeroAddress);
    const swapFeeToolTip = computed(() => {
      if (feesManagedByGauntlet.value) {
        return t('feesManagedByGauntlet');
      } else if (communityManagedFees.value) {
        return t('delegateFeesTooltip');
      } else if (feesFixed.value) {
        return t('fixedFeesTooltip');
      } else {
        return t('ownerFeesTooltip');
      }
    });

    const loadingPool = computed(
      () =>
        poolQuery.isLoading.value ||
        poolQuery.isIdle.value ||
        poolQuery.error.value
    );

    const snapshots = computed(() => poolSnapshotsQuery.data.value?.snapshots);
    const historicalPrices = computed(
      () => poolSnapshotsQuery.data.value?.prices
    );
    const isLoadingSnapshots = computed(
      () =>
        poolSnapshotsQuery.isLoading.value || poolSnapshotsQuery.isIdle.value
    );

    const titleTokens = computed(() => {
      if (!pool.value) return [];

      return Object.entries(pool.value.onchain.tokens).sort(
        ([, a]: any[], [, b]: any[]) => b.weight - a.weight
      );
    });

    const poolTypeLabel = computed(() => {
      if (!pool.value) return '';
      const key = POOLS.Factories[pool.value.factory];

      return key ? t(key) : t('unknownPoolType');
    });

    const poolName = computed(() => {
      if (!pool.value) return '';

      return pool.value.name;
    });

    const poolFeeLabel = computed(() => {
      if (!pool.value) return '';
      const feeLabel = fNum(pool.value.onchain.swapFee, 'percent');

      if (feesFixed.value) {
        return t('fixedSwapFeeLabel', [feeLabel]);
      } else if (communityManagedFees.value) {
        return feesManagedByGauntlet.value
          ? t('dynamicSwapFeeLabel', [feeLabel])
          : t('communitySwapFeeLabel', [feeLabel]);
      }

      // Must be owner-controlled
      return t('dynamicSwapFeeLabel', [feeLabel]);
    });

    const missingPrices = computed(() => {
      if (pool.value) {
        const tokensWithPrice = Object.keys(prices.value);
        return !pool.value.tokenAddresses.every(token =>
          tokensWithPrice.includes(token)
        );
      }
      return false;
    });

    /!**
     * METHODS
     *!/
    function onNewTx(): void {
      queryClient.invalidateQueries([POOLS_ROOT_KEY, 'current', data.id]);
      data.refetchQueriesOnBlockNumber =
        blockNumber.value + REFETCH_QUERIES_BLOCK_BUFFER;
    }

    /!**
     * WATCHERS
     *!/
    watch(blockNumber, () => {
      if (data.refetchQueriesOnBlockNumber === blockNumber.value) {
        queryClient.invalidateQueries([POOLS_ROOT_KEY]);
      } else {
        poolQuery.refetch.value();
      }
    });

    watch(poolQuery.error, () => {
      console.log('poolQuery.error', poolQuery.error);
      router.push({ name: 'home' });
    });
    */

    return {
      // data
      //...toRefs(data),
      EXTERNAL_LINKS,
      // computed
      appLoading,
      /*pool,
      noInitLiquidity,
      poolTypeLabel,
      poolFeeLabel,
      historicalPrices,
      snapshots,
      isLoadingSnapshots,
      loadingPool,
      titleTokens,
      isWalletReady,
      missingPrices,
      feesManagedByGauntlet,
      swapFeeToolTip,
      isStableLikePool,
      poolName,*/
      // methods
      fNum
      //onNewTx
    };
  }
});
</script>

<style scoped>
.pool-title {
  @apply mr-4 capitalize mt-2;
  font-variation-settings: 'wght' 700;
}
</style>
