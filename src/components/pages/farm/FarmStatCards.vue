<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    <template v-if="loading">
      <BalLoadingBlock v-for="n in 4" :key="n" class="h-24" />
    </template>
    <template v-else>
      <BalCard v-for="(stat, i) in stats" :key="i">
        <div class="text-sm text-gray-500 font-medium mb-2">
          {{ stat.label }}
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ stat.value }}
          <LiquidityMiningTooltip :pool="pool" v-if="stat.id === 'apr'" />
        </div>
      </BalCard>
    </template>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import useNumbers from '@/composables/useNumbers';

import { DecoratedPool, Farm } from '@/services/balancer/subgraph/types';

import LiquidityMiningTooltip from '@/components/tooltips/LiquidityMiningTooltip.vue';
import farmHelpers from '@/lib/utils/farm/farmHelper';
import useAverageBlockTime from '@/composables/useAverageBlockTime';
import useFarmUserQuery from '@/composables/queries/useFarmUserQuery';
import BigNumber from 'bignumber.js';
import useFarmStats from '@/composables/farms/useFarmStats';

export default defineComponent({
  components: {
    LiquidityMiningTooltip
  },

  props: {
    pool: { type: Object as PropType<DecoratedPool> },
    farm: { type: Object as PropType<Farm> },
    staked: { type: Number, default: 0 },
    loading: { type: Boolean, default: true }
  },

  setup(props) {
    // COMPOSABLES
    const { fNum } = useNumbers();
    const { t } = useI18n();

    console.log('staaats', props);
    const { calculateTvl, calculateApr } = useFarmStats( props.farm, props.pool,);

    // COMPUTED
    const stats = computed(() => {
      if (!props.pool || !props.farm) return [];

      const tvl = calculateTvl();
      const liquidity =
        (tvl / parseInt(props.pool.totalShares)) *
        parseInt(props.farm.slpBalance);

      const apr = calculateApr();

      return [
        {
          id: 'liquidity',
          label: 'Liquidity',
          value: fNum(liquidity, 'usd')
        },
        {
          id: 'multiplier',
          label: 'Multiplier',
          value: fNum(props.farm.allocPoint, 'usd')
        },
        {
          id: 'apr',
          label: 'APR',
          value: fNum(apr, 'percent_lg')
        },
        {
          id: 'staked',
          label: 'Staked',
          value: props.staked
        },
        {
          id: 'your_share',
          label: 'Your Share',
          value: fNum(
            new BigNumber(props.pool.totalShares)
              .dividedBy(new BigNumber(props.staked))
              .toNumber(),
            'percent_lg'
          )
        }
      ];
    });

    return {
      stats
    };
  }
});
</script>
