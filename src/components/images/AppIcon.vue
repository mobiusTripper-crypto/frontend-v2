<template>
  <img
    v-if="!showSmallLogo"
    src="~@/beethovenx/assets/images/logo-full.svg"
    width="180"
  />
  <img
    v-if="showSmallLogo"
    src="~@/beethovenx/assets/images/logo-mbl.svg"
    width="99"
  />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import useBreakpoints from '@/composables/useBreakpoints';

export default defineComponent({
  name: 'AppIcon',

  setup() {
    const { bp } = useBreakpoints();
    const showSmallLogo = computed(() => ['xs', 'lg'].includes(bp.value));

    return { showSmallLogo };
  }
});
</script>
