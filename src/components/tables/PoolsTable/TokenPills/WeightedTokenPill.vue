<template>
  <div
    class="mt-2 mr-2 flex items-center px-2 h-10 bg-gray-50 dark:bg-gray-700 rounded-lg relative"
  >
    <div
      v-if="hasBalance"
      class="w-3 h-3 rounded-full border-2 border-white dark:border-gray-850 group-hover:border-gray-50 dark:group-hover:border-gray-800 bg-green-200 dark:bg-green-500 absolute top-0 right-0 -mt-1 -mr-1"
    />
    <BalAsset :address="address" :size="24" />
    <span class="ml-2">
      {{ symbol }}
    </span>
    <span class="font-medium text-gray-400 text-xs mt-px ml-1">
      {{ weight }}
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BalAsset from '@/components/_global/BalAsset/BalAsset.vue';

export default defineComponent({
  name: 'WeightedTokenPill',

  components: {
    BalAsset
  },

  props: {
    hasBalance: { type: Boolean, default: false },
    symbol: { type: String, required: true },
    weight: { type: String, required: true },
    address: { type: String, required: true }
  }
});
</script>
