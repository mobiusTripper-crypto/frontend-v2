<template>
  <FarmsHero :pools="onlyPoolsWithFarms" :loading="isLoading" />
  <div class="lg:container lg:mx-auto pt-10 md:pt-12">
    <div>
      <div class="px-4 lg:px-0">
        <h3 class="mb-3">Farms</h3>
      </div>
      <FarmsTable
        :pools="onlyPoolsWithFarms"
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
import usePools from '@/composables/pools/usePools';

export default defineComponent({
  components: {
    FarmsHero,
    FarmsTable
  },

  setup() {
    // COMPOSABLES
    const router = useRouter();
    const { isWalletReady } = useWeb3();

    const { isLoadingPools, isLoadingFarms, onlyPoolsWithFarms } = usePools();
    const isLoading = computed(
      () => isLoadingPools.value || isLoadingFarms.value
    );

    return {
      // data

      // computed
      isWalletReady,

      onlyPoolsWithFarms,
      isLoading,

      //methods
      router,
      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>
