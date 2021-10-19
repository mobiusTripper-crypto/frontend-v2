<template>
  <div class="lg:container lg:mx-auto pt-12 md:pt-12">
    <PortfolioHeader :data="currentData" />
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
        class="grid grid-cols-1 xl:grid-cols-4 gap-y-8 gap-x-0 xl:gap-x-8 mb-12"
      >
        <div class="col-span-3">
          <PortfolioPoolsStatCards :pools="currentData.pools" />
          <div>
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
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { EXTERNAL_LINKS } from '@/constants/links';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import usePools from '@/composables/pools/usePools';
import useWeb3 from '@/services/web3/useWeb3';
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
    PortfolioAssetsPieChart,
    PoolsTable,
    FarmsTable
  },

  setup() {
    // COMPOSABLES
    const router = useRouter();
    const { isWalletReady } = useWeb3();

    const {
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
      poolsWithUserInFarm,
      userPools,
      isLoadingPools,
      isLoadingUserPools,
      isLoadingFarms,

      // computed
      isWalletReady,
      poolsHasNextPage,
      poolsIsFetchingNextPage,

      //methods
      router,
      loadMorePools,
      chartColors,
      portfolioData,
      currentData,
      timestamps,
      fees,
      volume,
      fNum,
      avgFees,

      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>
