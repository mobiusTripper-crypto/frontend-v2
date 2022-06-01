<script setup lang="ts">
import HomeDiscoverInvestmentPool from '@/beethovenx/components/pages/home/HomeDiscoverInvestmentPool.vue';
import HomeNewsItems from '@/beethovenx/components/pages/home/HomeNewsItems.vue';
import HomeEducationItems from '@/beethovenx/components/pages/home/HomeEducationItems.vue';
import { configService } from '@/services/config/config.service';
</script>

<template>
  <div>
    <div class="hero-container -mx-4 lg:-mx-6 pt-10 sm:pt-16 lg:pt-8 relative">
      <img
        class="absolute w-full h-full top-0 left-0"
        src="~@/beethovenx/assets/images/op-header-bg.png"
      />

      <div class="mx-auto max-w-7xl xl:grid xl:grid-cols-2 gap-8 z-10 relative">
        <div class="hidden xl:block">
          <img
            src="~@/beethovenx/assets/images/op-header-beethoven.png"
            style="height: 567px !important; width: 624px !important;"
          />
        </div>
        <div class="pb-12 flex flex-col justify-center mx-12 xl:mx-4">
          <img src="~@/beethovenx/assets/images/op-header-text.svg" />

          <p
            class="mt-3 text-base sm:mt-5 sm:text-xl lg:text-lg xl:text-xl pl-4 text-left font-book text-center font-bold text-red-500"
          >
            An AMM re-imagineered for everyone
          </p>
          <div class="pt-8 flex sm:pt-12 justify-center">
            <router-link
              :to="{ name: 'trade' }"
              class="beet-button green-button-small mx-auto sm:mx-0"
            >
              Swap
            </router-link>
            <router-link
              :to="{ name: 'pools' }"
              class="beet-button blue-button-small mx-auto sm:ml-4 sm:mt-0 sm:mr-0"
            >
              Invest
            </router-link>
          </div>
        </div>
        <!--        <div class="lg:grid lg:grid-cols-2 lg:gap-8">
          <div class="lg:m-0 lg:relative hidden xl:flex">
            <div class="flex-1 hidden lg:block" />
            <div
              class="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 lg:max-w-none lg:px-0 items-right flex justify-end"
            >
              <img
                src="~@/beethovenx/assets/images/op-header-beethoven.png"
                style="height: 567px !important; width: 624px !important;"
              />
            </div>
          </div>
          <div
            class="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 sm:text-center lg:px-0 lg:text-left flex lg:items-center pb-8 lg:pb-0 z-10"
          >
            <div class="lg:pb-12">
              <img src="~@/beethovenx/assets/images/op-header-text.svg" />

              <p
                class="mt-3 text-base sm:mt-5 sm:text-xl lg:text-lg xl:text-xl pl-4 text-left font-book text-center font-bold text-red-500"
              >
                An AMM re-imagineered for everyone
              </p>
              <div class="pt-8 flex sm:pt-12 justify-center">
                <router-link
                  :to="{ name: 'trade' }"
                  class="beet-button green-button-small mx-auto sm:mx-0"
                >
                  Swap
                </router-link>
                <router-link
                  :to="{ name: 'pools' }"
                  class="beet-button blue-button-small mx-auto mt-4 sm:ml-4 sm:mt-0 sm:mr-0"
                >
                  Invest
                </router-link>
              </div>
            </div>
          </div>
        </div>-->
      </div>
    </div>
    <div class="lg:container lg:mx-auto pt-10 md:pt-12">
      <div class="flex items-center">
        <div class="flex-1">
          <img
            src="~@/beethovenx/assets/images/discover-investment-pool.svg"
            class="mb-8 -ml-4"
          />
        </div>
        <router-link
          :to="{ name: 'pools' }"
          class="text-lg underline text-green-500 hidden sm:inline-block"
        >
          Browse All
        </router-link>
      </div>
      <HomeDiscoverInvestmentPool />
    </div>
    <div class="lg:container lg:mx-auto pt-10 md:pt-20">
      <img
        src="~@/beethovenx/assets/images/why-is-beets-awesome.svg"
        class="mb-8 -ml-4"
      />
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="flex flex-col items-center">
          <img
            src="~@/beethovenx/assets/images/yield-generating-image.png"
            class="w-2/3 mb-2"
          />
          <img
            src="~@/beethovenx/assets/images/for-investors.svg"
            class="mb-3"
          />
          <div class="text-center text-lg px-8">
            Create a unique crypto index fund tailored to your desired asset
            allocations. Collect fees from traders who rebalance your funds by
            following arbitrage opportunities.
          </div>
        </div>
        <div class="flex flex-col items-center">
          <img
            src="~@/beethovenx/assets/images/looking-image.png"
            class="w-2/3 mb-2"
          />
          <img src="~@/beethovenx/assets/images/for-traders.svg" class="mb-3" />
          <div class="text-center text-lg px-8">
            Balancer V2 enables efficient trading by pooling crowdsourced
            liquidity from investor portfolios and using its unique Smart Order
            Router to find traders the best available price.
          </div>
        </div>
        <div class="flex flex-col items-center">
          <img
            src="~@/beethovenx/assets/images/speed-image.png"
            class="w-2/3 mb-2"
          />
          <img
            src="~@/beethovenx/assets/images/for-protocols.svg"
            class="mb-3"
          />
          <div class="text-center text-lg px-8">
            Launch your token in the fairest way possible, using an LGE. Use an
            80/20 BPT instead of single staking to capture market volatility
            with minimal impermanent loss.
          </div>
        </div>
      </div>
    </div>
    <div class="lg:container lg:mx-auto pt-10 md:pt-20">
      <img
        src="~@/beethovenx/assets/images/latest-updates.svg"
        class="mb-8 -ml-4"
      />
      <HomeNewsItems />
    </div>
    <div class="lg:container lg:mx-auto pt-10 md:pt-20">
      <img
        src="~@/beethovenx/assets/images/learning-the-notes.svg"
        class="mb-8 -ml-4"
      />
      <HomeEducationItems />
    </div>
    <!--    <div class="lg:container lg:mx-auto pt-10 md:pt-20">
      <img
        src="~@/beethovenx/assets/images/our-partners.svg"
        class="mb-8 -ml-4"
      />
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4"></div>
    </div>-->
  </div>
</template>

<style scoped>
h1.hero-h1 {
  display: none;
}

.hero-container {
  background: url('../assets/images/hero-shadow.png') bottom left repeat-x;
}

.beet-button {
  @apply font-bold font-body text-lg;
  align-items: center;
  justify-content: center;
  display: flex;
}

.green-button {
  @apply text-gray-800;
  background: url('../assets/images/green-button.svg') center center;
  width: 290px;
  height: 80px;
}

.green-button-small {
  @apply text-gray-800;
  background: url('../assets/images/green-button-small.svg') center center;
  width: 212px;
  height: 80px;
}

.blue-button-small {
  background: url('../assets/images/blue-button-small.svg') center center;
  width: 212px;
  height: 80px;
}

.blue-button {
  background: url('../assets/images/blue-button.svg') center center;
  width: 290px;
  height: 80px;
}
</style>
