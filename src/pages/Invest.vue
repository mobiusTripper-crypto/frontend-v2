<template>
  <div class="mb-4 pt-12">
    <h2 class="text-green-500">Beethoven-X Investment Pools</h2>
    <!--    <p>
      Investment pools created by the community. Please DYOR before investing in
      any community pool.
    </p>-->
  </div>
  <div class="lg:container lg:mx-auto pt-8">
    <div class="px-4 lg:px-0">
      <!--      <h3 class="mb-3">Beethoven-X Investment Pools</h3>-->
      <TokenSearchInput
        v-model="selectedTokens"
        :loading="isLoadingPools"
        @add="addSelectedToken"
        @remove="removeSelectedToken"
      />
    </div>
    <PoolsTable
      :isLoading="isLoadingPools"
      :data="filteredPools"
      :noPoolsLabel="$t('noPoolsFound')"
      :isPaginated="poolsHasNextPage"
      :isLoadingMore="poolsIsFetchingNextPage"
      @loadMore="loadMorePools"
      class="mb-16"
    />
    <div class="px-4 lg:px-0 pb-2">
      <h3>Community Investment Pools</h3>
      <p>
        Investment pools created by the community. Please DYOR before investing
        in any community pool.
      </p>
    </div>
    <PoolsTable
      :isLoading="isLoadingPools"
      :data="communityPools"
      :noPoolsLabel="$t('noPoolsFound')"
      :isPaginated="poolsHasNextPage"
      :isLoadingMore="poolsIsFetchingNextPage"
      @loadMore="loadMorePools"
      class="mb-8"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { EXTERNAL_LINKS } from '@/constants/links';
import TokenSearchInput from '@/components/inputs/TokenSearchInput.vue';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import usePools from '@/composables/pools/usePools';
import useWeb3 from '@/services/web3/useWeb3';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import AppHero from '@/components/heros/AppHero.vue';

export default defineComponent({
  components: {
    TokenSearchInput,
    PoolsTable
  },

  setup() {
    // COMPOSABLES
    const router = useRouter();
    const { isWalletReady, appNetworkConfig } = useWeb3();
    const {
      selectedTokens,
      addSelectedToken,
      removeSelectedToken
    } = usePoolFilters();

    const {
      poolsWithFarms,
      onlyPoolsWithFarms,
      userPools,
      isLoadingPools,
      isLoadingUserPools,
      isLoadingFarms,
      loadMorePools,
      poolsHasNextPage,
      poolsIsFetchingNextPage
    } = usePools();

    //TODO: this will break down once pagination starts happening
    const communityPools = computed(() => {
      return poolsWithFarms.value?.filter(
        pool => !appNetworkConfig.incentivizedPools.includes(pool.id)
      );
    });

    // COMPUTED
    const filteredPools = computed(() => {
      return selectedTokens.value.length > 0
        ? poolsWithFarms.value?.filter(pool => {
            return (
              selectedTokens.value.every((selectedToken: string) =>
                pool.tokenAddresses.includes(selectedToken)
              ) && appNetworkConfig.incentivizedPools.includes(pool.id)
            );
          })
        : poolsWithFarms?.value.filter(pool =>
            appNetworkConfig.incentivizedPools.includes(pool.id)
          );
    });

    const poolsWithUserInFarm = computed(() => {
      return onlyPoolsWithFarms.value.filter(pool => pool.farm.stake > 0);
    });

    return {
      // data
      filteredPools,
      poolsWithUserInFarm,
      userPools,
      isLoadingPools,
      isLoadingUserPools,
      isLoadingFarms,

      // computed
      isWalletReady,
      poolsHasNextPage,
      poolsIsFetchingNextPage,
      selectedTokens,

      //methods
      router,
      loadMorePools,
      addSelectedToken,
      removeSelectedToken,
      communityPools,

      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>
