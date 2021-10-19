<template>
  <div class="mb-16 flex">
    <div class="flex-1">
      <h2 class="text-green-500 mb-2">My Portfolio</h2>
      <BalLoadingBlock v-if="isLoading" class="h-10 w-40" />
      <h2 class="text-5xl font-light" v-else>
        ${{ numeral(data.totalValue).format('0,0.00') }}
      </h2>
    </div>
    <BalCard class="w-44" v-if="tvl">
      <div class="text-sm text-gray-500 font-medium mb-2">
        TVL
      </div>
      <div class="text-xl font-medium truncate flex items-center">
        ${{ fNum(tvl, 'usd_lg') }}
      </div>
    </BalCard>
    <!--    <BalCard class="mr-2 w-48">
      <div class="text-sm text-gray-500 font-medium mb-2">
        BEETS Price
      </div>
      <div class="text-xl font-medium truncate flex items-center">
        $1.48
      </div>
      <div class="text-sm text-gray-500 font-medium mt-1">
        MC: $8,450,000
      </div>
    </BalCard>
    <BalCard class="w-48">
      <div class="text-sm text-gray-500 font-medium mb-2">
        Circulating Supply
      </div>
      <div class="text-xl font-medium truncate flex items-center">
        7,724,530
      </div>
      <div class="text-sm text-gray-500 font-medium mt-1">
        5.05 BEETS/block
      </div>
    </BalCard>-->
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import numeral from 'numeral';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import { UserPortfolioData } from '@/services/beethovenx/beethovenx-types';
import useNumbers from '@/composables/useNumbers';
import useProtocolDataQuery from '@/composables/queries/useProtocolDataQuery';

export default defineComponent({
  props: {
    data: {
      type: Object as PropType<UserPortfolioData>,
      required: true
    },
    isLoading: {
      type: Boolean
    }
  },
  components: {
    BalCard
  },
  setup() {
    const { fNum } = useNumbers();
    const protocolDataQuery = useProtocolDataQuery();

    const tvl = computed(
      () => protocolDataQuery.data?.value?.totalLiquidity || 0
    );

    return {
      //refs

      numeral,
      fNum,
      tvl
    };
  }
});
</script>
