import { computed, ComputedRef } from 'vue';
import { flatten } from 'lodash';
import useFarmsQuery from '@/composables/queries/useFarmsQuery';
import { Farm, FarmUser } from '@/services/balancer/subgraph/types';
import useAllFarmsForUserQuery from '@/composables/queries/useAllFarmsForUserQuery';

export default function useFarms(): {
  farms: ComputedRef<Farm[]>;
  allFarmsForUser: ComputedRef<FarmUser[]>;
  isLoadingFarms: ComputedRef<boolean>;
} {
  const farmsQuery = useFarmsQuery();
  const allFarmsUserQuery = useAllFarmsForUserQuery();
  const allFarmsForUser = computed(() => allFarmsUserQuery.data.value || []);

  const farms: ComputedRef<Farm[]> = computed(() =>
    farmsQuery.data.value
      ? flatten(farmsQuery.data.value.pages.map(page => page.farms))
      : []
  );

  const isLoadingFarms = computed(
    () =>
      farmsQuery.isLoading.value ||
      farmsQuery.isIdle.value ||
      allFarmsUserQuery.isLoading.value
  );

  return {
    farms,
    allFarmsForUser,
    isLoadingFarms
  };
}
