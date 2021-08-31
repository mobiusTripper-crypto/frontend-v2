<template>
  <div class="lg:container lg:mx-auto pt-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-y-8 gap-x-0 lg:gap-x-8">
      <div class="col-span-2">
        <BalLoadingBlock v-if="loading" class="h-16" />
        <div v-else class="px-4 lg:px-0 flex flex-col">
          <div class="flex flex-wrap items-center -mt-2">
            <h3 class="pool-title">Farm - {{ pool?.name }}</h3>
          </div>
        </div>
      </div>

      <div class="hidden lg:block" />

      <div class="col-span-2 order-2 lg:order-1">
        <div class="grid grid-cols-1 gap-y-8"></div>
      </div>

      <div class="order-1 lg:order-2 px-1 lg:px-0">
        <BalLoadingBlock v-if="loading" class="h-96 sticky top-24" />
        <FarmActionsCard
          v-else
          :pool="pool"
          :farm="farm"
          :farmUser="farmUser"
          :missing-prices="missingPrices"
          @on-tx="onNewTx"
          class="sticky top-24"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, toRefs, watch } from 'vue';
import * as PoolPageComponents from '@/components/pages/pool';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useQueryClient } from 'vue-query';
import useNumbers from '@/composables/useNumbers';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import usePoolSnapshotsQuery from '@/composables/queries/usePoolSnapshotsQuery';
import { POOLS_ROOT_KEY } from '@/constants/queryKeys';
import { POOLS } from '@/constants/pools';
import { EXTERNAL_LINKS } from '@/constants/links';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import useApp from '@/composables/useApp';
import useFarmQuery from '@/composables/queries/useFarmQuery';
import FarmActionsCard from '@/components/pages/farm/FarmActionsCard.vue';
import useFarmUserQuery from '@/composables/queries/useFarmUserQuery';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';

interface PoolPageData {
  id: string;
  refetchQueriesOnBlockNumber: number;
}

const REFETCH_QUERIES_BLOCK_BUFFER = 3;

export default defineComponent({
  components: {
    ...PoolPageComponents,
    FarmActionsCard
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

    /**
     * QUERIES
     */
    const farmQuery = useFarmQuery(route.params.id as string);
    const poolQuery = usePoolQuery(route.params.poolId as string);
    const farmUserQuery = useFarmUserQuery(route.params.id as string);
    const poolSnapshotsQuery = usePoolSnapshotsQuery(
      route.params.id as string,
      30
    );

    /**
     * STATE
     */
    const data = reactive<PoolPageData>({
      id: route.params.id as string,
      refetchQueriesOnBlockNumber: 0
    });

    /**
     * COMPUTED
     */
    const pool = computed(() => poolQuery.data.value);
    const farm = computed(() => farmQuery.data.value);
    const farmUser = computed(() => farmUserQuery.data.value);

    const loading = computed(
      () =>
        poolQuery.isLoading.value ||
        poolQuery.isIdle.value ||
        poolQuery.error.value ||
        farmQuery.isLoading.value ||
        farmQuery.isIdle.value ||
        farmQuery.error.value
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

    const missingPrices = computed(() => {
      if (pool.value) {
        const tokensWithPrice = Object.keys(prices.value);
        return !pool.value.tokenAddresses.every(token =>
          tokensWithPrice.includes(token)
        );
      }
      return false;
    });

    /**
     * METHODS
     */
    function onNewTx(): void {
      queryClient.invalidateQueries([POOLS_ROOT_KEY, 'current', data.id]);
      data.refetchQueriesOnBlockNumber =
        blockNumber.value + REFETCH_QUERIES_BLOCK_BUFFER;
    }

    /**
     * WATCHERS
     */
    watch(blockNumber, () => {
      if (data.refetchQueriesOnBlockNumber === blockNumber.value) {
        queryClient.invalidateQueries([POOLS_ROOT_KEY]);
      } else {
        poolQuery.refetch.value();
      }
    });

    watch(poolQuery.error, () => {
      router.push({ name: 'farm' });
    });

    return {
      // data
      ...toRefs(data),
      EXTERNAL_LINKS,
      // computed
      appLoading,
      pool,
      farm,
      farmUser,
      historicalPrices,
      snapshots,
      isLoadingSnapshots,
      loading,
      titleTokens,
      isWalletReady,
      missingPrices,
      // methods
      fNum,
      onNewTx
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
