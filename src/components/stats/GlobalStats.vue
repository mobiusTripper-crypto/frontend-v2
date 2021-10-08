<template>
  <div
    class="absolute right-4 top-4 float-right flex flex-col items-end hidden md:block"
  >
    <div
      v-if="tvl > 0 && beetsPrice > 0"
      class="text-green-500 font-semibold text-right"
    >
      TVL: ${{ fNum(tvl, 'usd_lg') }}
    </div>
    <div v-if="beetsPrice > 0" class="text-red-500 font-semibold text-right">
      BEETS: {{ fNum(beetsPrice, 'usd') }}
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
import useProtocolDataQuery from '@/composables/queries/useProtocolDataQuery';

export default defineComponent({
  name: 'AppHero',

  setup() {
    const protocolDataQuery = useProtocolDataQuery();
    const { fNum } = useNumbers();
    const tvl = computed(
      () => protocolDataQuery.data?.value?.totalLiquidity || 0
    );

    const beetsPrice = computed(
      () => protocolDataQuery.data?.value?.beetsPrice || 0
    );

    return {
      tvl,
      beetsPrice,
      fNum
    };
  }
});
</script>
