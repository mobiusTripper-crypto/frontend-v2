<template>
  <div class="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-2 gap-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          TVL
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ fNum(gaugeBptBalanceUsd, 'usd') }}
        </div>
      </BalCard>
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          Rewards
        </div>
        <div
          v-for="(rewardToken, i) in pool.gauge.rewardTokens"
          :key="i"
          :class="[
            'text-xl font-medium truncate flex items-center',
            i < pool.gauge.rewardTokens.length - 1 ? 'mb-1' : ''
          ]"
        >
          {{ fNum(rewardToken.rewardsPerDay, 'token_lg') }}
          <BalAsset :address="rewardToken.address" class="mx-1" />
          <span>/ day</span>
        </div>
      </BalCard>
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          My Balance
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ fNum(gaugeUserBalanceUsd, 'usd') }}
        </div>
      </BalCard>
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          My Share
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{
            fNum(
              `${
                gaugeBptBalanceUsd
                  ? gaugeUserBalanceUsd / gaugeBptBalanceUsd
                  : 0
              }`,
              'percent'
            )
          }}
        </div>
      </BalCard>
    </div>
    <BalCard v-if="!isPendingRewardsLoading">
      <div class="text-sm text-gray-500 font-medium mb-2">
        My Pending Rewards
      </div>
      <div
        v-for="(rewardToken, i) in pendingRewards.rewards"
        class="text-xl font-medium truncate flex items-center"
        :key="i"
      >
        {{ fNum(rewardToken.balance, 'token_fixed') }} {{ rewardToken.symbol }}
      </div>
      <div class="truncate flex items-center pb-8">
        {{ fNum(pendingRewards.balanceUSD, 'usd') }}
      </div>

      <BalBtn
        label="Harvest"
        block
        color="gradient"
        :disabled="!pendingRewards"
        :loading="harvesting"
        @click.prevent="harvestRewards"
      />
    </BalCard>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, toRefs, computed } from 'vue';
import useNumbers from '@/composables/useNumbers';
import useEthers from '@/composables/useEthers';
import useGauge from '@/beethovenx/composables/gauge/useGauge';
import { FullPool } from '@/services/balancer/subgraph/types';

// type Props = {
//   pool: GqlBalancerPoolWithRequiredFarm;
// };

export default defineComponent({
  name: 'GaugeStatCards',

  props: {
    pool: { type: Object as PropType<FullPool>, required: true }
  },

  setup(props) {
    // const props = defineProps<Props>();

    const { fNum } = useNumbers();
    const { txListener } = useEthers();
    const harvesting = ref(false);
    const { pool } = toRefs(props);
    const {
      gaugeUser,
      pendingRewards,
      isPendingRewardsLoading,
      harvest,
      gaugeUserBalance,
      gaugeUserBalanceUsd,
      gaugeBptBalanceUsd,
      gaugeBptBalance
    } = useGauge(pool);

    async function harvestRewards(): Promise<void> {
      harvesting.value = true;
      const tx = await harvest();

      if (!tx) {
        harvesting.value = false;
        return;
      }

      txListener(tx, {
        onTxConfirmed: async () => {
          //          await refetchPendingRewards(); // TODO, fix useQuery so can refetch
          harvesting.value = false;
        },
        onTxFailed: () => {
          harvesting.value = false;
        }
      });
    }

    return {
      fNum,
      gaugeUser,
      pendingRewards,
      isPendingRewardsLoading,
      harvesting,
      harvestRewards,
      gaugeUserBalanceUsd,
      gaugeBptBalanceUsd
    };
  }
});
</script>
