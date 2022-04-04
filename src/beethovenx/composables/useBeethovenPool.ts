import { computed, ref, Ref } from 'vue';
import {
  GqlBalancerPool,
  GqlBeetsConfigFeaturedPool,
  PoolListItem
} from '@/beethovenx/services/beethovenx/beethovenx-types';
import usePoolListQuery from '@/beethovenx/composables/queries/usePoolListQuery';
import useBeethovenxConfig from '@/beethovenx/composables/useBeethovenxConfig';
import { PoolType } from '@/services/balancer/subgraph/types';
import { flatten } from 'lodash';
import useBeethovenPoolQuery from '@/beethovenx/composables/queries/useBeethovenPoolQuery';

export default function useBeethovenPool(id: Ref<string>) {
  const poolQuery = useBeethovenPoolQuery(id);

  const isLoadingBeethovenPool = computed(
    () => poolQuery.isLoading.value || poolQuery.isIdle.value
  );

  const beethovenPool = computed<GqlBalancerPool | undefined>(
    () => poolQuery.data.value
  );

  const poolHasFarmRewards = computed(() => {
    const pool = beethovenPool.value;

    if (!pool) {
      return false;
    }

    return pool.farm?.rewardTokens && pool.farm.rewardTokens.length > 0;
  });

  return {
    isLoadingBeethovenPool,
    beethovenPool,
    poolHasFarmRewards
  };
}
