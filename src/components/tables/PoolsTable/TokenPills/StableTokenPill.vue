<template>
  <div class="flex relative h-10 items-center px-2">
    <BalAsset :address="address" :size="24" />
    <div class="px-2 py-1">
      {{ symbol }}
    </div>
    <div class="relative">
      <div
        v-if="!isLast"
        class="absolute w-1 h-12 -mt-6 ml-px bg-white dark:bg-gray-850 group-hover:bg-gray-50 dark:group-hover:bg-gray-800 transform rotate-12"
      />
    </div>
    <div
      v-if="hasBalance"
      class="w-3 h-3 rounded-full border-2 border-white dark:border-gray-850 group-hover:border-gray-50 dark:group-hover:border-gray-800   bg-green-200 dark:bg-green-500 absolute top-0 right-0 -mt-1 -mr-1"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BalAsset from '@/components/_global/BalAsset/BalAsset.vue';

export default defineComponent({
  name: 'StableTokenPill',

  components: {
    BalAsset
  },

  props: {
    hasBalance: { type: Boolean, default: false },
    symbol: { type: String, required: true },
    address: { type: String, required: true },
    isLast: { type: Boolean, default: false }
  }
});
</script>
