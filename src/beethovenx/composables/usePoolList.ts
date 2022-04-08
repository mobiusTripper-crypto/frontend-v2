import { computed, ref, Ref } from 'vue';
import {
  GqlBeetsConfigFeaturedPool,
  PoolListItem
} from '@/beethovenx/services/beethovenx/beethovenx-types';
import usePoolListQuery from '@/beethovenx/composables/queries/usePoolListQuery';
import useBeethovenxConfig from '@/beethovenx/composables/useBeethovenxConfig';
import { PoolType } from '@/services/balancer/subgraph/types';
import { flatten, cloneDeep } from 'lodash';

export default function usePoolList(
  activeFilters: Ref<string[]> = ref([]),
  selectedTokens: Ref<string[]> = ref([])
) {
  const poolListQuery = usePoolListQuery();
  const { beethovenxConfig, beethovenxConfigLoading } = useBeethovenxConfig();

  const poolListLoading = computed(
    () =>
      poolListQuery.isLoading.value ||
      poolListQuery.isIdle.value ||
      beethovenxConfigLoading.value
  );

  const poolList = computed<PoolListItem[]>(
    () => poolListQuery.data.value || []
  );

  const poolListWithoutLinear = computed<PoolListItem[]>(() =>
    poolList.value.filter(pool => pool.poolType !== PoolType.Linear)
  );

  const incentivizedPools = computed<PoolListItem[]>(() =>
    poolListWithoutLinear.value.filter(pool =>
      beethovenxConfig.value.incentivizedPools.includes(pool.id)
    )
  );

  const communityPools = computed<PoolListItem[]>(() =>
    poolListWithoutLinear.value.filter(
      pool => !beethovenxConfig.value.incentivizedPools.includes(pool.id)
    )
  );

  const homeFeaturedPools = computed<
    { pool: PoolListItem; data: GqlBeetsConfigFeaturedPool }[]
  >(() => {
    return beethovenxConfig.value.homeFeaturedPools
      .map(data => ({
        data,
        pool: poolListWithoutLinear.value.find(pool => pool.id === data.poolId)!
      }))
      .slice(0, 4);
  });

  const featuredPools = computed<PoolListItem[]>(() => {
    const filteredPoolList = poolListWithoutLinear.value
      .filter(pool => beethovenxConfig.value.featuredPools.includes(pool.id))
      .slice(0, 4);

    /* This is a quick fix added to filter out the phantomBpt Token from the feature pool list */
    const filteredFor4pool = cloneDeep(filteredPoolList);
    filteredFor4pool.forEach((pool, index, theArray) => {
      if (
        pool.id ===
        '0x6da14f5acd58dd5c8e486cfa1dc1c550f5c61c1c0000000000000000000003cf'
      ) {
        const filteredTokens = pool.tokens.filter(token => !token.isPhantomBpt);
        theArray[index].tokens = filteredTokens;
      }
    });
    /* End of quick fix 4pool code */
    return filteredFor4pool;
  });

  const filteredPools = computed<PoolListItem[]>(() => {
    if (selectedTokens.value.length === 0) {
      return poolListWithoutLinear.value;
    }

    return poolListWithoutLinear.value.filter(pool =>
      selectedTokens.value.every(
        (selectedToken: string) =>
          pool.tokensList.includes(selectedToken.toLowerCase()) ||
          (pool.mainTokens || []).includes(selectedToken)
      )
    );
  });

  const filteredIncentivizedPools = computed<PoolListItem[]>(() => {
    if (activeFilters.value.length === 0) {
      return filteredPools.value.filter(pool =>
        beethovenxConfig.value.incentivizedPools.includes(pool.id)
      );
    }

    const selected = beethovenxConfig.value.poolFilters.filter(filter =>
      activeFilters.value.includes(filter.id)
    );
    const poolIds = flatten(selected.map(selected => selected.pools));

    return filteredPools.value.filter(
      pool =>
        poolIds.includes(pool.id) &&
        beethovenxConfig.value.incentivizedPools.includes(pool.id)
    );
  });

  const filteredCommunityPools = computed<PoolListItem[]>(() => {
    return filteredPools.value.filter(
      pool => !beethovenxConfig.value.incentivizedPools.includes(pool.id)
    );
  });

  return {
    poolListQuery,
    poolListLoading,
    poolList,
    incentivizedPools,
    communityPools,
    featuredPools,
    filteredIncentivizedPools,
    filteredCommunityPools,
    homeFeaturedPools
  };
}
