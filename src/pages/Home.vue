<template>
  <div class="lg:container lg:mx-auto pt-12 md:pt-12">
    <PortfolioHeader />
    <div
      class="grid grid-cols-1 xl:grid-cols-4 gap-y-8 gap-x-0 xl:gap-x-8 mb-16"
    >
      <div class="col col-span-1">
        <PortfolioAssetsPieChart :assets="currentData.tokens" />
      </div>
      <div class="col col-span-3">
        <PortfolioValueLineChart
          :assets="currentData.tokens"
          :data="portfolioData"
        />
      </div>
    </div>
    <template v-if="isWalletReady && userPools && userPools.length > 0">
      <div class="px-4 lg:px-0">
        <h2 class="mb-6 text-green-500">My Investments</h2>
      </div>
      <div
        class="grid grid-cols-1 lg:grid-cols-4 gap-y-8 gap-x-0 lg:gap-x-8 mb-12"
      >
        <div class="col-span-3">
          <PortfolioPoolsStatCards :pools="currentData.pools" />
          <div class="mb-8">
            <PortfolioStatWithBarChart
              title="My Fees (24h)"
              :sub-title="`Avg: ${fNum(avgFees, 'usd')}/day`"
              :stat="fNum(currentData.myFees, 'usd')"
              info-text="Info text"
              :dates="timestamps"
              :data="fees"
              :bar-color="chartColors[2]"
            />
          </div>
          <!--          <PortfolioStatWithBarChart
            title="Volume (24h)"
            :sub-title="`Across ${currentData.pools.length} pools`"
            :stat="fNum(currentData.totalVolume, 'usd')"
            info-text="Info text"
            :dates="timestamps"
            :data="volume"
            :bar-color="chartColors[1]"
          />-->
        </div>
        <div>
          <PortfolioPoolsPieChart :pools="currentData.pools" />
        </div>
      </div>

      <h4 class="mb-4">My Investment Pools</h4>
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
      <div class="mb-12" />
    </template>

    <template v-if="isWalletReady && poolsWithUserInFarm.length > 0">
      <div class="mb-16">
        <div class="px-4 lg:px-0">
          <h4 class="mb-4">My Farms</h4>
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
      <h3 class="mb-3">Beethoven-X Investment Pools</h3>
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
    <div class="px-4 lg:px-0 mb-3">
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
import { masterChefContractsService } from '@/services/farm/master-chef-contracts.service';
import PortfolioAssetsPieChart from '@/components/pages/portfolio/PortfolioAssetsPieChart.vue';
import PortfolioPoolsPieChart from '@/components/pages/portfolio/PortfolioPoolsPieChart.vue';
import PortfolioValueLineChart from '@/components/pages/portfolio/PortfolioValueLineChart.vue';
import PortfolioStatWithBarChart from '@/components/pages/portfolio/PortfolioStatWithBarChart.vue';
import { chartColors } from '@/constants/colors';
import PortfolioHeader from '@/components/pages/portfolio/PortfolioHeader.vue';
import portfolioData from '../../data.json';
import currentData from '../../currentData.json';
import { orderBy, sum } from 'lodash';
import useNumbers from '@/composables/useNumbers';
import PortfolioPoolsStatCards from '@/components/pages/portfolio/PortfolioPoolsStatCards.vue';

export default defineComponent({
  components: {
    PortfolioPoolsStatCards,
    PortfolioHeader,
    PortfolioPoolsPieChart,
    PortfolioStatWithBarChart,
    PortfolioValueLineChart,
    //PortfolioPoolsPieChart,
    PortfolioAssetsPieChart,
    TokenSearchInput,
    PoolsTable,
    FarmsTable
  },

  setup() {
    // COMPOSABLES
    const router = useRouter();
    const { isWalletReady, isV1Supported, appNetworkConfig } = useWeb3();
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

    const { fNum } = useNumbers();

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

    const hideV1Links = computed(() => !isV1Supported);

    const poolsWithUserInFarm = computed(() => {
      return onlyPoolsWithFarms.value.filter(pool => pool.farm.stake > 0);
    });

    masterChefContractsService.beethovenxToken.getCirculatingSupply();

    const timestamps = computed(() =>
      orderBy(portfolioData, 'timestamp', 'asc').map(item => item.timestamp)
    );

    const volume = computed(() =>
      orderBy(portfolioData, 'timestamp', 'asc').map(item => item.totalVolume)
    );
    const fees = computed(() =>
      orderBy(portfolioData, 'timestamp', 'asc').map(item => item.myFees)
    );
    const avgFees = computed(() => sum(fees.value) / fees.value.length);

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
      communityPools,
      chartColors,
      portfolioData,
      currentData,
      timestamps,
      fees,
      volume,
      fNum,
      avgFees,
      /*portfolioData: map(portfolioData, (item, timestamp) => {
        const totalValue = sumBy(item.tokens, 'totalPrice');

        return {
          timestamp: parseInt(timestamp),
          totalValue: sumBy(item.tokens, 'totalPrice'),
          totalFees: 0,
          totalVolume: 0,
          myFees: 0,
          tokens: sortBy(item.tokens, 'totalPrice').map(token => ({
            ...token,
            percentOfPortfolio: token.totalPrice / totalValue
          })),
          pools: item.pools
        };
      }),*/

      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>
