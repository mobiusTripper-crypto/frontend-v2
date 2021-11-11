<template>
  <div>
    <div v-if="account" class="flex items-center">
      <AppNavActivityBtn />

      <AppNavClaimBtn />
      <AppNavAccountBtn />
    </div>
    <BalBtn
      v-else
      color="white"
      :size="upToLargeBreakpoint ? 'md' : 'sm'"
      @click="toggleWalletSelectModal"
    >
      <WalletIcon class="mr-2" />
      <span class="hidden lg:inline-block" v-text="$t('connectWallet')" />
      <span class="lg:hidden" v-text="$t('connect')" />
    </BalBtn>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

import { EXTERNAL_LINKS } from '@/constants/links';

import useFathom from '@/composables/useFathom';
import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers from '@/composables/useNumbers';

import AppNavAccountBtn from './AppNavAccountBtn.vue';
import useWeb3 from '@/services/web3/useWeb3';
import AppNavActivityBtn from './AppNavActivityBtn/AppNavActivityBtn.vue';
import AppNavClaimBtn from './AppNavClaimBtn.vue';

export default defineComponent({
  name: 'AppNavActions',

  components: {
    AppNavAccountBtn,
    AppNavActivityBtn,
    AppNavClaimBtn
  },

  setup() {
    // COMPOSABLES
    const { upToSmallBreakpoint, upToLargeBreakpoint } = useBreakpoints();
    const { fNum } = useNumbers();
    const { trackGoal, Goals } = useFathom();
    const {
      connectWallet,
      account,
      toggleWalletSelectModal,
      isMainnet,
      isPolygon
    } = useWeb3();

    // COMPUTED
    const liquidityMiningSupported = computed(
      () => isMainnet.value || isPolygon.value
    );

    // METHODS
    function onClickConnect() {
      trackGoal(Goals.ClickNavConnectWallet);
    }

    return {
      // computed
      liquidityMiningSupported,
      account,
      upToSmallBreakpoint,
      upToLargeBreakpoint,
      // methods
      fNum,
      onClickConnect,
      connectWallet,
      toggleWalletSelectModal,
      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>
