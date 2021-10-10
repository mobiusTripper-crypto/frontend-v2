<template>
  <div class="lg:container lg:mx-auto pt-24 md:pt-16">
    <template v-if="isWalletReady && userPools && userPools.length > 0">
      <div class="px-4 lg:px-0">
        <h3 class="mb-4">My Investments</h3>
      </div>
      <PoolsTable
        :isLoading="isLoadingUserPools"
        :data="userPools"
        :noPoolsLabel="$t('noInvestments')"
        showPoolShares
        class="mb-8"
      />
      <div class="px-4 lg:px-0" v-if="!hideV1Links">
        <div class="text-black-600">{{ $t('seeV1BalancerInvestments') }}</div>
        <BalLink :href="EXTERNAL_LINKS.Balancer.PoolsV1Dashboard" external>{{
          $t('goToBalancerV1Site')
        }}</BalLink>
      </div>
      <div class="mb-16" />
    </template>

    <template v-if="isWalletReady && poolsWithUserInFarm.length > 0">
      <div class="mb-16">
        <div class="px-4 lg:px-0">
          <h3 class="mb-3">My Farms</h3>
        </div>
        <FarmsTable
          :pools="poolsWithUserInFarm"
          noPoolsLabel="No farms found"
          :loading="false"
          :isPaginated="false"
          :isLoadingMore="false"
          class="mb-8"
        />
      </div>
    </template>

    <div class="px-4 lg:px-0">
      <h3 class="mb-3">{{ $t('investmentPools') }}</h3>
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
      class="mb-8"
    />
    <div class="px-4 lg:px-0" v-if="!hideV1Links">
      <div class="text-black-600">
        {{ $t('tableShowsBalancerV2Pools') }}
      </div>
      <BalLink :href="EXTERNAL_LINKS.Balancer.PoolsV1Explore" external>{{
        $t('exploreBalancerV1Pools')
      }}</BalLink>
    </div>
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
import FarmsTable from '@/components/tables/FarmsTable/FarmsTable.vue';

export default defineComponent({
  components: {
    TokenSearchInput,
    PoolsTable,
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
      poolsWithFarms,
      onlyPoolsWithFarms,
      userPools,
      isLoadingPools,
      isLoadingUserPools,
      isLoadingFarms,
      loadMorePools,
      poolsHasNextPage,
      poolsIsFetchingNextPage
    } = usePools(selectedTokens);

    // COMPUTED
    const filteredPools = computed(() => {
      return selectedTokens.value.length > 0
        ? poolsWithFarms.value?.filter(pool => {
            return selectedTokens.value.every((selectedToken: string) =>
              pool.tokenAddresses.includes(selectedToken)
            );
          })
        : poolsWithFarms?.value;
    });

    const hideV1Links = computed(() => !isV1Supported);

    const poolsWithUserInFarm = computed(() => {
      console.log('pools with user in farm', onlyPoolsWithFarms.value);
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
      hideV1Links,
      poolsHasNextPage,
      poolsIsFetchingNextPage,
      selectedTokens,

      //methods
      router,
      loadMorePools,
      addSelectedToken,
      removeSelectedToken,

      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>
