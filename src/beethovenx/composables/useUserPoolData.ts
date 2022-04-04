import { computed, Ref } from 'vue';
import { GqlBeetsUserPoolPoolData } from '@/beethovenx/services/beethovenx/beethovenx-types';
import useAllUserPoolData from '@/beethovenx/composables/useAllUserPoolData';

export default function useUserPoolData(poolId: Ref<string>) {
  const { allUserPoolData, userPoolDataLoading } = useAllUserPoolData();

  const isLoadingUserPoolData = computed(() => userPoolDataLoading.value);

  const userPoolData = computed<GqlBeetsUserPoolPoolData | null>(() => {
    return (
      allUserPoolData.value.pools.find(pool => pool.poolId === poolId.value) ||
      null
    );
  });

  return {
    isLoadingUserPoolData,
    userPoolData
  };
}
