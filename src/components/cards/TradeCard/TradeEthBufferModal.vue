<template>
  <BalModal show @close="onClose">
    <div class="-mx-4 p-4 items-center">
      <div class="mx-2">
        You only have {{ nativeAssetBalance }} {{ nativeAssetSymbol }} in your
        wallet. Remember to save enough for gas.
      </div>
      <BalBtn class="mt-8" label="Ok" block @click.prevent="onClose" />
    </div>
  </BalModal>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import { NATIVE_ASSET_ADDRESS } from '@/constants/tokens';
import numeral from 'numeral';

export default defineComponent({
  emits: ['close'],
  props: {},
  setup(props, { emit }) {
    const { balances } = useTokens();
    const { appNetworkConfig } = useWeb3();

    const nativeAssetSymbol = computed(
      () => appNetworkConfig.nativeAsset.symbol
    );

    const nativeAssetBalance = computed(() =>
      numeral(balances.value[NATIVE_ASSET_ADDRESS]).format('0.[0000]')
    );

    function onClose() {
      emit('close');
    }

    return {
      onClose,
      nativeAssetSymbol,
      nativeAssetBalance
    };
  }
});
</script>
