<template>
  <div class="grid grid-cols-3 sm:grid-cols-3 xl:grid-cols-3 gap-4">
    <BalCard v-for="(stat, i) in stats" :key="i">
      <div class="text-sm text-gray-500 font-medium mb-2">
        {{ stat.label }}
      </div>
      <div class="text-xl font-medium truncate flex items-center">
        {{ stat.value }}
      </div>
      <div class="text-sm text-gray-500 font-medium mt-1">
        {{ stat.subValue }}
      </div>
    </BalCard>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import useNumbers from '@/composables/useNumbers';
import { FarmWithPool } from '@/services/balancer/subgraph/types';
import BigNumber from 'bignumber.js';
import { calculateApr, calculateTvl } from '@/lib/utils/farmHelper';
import useAverageBlockTime from '@/composables/useAverageBlockTime';
import { scale } from '@/lib/utils';
import useFarm from '@/composables/farms/useFarm';
import useEthers from '@/composables/useEthers';
import useFarmUserQuery from '@/composables/queries/useFarmUserQuery';
import { useRoute } from 'vue-router';

export default defineComponent({
  components: {},

  props: {},

  setup(props) {
    const route = useRoute();
    const { fNum } = useNumbers();
    const { blocksPerYear } = useAverageBlockTime();
    const { txListener } = useEthers();
    const harvesting = ref(false);

    // COMPUTED
    const stats = computed(() => {
      /*const farm = props.farm;

      const tvl = calculateTvl(farm);
      const apr = calculateApr(farm, blocksPerYear.value);
      const userShare = new BigNumber(farmUser.value?.amount || 0)
        .div(farm.slpBalance)
        .toNumber();*/

      return [
        {
          id: 'end',
          label: 'Ends In',
          value: '22:00:00',
          subValue: 'Oct 1, 18:00 UTC'
        },
        {
          id: 'price',
          label: 'BEETS Price',
          value: '$0.14',
          subValue: 'Predicted price: $0.08'
        },
        {
          id: 'tokens_sold',
          label: 'Tokens Sold ',
          value: '8%',
          subValue: '1.25m of 5m'
        }
      ];
    });

    return {
      stats,
      fNum,
      harvesting
    };
  }
});
</script>
