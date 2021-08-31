<template>
  <div class="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-2 gap-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
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
            <LiquidityMiningTooltip
              :pool="farm.pool"
              v-if="stat.id === 'apr'"
            />
          </div>
        </BalCard>
      </template>
    </div>
    <div class="pl-4 pr-8">
      <template v-if="loading">
        <BalLoadingBlock class="h-48" />
      </template>
      <template v-else>
        <BalCard>
          <div class="text-sm text-gray-500 font-medium mb-2">
            Your pending rewards
          </div>
          <div class="text-xl font-medium truncate flex items-center">
            {{ fNum(pendingRewards.count, 'token_fixed') }} BEETX
          </div>
          <div class="truncate flex items-center">
            {{ fNum(pendingRewards.value, 'usd') }}
          </div>
        </BalCard>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import useNumbers from '@/composables/useNumbers';
import { FarmUser, FarmWithPool } from '@/services/balancer/subgraph/types';
import LiquidityMiningTooltip from '@/components/tooltips/LiquidityMiningTooltip.vue';
import BigNumber from 'bignumber.js';
import { calculateApr, calculateTvl } from '@/lib/utils/farmHelper';
import useAverageBlockTime from '@/composables/useAverageBlockTime';
import { scale } from '@/lib/utils';

export default defineComponent({
  components: {
    LiquidityMiningTooltip
  },

  props: {
    farm: { type: Object as PropType<FarmWithPool>, required: true },
    farmUser: { type: Object as PropType<FarmUser> },
    staked: { type: Number, default: 0 },
    loading: { type: Boolean, default: true }
  },

  setup(props) {
    // COMPOSABLES
    const { fNum } = useNumbers();
    const { blocksPerYear } = useAverageBlockTime();

    // COMPUTED
    const stats = computed(() => {
      const farm = props.farm;
      const farmUser = props.farmUser;

      const tvl = calculateTvl(farm);
      const apr = calculateApr(farm, blocksPerYear.value);
      const userShare = new BigNumber(farmUser?.amount || 0)
        .div(farm.slpBalance)
        .toNumber();

      return [
        {
          id: 'tvl',
          label: 'TVL',
          value: fNum(tvl, 'usd')
        },
        {
          id: 'apr',
          label: `APR `,
          value: fNum(apr, 'percent')
        },
        {
          id: 'staked',
          label: 'Staked',
          value: fNum(tvl * userShare, 'usd')
        },
        {
          id: 'your_share',
          label: 'Your Share',
          value: fNum(userShare, 'percent')
        }
      ];
    });

    const pendingRewards = computed(() => {
      const count = scale(
        new BigNumber(props.farmUser?.pendingBeetx || 0),
        -18
      ).toNumber();

      return {
        count: count,
        value: count * 0.01 //TODO: add the real price of BEETx
      };
    });

    return {
      stats,
      pendingRewards,
      fNum
    };
  }
});
</script>
