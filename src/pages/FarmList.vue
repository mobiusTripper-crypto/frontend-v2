<template>
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
    <div class="mt-32">
      <FarmsTable
        noPoolsLabel="No farms found"
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

export default defineComponent({
  components: {
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
