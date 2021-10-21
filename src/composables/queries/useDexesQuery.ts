import { computed, reactive, Ref } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/constants/queryKeys';
import useApp from '@/composables/useApp';
import { dexContractsService } from '@/services/dex/dex-contracts.service';
import { GetAmountsOutInput } from '@/services/dex/dex-contract-types';

interface QueryResponse {
  output: number;
}

export default function useDexesQuery(
  inputs: Ref<GetAmountsOutInput[]>,
  options: UseQueryOptions<QueryResponse> = {}
) {
  /**
   * COMPOSABLES
   */
  const { appLoading } = useApp();

  // COMPUTED
  const enabled = computed(() => !appLoading.value);

  /**
   * QUERY INPUTS
   */
  const queryKey = reactive(QUERY_KEYS.Dexes.GetAmountsOut(inputs));

  const queryFn = async () => {
    const result = {
      spooky: await dexContractsService.spookySwap.getAmountsOut(inputs.value),
      spirit: await dexContractsService.spiritSwap.getAmountsOut(inputs.value)
    };

    console.log('result', result);

    return {
      output: 0
    };
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
