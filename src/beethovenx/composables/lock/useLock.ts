import useLockQuery from '@/beethovenx/composables/lock/useLockQuery';
import { computed } from 'vue';
import { sumBy } from 'lodash';

export function useLock() {
  const lockQuery = useLockQuery();
  const { isLoading, data } = lockQuery;

  const lockDataLoading = computed(() => isLoading.value);

  const totalLockedAmount = computed(
    () => data.value?.locker.totalLockedAmount
  );
  const totalLockedUsd = computed(() => data.value?.locker.totalLockedUsd);
  const totalLockedPercentage = computed(
    () => data.value?.locker.totalLockedPercentage
  );
  const timestamp = computed(() => data.value?.locker.timestamp);
  const block = computed(() => data.value?.locker.block);

  const totalRewardsApr = computed(() => {
    const tokens = data.value?.lockingRewardTokens;
    return sumBy(tokens, token => parseFloat(token.apr));
  });

  return {
    lockDataLoading,
    totalLockedAmount,
    totalLockedUsd,
    totalLockedPercentage,
    timestamp,
    block,
    totalRewardsApr
  };
}
