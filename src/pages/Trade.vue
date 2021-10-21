<template>
  <div class="mt-12">
    <div class="trade-container">
      <BalLoadingBlock v-if="appLoading || loadingTokenLists" class="h-96" />
      <template v-else>
        <TradeCard v-if="tradeInterface === TradeInterface.BALANCER" />
        <TradeCardGP v-else-if="tradeInterface === TradeInterface.GNOSIS" />
        <TradeRatesCard />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useStore } from 'vuex';

import TradeCard from '@/components/cards/TradeCard/TradeCard.vue';
import TradeCardGP from '@/components/cards/TradeCardGP/TradeCardGP.vue';
import useTokenLists from '@/composables/useTokenLists';
import { TradeInterface } from '@/store/modules/app';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import useDexesQuery from '@/composables/queries/useDexesQuery';
import { GetAmountsOutInput } from '@/services/dex/dex-contract-types';
import TradeRatesCard from '@/components/cards/TradeRatesCard/TradeRatesCard.vue';

export default defineComponent({
  components: {
    TradeRatesCard,
    TradeCard,
    TradeCardGP
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { loadingTokenLists } = useTokenLists();
    const { setSelectedTokens } = usePoolFilters();

    // COMPUTED
    const appLoading = computed(() => store.state.app.loading);
    const tradeInterface = computed(() => store.state.app.tradeInterface);

    onMounted(() => {
      // selectedPoolTokens are only persisted between the Home/Pool pages
      setSelectedTokens([]);
    });

    useDexesQuery(
      ref<GetAmountsOutInput[]>([
        {
          amountIn: '10000000000',
          path: [
            '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
            '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
            '0x321162Cd933E2Be498Cd2267a90534A804051b11'
          ]
        }
      ])
    );

    return {
      appLoading,
      tradeInterface,
      loadingTokenLists,
      TradeInterface
    };
  }
});
</script>

<style scoped>
.trade-container {
  @apply max-w-full mx-auto mt-2 xs:mt-8;
  max-width: 500px;
}

@media (min-height: 840px) {
  .trade-container {
    @apply md:mt-8;
  }
}
</style>
