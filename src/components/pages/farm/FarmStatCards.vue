<template>
  <div class="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-2 gap-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
      <BalCard v-for="(stat, i) in stats" :key="i">
        <div class="text-sm text-gray-500 font-medium mb-2">
          {{ stat.label }}
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ stat.value }}
          <LiquidityMiningTooltip :pool="pool" v-if="stat.id === 'apr'" />
        </div>
      </BalCard>
    </div>
    <div class="xl:pl-4 xl:pr-8">
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          My Pending Rewards
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ fNum(pool.farm.pendingBeets, 'token_fixed') }} BEETS
        </div>
        <div class="truncate flex items-center pb-8">
          {{ fNum(pool.farm.pendingBeetsValue, 'usd') }}
        </div>

        <BalBtn
          label="Harvest"
          block
          color="gradient"
          :disabled="pool.farm.pendingBeets <= 0"
          :loading="harvesting"
          @click.prevent="harvestRewards"
        />
      </BalCard>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import useNumbers from '@/composables/useNumbers';
import { DecoratedPoolWithRequiredFarm } from '@/services/balancer/subgraph/types';
import LiquidityMiningTooltip from '@/components/tooltips/LiquidityMiningTooltip.vue';
import useFarm from '@/composables/farms/useFarm';
import useEthers from '@/composables/useEthers';
import useFarmUserQuery from '@/composables/queries/useFarmUserQuery';
import { useRoute } from 'vue-router';

export default defineComponent({
  components: {
    LiquidityMiningTooltip
  },

  props: {
    pool: {
      type: Object as PropType<DecoratedPoolWithRequiredFarm>,
      required: true
    }
  },

  setup(props) {
    const route = useRoute();
    const { fNum } = useNumbers();
    const { txListener } = useEthers();
    const { harvest } = useFarm(ref(props.pool));
    const harvesting = ref(false);
    const farmUserQuery = useFarmUserQuery(route.params.id as string);
    const farmUser = computed(() => farmUserQuery.data.value);

    async function harvestRewards(): Promise<void> {
      harvesting.value = true;
      const tx = await harvest();

      if (!tx) {
        harvesting.value = false;
        return;
      }

      txListener(tx, {
        onTxConfirmed: async () => {
          await farmUserQuery.refetch.value();
          harvesting.value = false;
        },
        onTxFailed: () => {
          harvesting.value = false;
        }
      });
    }

    // COMPUTED
    const stats = computed(() => {
      const farm = props.pool.farm;

      return [
        {
          id: 'tvl',
          label: 'TVL',
          value: fNum(farm.tvl, 'usd')
        },
        {
          id: 'apr',
          label: `APR `,
          value: fNum(farm.apr, 'percent')
        },
        {
          id: 'stake',
          label: 'My Balance',
          value: fNum(farm.stake, 'usd')
        },
        {
          id: 'your_share',
          label: 'My Share',
          value: fNum(farm.share, 'percent')
        }
      ];
    });

    const pendingRewards = computed(() => {
      return {
        count: farmUser.value?.pendingBeets || 0,
        value: farmUser.value?.pendingBeetsValue || 0
      };
    });

    return {
      stats,
      pendingRewards,
      fNum,
      harvestRewards,
      harvesting
    };
  }
});
</script>
