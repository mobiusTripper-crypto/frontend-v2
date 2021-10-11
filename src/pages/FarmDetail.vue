<template>
  <div class="lg:container lg:mx-auto pt-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-y-8 gap-x-0 lg:gap-x-8">
      <div class="col-span-2 mb-4">
        <BalLoadingBlock v-if="loading" class="h-16" />
        <div v-else class="px-4 lg:px-0 flex flex-col">
          <div class="flex flex-wrap items-center -mt-2">
            <h3 class="pool-title">
              {{ pool?.name }}
            </h3>
            <div
              v-for="(token, i) in titleTokens"
              :key="i"
              class="mt-2 mr-2 flex items-center px-2 h-10 bg-gray-50 dark:bg-gray-850 rounded-lg"
            >
              <BalAsset :address="token.address" :size="24" />
              <span class="ml-2">
                {{ token.symbol }}
              </span>
              <span
                v-if="!isStableLikePool"
                class="font-medium text-gray-400 text-xs mt-px ml-1"
              >
                {{ fNum(token.weight, 'percent_lg') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="hidden lg:block" />

      <div class="col-span-2 order-2 lg:order-1">
        <div class="grid grid-cols-1 gap-y-8">
          <div class="mb-4 px-1 lg:px-0">
            <FarmStatCardsLoading v-if="loading" />
            <FarmStatCards v-else :pool="pool" />
          </div>
        </div>
      </div>

      <div class="order-1 lg:order-2 px-1 lg:px-0">
        <BalLoadingBlock v-if="loading" class="h-96 sticky top-24" />
        <FarmActionsCard
          v-else
          :pool="pool"
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
import { useRoute } from 'vue-router';
import { useQueryClient } from 'vue-query';
import useNumbers from '@/composables/useNumbers';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import { POOLS_ROOT_KEY } from '@/constants/queryKeys';
import { EXTERNAL_LINKS } from '@/constants/links';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import useApp from '@/composables/useApp';
import FarmActionsCard from '@/components/pages/farm/FarmActionsCard.vue';
import { FarmStatCards } from '@/components/pages/farm';
import { isStableLike, usePool } from '@/composables/usePool';
import useFarm from '@/composables/farms/useFarm';
import FarmStatCardsLoading from '@/components/pages/farm/FarmStatCardsLoading.vue';
import {
  DecoratedPoolWithRequiredFarm,
  PoolToken
} from '@/services/balancer/subgraph/types';
import usePools from '@/composables/pools/usePools';

interface PoolPageData {
  id: string;
  refetchQueriesOnBlockNumber: number;
}

const REFETCH_QUERIES_BLOCK_BUFFER = 3;

export default defineComponent({
  components: {
    FarmStatCardsLoading,
    ...PoolPageComponents,
    FarmActionsCard,
    FarmStatCards
  },

  setup() {
    /**
     * COMPOSABLES
     */
    const { appLoading } = useApp();
    const route = useRoute();
    const { fNum } = useNumbers();
    const { isWalletReady } = useWeb3();
    const queryClient = useQueryClient();
    const { prices } = useTokens();
    const { blockNumber } = useWeb3();
    const {
      onlyPoolsWithFarms,
      isLoadingPools,
      isLoadingFarms,
      refetchPools
    } = usePools();
    const poolQuery = usePoolQuery(route.params.id as string);

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
    const pool = computed(() =>
      onlyPoolsWithFarms.value.find(pool => pool.id === route.params.id)
    );
    const { isStableLikePool } = usePool(pool);
    const { harvest } = useFarm(pool);

    const loading = computed(
      () =>
        isLoadingPools.value ||
        isLoadingFarms.value ||
        poolQuery.isLoading.value
    );

    const titleTokens = computed(() => {
      if (!pool.value) return [];

      return orderedPoolTokens(pool.value);
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

    function harvestAll() {
      harvest();
    }

    /**
     * WATCHERS
     */
    watch(blockNumber, () => {
      if (data.refetchQueriesOnBlockNumber === blockNumber.value) {
        queryClient.invalidateQueries([POOLS_ROOT_KEY]);
      } else {
        refetchPools();
      }
    });

    /*watch(poolQuery.error, () => {
      router.push({ name: 'farm' });
    });*/

    function orderedPoolTokens(
      pool: DecoratedPoolWithRequiredFarm
    ): PoolToken[] {
      if (isStableLike(pool)) return pool.tokens;

      const sortedTokens = pool.tokens.slice();
      sortedTokens.sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));
      return sortedTokens;
    }

    return {
      // data
      ...toRefs(data),
      EXTERNAL_LINKS,
      // computed
      appLoading,
      pool,
      loading,
      titleTokens,
      isWalletReady,
      missingPrices,
      isStableLikePool,
      // methods
      fNum,
      onNewTx,
      harvestAll
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
