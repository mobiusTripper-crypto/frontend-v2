<template>
  <BalLoadingBlock v-if="lockRewardDataLoading" class="h-64" />
  <BalCard v-else growContent>
    <div class="text-sm text-gray-500 font-medium mb-2">
      My Pending Rewards
    </div>
    <div
      v-for="(reward, index) in rewards"
      :key="index"
      class="text-xl font-medium truncate flex items-center"
    >
      {{ fNum(reward.amount, 'token_fixed') }} BEETS
    </div>
    <div class="text-sm text-gray-500 font-medium mt-1 text-left">
      {{ fNum(totalRewardsUsd, 'usd') }}
    </div>
    <template v-slot:footer>
      <BalBtn
        label="Claim All"
        block
        color="gradient"
        :disabled="totalRewards <= 0"
        :loading="gettingReward"
        @click.prevent="getLockReward"
      />
    </template>
  </BalCard>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import useNumbers from '@/composables/useNumbers';
import useEthers from '@/composables/useEthers';
import { useLockUser } from '@/beethovenx/composables/lock/useLockUser';
import { useLockRewards } from '@/beethovenx/composables/lock/useLockRewards';
import { sumBy } from 'lodash';

export default defineComponent({
  name: 'LockClaimRewardsCard',

  components: {},

  setup() {
    const { fNum } = useNumbers();
    const { txListener } = useEthers();
    const { getReward } = useLockUser();
    const {
      rewards,
      lockRewardsQuery,
      lockRewardDataLoading
    } = useLockRewards();
    const gettingReward = ref(false);

    const totalRewards = computed(() => sumBy(rewards.value, 'amount'));
    const totalRewardsUsd = computed(() => sumBy(rewards.value, 'amountUsd'));

    async function getLockReward(): Promise<void> {
      gettingReward.value = true;
      const tx = await getReward();

      if (!tx) {
        gettingReward.value = false;
        return;
      }

      txListener(tx, {
        onTxConfirmed: async () => {
          await lockRewardsQuery.refetch.value();
          gettingReward.value = false;
        },
        onTxFailed: () => {
          gettingReward.value = false;
        }
      });
    }

    return {
      fNum,
      getLockReward,
      totalRewards,
      totalRewardsUsd,
      rewards,
      gettingReward,
      lockRewardDataLoading
    };
  }
});
</script>
