import { inject, onBeforeMount, Ref, watch } from 'vue';
import {
  AllowancesProviderSymbol,
  AllowancesProviderPayload
} from '@/plugins/providers/allowances.provider';

type UseAccountPayload = {
  tokens?: Ref<string[]>;
  dstList?: Ref<string[]>;
};

// THE CONTENTS OF THIS WILL BE REPLACED/ALTERED WITH THE REGISTRY REFACTOR
export default function useAllowances(payload?: UseAccountPayload) {
  const {
    allowances,
    getRequiredAllowances,
    isLoading: isLoadingOrFetching,
    refetchAllowances,
    updateAllowanceRequest
  } = inject(AllowancesProviderSymbol) as AllowancesProviderPayload;

  onBeforeMount(() => {
    if (payload) {
      updateAllowanceRequest(payload);
    }
  });

  return {
    allowances,
    getRequiredAllowances,
    isLoading: isLoadingOrFetching,
    refetchAllowances
  };
}
