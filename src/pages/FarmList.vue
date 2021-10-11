<template>
  <FarmsHero
    :pools="onlyPoolsWithFarms"
    :loading="isLoading"
    :harvesting="harvesting"
    :harvest-all="harvestAllRewards"
  />
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
import { computed, defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { EXTERNAL_LINKS } from '@/constants/links';
import useWeb3 from '@/services/web3/useWeb3';
import FarmsTable from '@/components/tables/FarmsTable/FarmsTable.vue';
import FarmsHero from '@/components/heros/FarmsHero.vue';
import usePools from '@/composables/pools/usePools';
import useEthers from '@/composables/useEthers';

export default defineComponent({
  components: {
    FarmsHero,
    FarmsTable
  },

  setup() {
    // COMPOSABLES
    const router = useRouter();
    const { isWalletReady } = useWeb3();
    const { txListener } = useEthers();
    const harvesting = ref(false);

    const {
      isLoadingPools,
      isLoadingFarms,
      onlyPoolsWithFarms,
      harvestAllFarms,
      refetchFarmsForUser
    } = usePools();
    const isLoading = computed(
      () => isLoadingPools.value || isLoadingFarms.value
    );

    async function harvestAllRewards(): Promise<void> {
      const farmIds = onlyPoolsWithFarms.value
        .filter(pool => pool.farm.stake > 0)
        .map(pool => pool.farm.id);

      harvesting.value = true;
      const tx = await harvestAllFarms(farmIds);

      if (!tx) {
        harvesting.value = false;
        return;
      }

      txListener(tx, {
        onTxConfirmed: async () => {
          await refetchFarmsForUser();
          harvesting.value = false;
        },
        onTxFailed: () => {
          harvesting.value = false;
        }
      });
    }

    return {
      // data

      // computed
      isWalletReady,

      onlyPoolsWithFarms,
      isLoading,

      harvestAllRewards,
      harvesting,

      //methods
      router,
      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>
