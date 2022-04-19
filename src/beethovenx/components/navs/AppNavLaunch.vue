<template>
  <router-link
    :to="{ name: 'launch' }"
    :class="[
      upToXLargeBreakpoint ? `under-lx-breakpoint` : `over-xl-breakpoint`,
      { [activeClasses]: isLaunchPage }
    ]"
  >
    Launch
  </router-link>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useRoute } from 'vue-router';
import useBreakpoints from '@/composables/useBreakpoints';

export default defineComponent({
  name: 'AppNavLaunch',

  setup() {
    const route = useRoute();
    const { upToXLargeBreakpoint } = useBreakpoints();

    const activeClasses = 'text-green-500 bg-gray-700';

    const isLaunchPage = computed(() => {
      return (
        route.name === 'launch' ||
        route.name === 'lge-create' ||
        route.name === 'lge'
      );
    });

    return {
      isLaunchPage,
      activeClasses,
      upToXLargeBreakpoint
    };
  }
});
</script>

<style scoped>
.over-xl-breakpoint {
  @apply h-full flex items-center text-center px-5;
}

.under-lx-breakpoint {
  @apply px-4 py-2 mb-2 hover:text-green-500 block hover:bg-gray-700;
  font-variation-settings: 'wght' 600;
}
</style>
