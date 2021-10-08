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

    <template v-if="isWalletReady && userFarms && userFarms.length > 0">
      <div class="mb-16">
        <div class="px-4 lg:px-0">
          <h3 class="mb-3">My Farms</h3>
        </div>
        <FarmsTable
          :decorated-farms="userFarms"
          :loading="isLoadingDecoratedFarms"
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
import { defineComponent, computed } from 'vue';
import { useRouter } from 'vue-router';
import { EXTERNAL_LINKS } from '@/constants/links';
import TokenSearchInput from '@/components/inputs/TokenSearchInput.vue';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import usePools from '@/composables/pools/usePools';
import useWeb3 from '@/services/web3/useWeb3';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import useProtocolDataQuery from '@/composables/queries/useProtocolDataQuery';
import useDecoratedFarms from '@/composables/farms/useDecoratedFarms';
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
      pools,
      userPools,
      isLoadingPools,
      isLoadingUserPools,
      loadMorePools,
      poolsHasNextPage,
      poolsIsFetchingNextPage
    } = usePools(selectedTokens);
    const { decoratedFarms, isLoadingDecoratedFarms } = useDecoratedFarms();

    // COMPUTED
    const filteredPools = computed(() => {
      const filtered =
        selectedTokens.value.length > 0
          ? pools.value?.filter(pool => {
              return selectedTokens.value.every((selectedToken: string) =>
                pool.tokenAddresses.includes(selectedToken)
              );
            })
          : pools?.value;

      return filtered?.filter(
        pool =>
          pool.id !==
          '0x5856cee862de908d63062b891d526ce78183eb8c000200000000000000000014'
      );
    });

    const hideV1Links = computed(() => !isV1Supported);

    const userFarms = computed(() =>
      decoratedFarms.value.filter(farm => farm.stake > 0)
    );

    return {
      // data
      filteredPools,
      userPools,
      isLoadingPools,
      isLoadingUserPools,
      userFarms,
      isLoadingDecoratedFarms,

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
