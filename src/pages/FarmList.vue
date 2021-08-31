<template>
  <div class="lg:container lg:mx-auto pt-10 md:pt-12">
    <div class="px-4 lg:px-0">
      <h3 class="mb-3">Farms</h3>
    </div>
    <FarmsTable
      :isLoading="isLoadingPools || isLoadingFarms"
      :data="decoratedFarms"
      :blocksPerDay="blocksPerDay"
      :blocksPerYear="blocksPerYear"
      noPoolsLabel="No farms found"
      :isPaginated="false"
      :isLoadingMore="false"
      class="mb-8"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
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

    // const pendingBeetx = masterChefContractsService.masterChef.withdrawAndHarvest(4, 1,'0xd3F32d840f684061eEB2B6c6B78cA346C3fe0030').then(beetx => {
    //   console.log('withdraw')
    // }).catch(error => console.error("ERRor fetcing beetx", error));

    // COMPUTED

    return {
      // data

      // computed
      isWalletReady,

      //methods
      router,
      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>
