<template>
  <FarmsHero
    :decorated-farms="decoratedFarms"
    :loading="isLoadingDecoratedFarms"
  />
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
        :loading="isLoadingDecoratedFarms"
        :isPaginated="false"
        :isLoadingMore="false"
        class="mb-8"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { EXTERNAL_LINKS } from '@/constants/links';
import useWeb3 from '@/services/web3/useWeb3';
import FarmsTable from '@/components/tables/FarmsTable/FarmsTable.vue';
import FarmsHero from '@/components/heros/FarmsHero.vue';
import useDecoratedFarms from '@/composables/farms/useDecoratedFarms';

export default defineComponent({
  components: {
    FarmsHero,
    FarmsTable
  },

  setup() {
    // COMPOSABLES
    const router = useRouter();
    const { isWalletReady } = useWeb3();

    const { decoratedFarms, isLoadingDecoratedFarms } = useDecoratedFarms();

    return {
      // data

      // computed
      isWalletReady,

      decoratedFarms,
      isLoadingDecoratedFarms,

      //methods
      router,
      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>
