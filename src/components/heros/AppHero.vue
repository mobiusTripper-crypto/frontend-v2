<template>
  <div :class="['app-hero', classes]">
    <div class="w-full max-w-3xl mx-auto">
      <template v-if="isWalletReady">
        <div class="flex justify-center mt-8">
          <img
            v-if="darkMode"
            src="~@/assets/images/investments-headline.svg"
            width="400"
          />
        </div>
        <BalLoadingBlock
          v-if="isLoadingUserPools"
          class="h-10 w-40 mx-auto"
          white
        />
        <span v-else class="text-3xl font-bold text-white">
          {{ fNum(totalInvestedAmount, 'usd', { forcePreset: true }) }}
        </span>
      </template>
      <template v-else>
        <div class="flex justify-center">
          <img
            v-if="darkMode"
            src="~@/assets/images/headline.svg"
            width="400"
          />
        </div>
        <div class="flex justify-center mt-4">
          <BalBtn
            :color="darkMode ? 'gray' : 'white'"
            class="mr-3"
            @click="onClickConnect"
          >
            {{ $t('connectWallet') }}
          </BalBtn>
          <BalBtn
            tag="a"
            href="https://docs.beethovenx.io/"
            target="_blank"
            rel="noreferrer"
            color="white"
            outline
            @click="trackGoal(Goals.ClickHeroLearnMore)"
          >
            {{ $t('learnMore') }}
            <BalIcon name="arrow-up-right" size="sm" class="ml-1" />
          </BalBtn>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

import useNumbers from '@/composables/useNumbers';
import usePools from '@/composables/pools/usePools';

import { EXTERNAL_LINKS } from '@/constants/links';
import useFathom from '@/composables/useFathom';
import useWeb3 from '@/services/web3/useWeb3';
import useDarkMode from '@/composables/useDarkMode';

export default defineComponent({
  name: 'AppHero',

  setup() {
    // COMPOSABLES
    const { fNum } = useNumbers();
    const { isWalletReady, toggleWalletSelectModal } = useWeb3();
    const { trackGoal, Goals } = useFathom();
    const { totalInvestedAmount, isLoadingUserPools } = usePools();
    const { darkMode } = useDarkMode();

    const classes = computed(() => ({
      ['h-72']: !isWalletReady.value,
      //['h-0']: isWalletReady.value
      ['h-40']: isWalletReady.value
    }));

    function onClickConnect() {
      toggleWalletSelectModal(true);
      trackGoal(Goals.ClickHeroConnectWallet);
    }

    return {
      // data
      totalInvestedAmount,
      isLoadingUserPools,
      Goals,

      // computed
      isWalletReady,
      classes,
      darkMode,

      // methods
      toggleWalletSelectModal,
      fNum,
      onClickConnect,
      trackGoal,
      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>

<style>
.app-hero {
  @apply bg-cover bg-center flex items-center justify-center text-center px-4;
  transition: all 0.3s ease-in-out;
  background-image: url('/images/backgrounds/banner-medium.svg');
}
</style>
