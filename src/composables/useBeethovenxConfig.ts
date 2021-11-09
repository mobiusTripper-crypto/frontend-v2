import { computed } from 'vue';
import useBeethovenxConfigQuery from '@/composables/queries/useBeethovenxConfigQuery';
import { BeethovenxConfig } from '@/services/beethovenx/beethovenx.service';

export default function useBeethovenxConfig() {
  const beethovenxConfigQuery = useBeethovenxConfigQuery();

  const beethovenxConfigLoading = computed(
    () =>
      beethovenxConfigQuery.isLoading.value ||
      beethovenxConfigQuery.isIdle.value
  );

  const beethovenxConfig = computed(
    (): BeethovenxConfig =>
      beethovenxConfigQuery.data.value
        ? beethovenxConfigQuery.data.value
        : { incentivizedPools: [], blacklistedPools: [], pausedPools: [] }
  );

  return {
    beethovenxConfigLoading,
    beethovenxConfig
  };
}
