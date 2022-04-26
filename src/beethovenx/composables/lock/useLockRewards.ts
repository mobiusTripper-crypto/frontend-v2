import useLockRewardsQuery from '@/beethovenx/composables/lock/useLockRewardsQuery';
import { computed } from 'vue';

export function useLockRewards() {
  const lockRewardsQuery = useLockRewardsQuery();
  const { isLoading, data } = lockRewardsQuery;

  const lockRewardDataLoading = computed(() => isLoading.value);

  const rewards = computed(() => data.value?.lockingPendingRewards);

  return {
    lockRewardDataLoading,
    lockRewardsQuery,
    rewards
  };
}
