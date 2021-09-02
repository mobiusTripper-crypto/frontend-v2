import { computed, ComputedRef } from 'vue';
import { flatten } from 'lodash';
import useFarmsQuery from '@/composables/queries/useFarmsQuery';
import { Farm } from '@/services/balancer/subgraph/types';

export default function useFarms(): {
  farms: ComputedRef<Farm[]>;
  isLoadingFarms: ComputedRef<boolean>;
} {
  const farmsQuery = useFarmsQuery();
  const farms: ComputedRef<Farm[]> = computed(() =>
    farmsQuery.data.value
      ? flatten(farmsQuery.data.value.pages.map(page => page.farms))
      : []
  );

  const isLoadingFarms = computed(
    () => farmsQuery.isLoading.value || farmsQuery.isIdle.value
  );

  return {
    farms,
    isLoadingFarms
  };
}
