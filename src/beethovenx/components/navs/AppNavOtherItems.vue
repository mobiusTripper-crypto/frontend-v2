<template>
  <BalPopover
    :verticalAlign="verticalAlign"
    align="left"
    closeOnClickInside="true"
  >
    <template v-slot:activator>
      <div
        class="flex items-center px-4 cursor-pointer relative"
        :style="isVerticalAlign"
      >
        <div class="text-4xl">...</div>
      </div>
    </template>
    <router-link
      :to="{ name: 'launch' }"
      :class="['toggle-link', { [activeClasses]: isLaunchPage }]"
    >
      Launch
    </router-link>
    <div class="w-48">
      <div
        v-for="(link, index) in EXTERNAL_LINKS.Beethoven.NavOtherItems"
        :key="index"
        class="app-nav-other-item"
      >
        <BalLink :href="link.url" external noStyle>
          {{ link.title }}
          <BalIcon name="arrow-up-right" size="sm" class="text-gray-500" />
          <div v-if="link.subTitle" class="text-xs text-gray-400">
            {{ link.subTitle }}
          </div>
        </BalLink>
      </div>
    </div>
  </BalPopover>
</template>

<script lang="ts">
import { useRoute } from 'vue-router';
import { computed, defineComponent, PropType } from 'vue';
import useNumbers from '@/composables/useNumbers';
import useBreakpoints from '@/composables/useBreakpoints';
import { Alert } from '@/composables/useAlerts';
import useProtocolDataQuery from '@/beethovenx/composables/queries/useProtocolDataQuery';
import { EXTERNAL_LINKS } from '@/constants/links';

export default defineComponent({
  name: 'AppNavOtherItems',

  props: {
    alert: { type: Object as PropType<Alert>, required: true },
    verticalAlign: { type: String, default: 'top' }
  },

  setup(props) {
    const route = useRoute();
    const { fNum } = useNumbers();
    const { upToLargeBreakpoint } = useBreakpoints();

    const protocolDataQuery = useProtocolDataQuery();

    const isVerticalAlign = computed(() =>
      props.verticalAlign === 'top' ? { top: '-10px' } : { top: '-6px' }
    );
    const tvl = computed(
      () => protocolDataQuery.data?.value?.totalLiquidity || 0
    );

    const beetsPrice = computed(
      () => protocolDataQuery.data?.value?.beetsPrice || 0
    );
    const circulatingSupply = computed(
      () => protocolDataQuery.data.value?.circulatingSupply || 0
    );
    const marketCap = computed(() => {
      return beetsPrice.value * circulatingSupply.value;
    });
    const loading = computed(() => protocolDataQuery.isLoading.value);

    const isLaunchPage = computed(() => {
      console.log(route.name);
      return (
        route.name === 'launch' ||
        route.name === 'lge-create' ||
        route.name === 'lge'
      );
    });
    const activeClasses = 'text-green-500 bg-gray-700';

    return {
      fNum,
      upToLargeBreakpoint,
      beetsPrice,
      tvl,
      circulatingSupply,
      marketCap,
      loading,
      isLaunchPage,
      activeClasses,
      isVerticalAlign,
      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>

<style scoped>
.app-nav-other-item {
  @apply px-4 py-2 text-gray-300 hover:text-green-500 block hover:bg-gray-700;
}

.toggle-link {
  @apply px-4 py-2 mb-2 hover:text-green-500 block hover:bg-gray-700;
  font-variation-settings: 'wght' 600;
}
</style>
