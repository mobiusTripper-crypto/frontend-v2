<template>
  <div class="lg:container lg:mx-auto pt-10 md:pt-12">
    <div class="px-4 lg:px-0">
      <h3 class="mb-3">Farms</h3>
    </div>
    <FarmsTable
      :isLoading="isLoadingPools"
      :data="decoratedFarms"
      :blocksPerDay="blocksPerDay"
      :blocksPerYear="blocksPerYear"
      :noPoolsLabel="$t('noPoolsFound')"
      :isPaginated="poolsHasNextPage"
      :isLoadingMore="poolsIsFetchingNextPage"
      @loadMore="loadMorePools"
      class="mb-8"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRouter } from 'vue-router';
import { EXTERNAL_LINKS } from '@/constants/links';
import usePools from '@/composables/pools/usePools';
import useWeb3 from '@/services/web3/useWeb3';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import FarmsTable from '@/components/tables/FarmsTable/FarmsTable.vue';
import useFarms from '@/composables/farms/useFarms';
import useAverageBlockTime from '@/composables/useAverageBlockTime';

export default defineComponent({
  components: {
    FarmsTable
  },

  setup() {
    // COMPOSABLES
    const router = useRouter();
    const { isWalletReady, isV1Supported } = useWeb3();
    const {
      selectedTokens,
      addSelectedToken,
      removeSelectedToken
    } = usePoolFilters();

    const {
      pools,
      userPools,
      isLoadingPools,
      isLoadingUserPools,
      loadMorePools,
      poolsHasNextPage,
      poolsIsFetchingNextPage
    } = usePools(selectedTokens);

    const { farms, isLoadingFarms } = useFarms();
    const { blocksPerDay, blocksPerYear } = useAverageBlockTime();

    const decoratedFarms = computed(() =>
      farms.value.length > 0 && pools.value.length > 0
        ? farms.value.map(farm => {
            const pool = pools.value.find(
              pool => pool.address.toLowerCase() === farm.pair.toLowerCase()
            );

            return { ...farm, pool };
          })
        : []
    );

    // COMPUTED
    const filteredPools = computed(() =>
      selectedTokens.value.length > 0
        ? pools.value?.filter(pool => {
            pool.address;
            return selectedTokens.value.every((selectedToken: string) =>
              pool.tokenAddresses.includes(selectedToken)
            );
          })
        : pools?.value
    );

    const hideV1Links = computed(() => !isV1Supported);

    return {
      // data
      filteredPools,
      userPools,
      isLoadingPools,
      isLoadingUserPools,

      // computed
      isWalletReady,
      hideV1Links,
      poolsHasNextPage,
      poolsIsFetchingNextPage,
      selectedTokens,
      blocksPerDay,
      blocksPerYear,

      //methods
      router,
      loadMorePools,
      addSelectedToken,
      removeSelectedToken,

      decoratedFarms,

      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>
