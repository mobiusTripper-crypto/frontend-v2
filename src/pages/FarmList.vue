<template>
  <FarmsHero :decorated-farms="decoratedFarms" :loading="isLoading" />
  <div class="lg:container lg:mx-auto pt-10 md:pt-12">
    <!--    <div class="px-4 lg:px-0">
      <h3 class="mb-3">Farms</h3>
    </div>-->
    <!--    <h2 class="mb-3 text-center">
      Farms coming soon. Follow us on
      <a href="https://twitter.com/beethoven_x" class="text-green-500"
        >Twitter</a
      >
      for more updates.
    </h2>
    <div class="flex justify-center mt-12">
      <img src="~@/assets/images/looking-image.png" width="400" />
    </div>-->

    <div>
      <div class="px-4 lg:px-0">
        <h3 class="mb-3">Farms</h3>
      </div>
      <FarmsTable
        :decorated-farms="decoratedFarms"
        noPoolsLabel="No farms found"
        :loading="isLoading"
        :isPaginated="false"
        :isLoadingMore="false"
        class="mb-8"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { EXTERNAL_LINKS } from '@/constants/links';
import useWeb3 from '@/services/web3/useWeb3';
import FarmsTable from '@/components/tables/FarmsTable/FarmsTable.vue';
import FarmsHero from '@/components/heros/FarmsHero.vue';
import useFarms from '@/composables/farms/useFarms';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import useAverageBlockTime from '@/composables/useAverageBlockTime';
import usePools from '@/composables/pools/usePools';
import useAllFarmsForUserQuery from '@/composables/queries/useAllFarmsForUserQuery';
import { decorateFarms } from '@/lib/utils/farmHelper';
import useProtocolDataQuery from '@/composables/queries/useProtocolDataQuery';

export default defineComponent({
  components: {
    FarmsHero,
    FarmsTable
  },

  setup() {
    // COMPOSABLES
    const router = useRouter();
    const { isWalletReady } = useWeb3();

    // const pendingBeetx = masterChefContractsService.masterChef.withdrawAndHarvest(4, 1,'0xd3F32d840f684061eEB2B6c6B78cA346C3fe0030').then(beetx => {
    //   console.log('withdraw')
    // }).catch(error => console.error("ERRor fetcing beetx", error));

    // COMPUTED

    const { farms, isLoadingFarms } = useFarms();
    const { selectedTokens } = usePoolFilters();
    const { blocksPerYear, blocksPerDay } = useAverageBlockTime();
    const { pools, isLoadingPools } = usePools(selectedTokens);
    const protocolDataQuery = useProtocolDataQuery();
    const beetsPrice = computed(
      () => protocolDataQuery.data?.value?.beetsPrice || 0
    );
    const allFarmsUserQuery = useAllFarmsForUserQuery();
    const allFarmsForUser = computed(() => allFarmsUserQuery.data.value || []);

    const decoratedFarms = computed(() => {
      return decorateFarms(
        pools.value,
        farms.value,
        allFarmsForUser.value,
        blocksPerYear.value,
        blocksPerDay.value,
        beetsPrice.value
      );
    });

    return {
      // data

      // computed
      isWalletReady,

      decoratedFarms,
      isLoading:
        isLoadingPools || isLoadingFarms || allFarmsUserQuery.isLoading,

      //methods
      router,
      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>
