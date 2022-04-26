<template>
  <BalLoadingBlock v-if="lockUserDataLoading" class="h-64" />
  <BalCard v-else growContent>
    <div class="flex flex-col w-full h-full bg-transparent">
      <div class="pb-3 border-b">
        <div class="text-sm text-gray-500 font-medium mb-2">
          My Voting Power
          <BalTooltip>
            <template v-slot:activator>
              <BalIcon name="info" size="xs" class="text-gray-400 ml-1 flex" />
            </template>
            <div>
              Newly locked fBEETS will be added to your voting power at the
              start of the next epoch. Relocked fBEETS will be added
              immediately. Unlocked fBEETS will be removed from your voting
              power. The percentage shows the ratio of voting power vs locked
              plus unlocked.
            </div>
          </BalTooltip>
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ fNum(lockingUserVotingPower) }}&nbsp;
          <span class="text-sm text-gray-500 font-medium mt-1 text-left">
            ({{ fNum(lockedToVotingPowerRatio, 'percent') }})
          </span>
        </div>
      </div>
      <div class="pt-3">
        <div class="text-sm text-gray-500 font-medium mb-2">
          My Unlocked fBEETS
          <BalTooltip>
            <template v-slot:activator>
              <BalIcon name="info" size="xs" class="text-gray-400 ml-1 flex" />
            </template>
            <div>
              You can relock ALL your unlocked fBEETS to regain voting power or
              you can withdraw ALL of them below.
            </div>
          </BalTooltip>
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ fNum(totalUnlockedAmount) }}
        </div>
      </div>
    </div>
    <template v-slot:footer>
      <BalBtn
        label="Relock All"
        block
        color="gradient"
        :disabled="totalUnlockedAmount === '0'"
        :loading="relocking"
        @click.prevent="relockTokens"
      />
    </template>
  </BalCard>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import useNumbers from '@/composables/useNumbers';
import useEthers from '@/composables/useEthers';
import { useLockUser } from '@/beethovenx/composables/lock/useLockUser';

export default defineComponent({
  name: 'LockMyStatsCard',

  components: {},

  setup() {
    const { fNum } = useNumbers();
    const { txListener } = useEthers();
    const {
      totalUnlockedAmount,
      lockingUserVotingPower,
      lockedToVotingPowerRatio,
      relock,
      lockUserQuery,
      lockUserDataLoading
    } = useLockUser();
    const relocking = ref(false);

    async function relockTokens(): Promise<void> {
      relocking.value = true;
      const tx = await relock();

      if (!tx) {
        relocking.value = false;
        return;
      }

      txListener(tx, {
        onTxConfirmed: async () => {
          await lockUserQuery.refetch.value();
          relocking.value = false;
        },
        onTxFailed: () => {
          relocking.value = false;
        }
      });
    }

    return {
      fNum,
      relockTokens,
      lockingUserVotingPower,
      totalUnlockedAmount,
      lockUserDataLoading,
      lockedToVotingPowerRatio,
      relocking
    };
  }
});
</script>
