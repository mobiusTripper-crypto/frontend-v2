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
    <div class="w-48">
      <template
        v-for="(link, index) in EXTERNAL_LINKS.Beethoven.NavOtherItems"
        :key="index"
      >
        <div
          v-if="link.chainId?.includes(configService.network.chainId)"
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
      </template>
    </div>
  </BalPopover>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { Alert } from '@/composables/useAlerts';
import { EXTERNAL_LINKS } from '@/constants/links';
import { configService } from '@/services/config/config.service';

export default defineComponent({
  name: 'AppNavOtherItems',
  props: {
    alert: { type: Object as PropType<Alert>, required: true },
    verticalAlign: { type: String, default: 'top' }
  },

  setup(props) {
    const isVerticalAlign = computed(() =>
      props.verticalAlign === 'top' ? { top: '-10px' } : { top: '-6px' }
    );

    return {
      isVerticalAlign,
      configService,
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
</style>
