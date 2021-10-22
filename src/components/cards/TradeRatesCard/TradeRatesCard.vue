<template v-if="!loading">
  <BalCard shadow="lg" class="mt-2" noPad>
    <div class="flex items-center border-gray-700 border-b pt-3 px-4 pb-2">
      <div class="flex-1">
        <span class="font-medium">Swap rates</span>
      </div>
      <div class="w-20 flex justify-center">
        <img
          src="https://assets.coingecko.com/coins/images/15223/small/logo_200x200.png"
          width="32"
        />
      </div>
      <div class="w-20 flex justify-center">
        <img
          src="https://storageapi.fleek.co/beethovenxfi-team-bucket/SPIRIT.png"
          width="32"
        />
      </div>
      <div class="w-20 flex justify-center">
        <img
          src="https://beethoven-assets.s3.eu-central-1.amazonaws.com/beets-icon-large.png"
          width="32"
        />
      </div>
    </div>
    <div
      v-for="(item, idx) in items"
      :key="item.id"
      :class="[
        'flex items-center border-gray-700 pt-2 px-3',
        idx === items.length - 1 ? 'pb-4' : 'pb-2 border-b'
      ]"
    >
      <div class="flex items-center flex-1">
        <BalAsset :address="item.tokenIn" :size="24" />
        <div class="ml-2 font-medium w-8">
          {{ item.amountInNumberFormatted }}
        </div>
        <BalIcon
          name="arrow-right"
          size="sm"
          class="ml-1 mr-2 flex items-center"
        />
        <BalAsset :address="item.tokenOut" :size="24" />
      </div>
      <div
        :class="[
          'w-20 flex justify-center',
          spooky[idx] > beets[idx] && spooky[idx] > spirit[idx]
            ? 'text-green-500'
            : ''
        ]"
      >
        {{
          spooky[idx] ? numeral(spooky[idx]).format(item.amountOutFormat) : ''
        }}
        <BalLoadingBlock v-if="!spooky[idx]" class="h-4 w-12 mx-auto" white />
      </div>
      <div
        :class="[
          'w-20 flex justify-center',
          spirit[idx] > spooky[idx] && spirit[idx] > beets[idx]
            ? 'text-green-500'
            : ''
        ]"
      >
        {{
          spirit[idx] ? numeral(spirit[idx]).format(item.amountOutFormat) : ''
        }}
        <BalLoadingBlock v-if="!spirit[idx]" class="h-4 w-12 mx-auto" white />
      </div>
      <div
        :class="[
          'w-20 flex justify-center',
          beets[idx] > spooky[idx] && beets[idx] > spirit[idx]
            ? 'text-green-500'
            : ''
        ]"
      >
        {{ beets[idx] ? numeral(beets[idx]).format(item.amountOutFormat) : '' }}
        <BalLoadingBlock v-if="!beets[idx]" class="h-4 w-12 mx-auto" white />
      </div>
    </div>
  </BalCard>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import useNumbers from '@/composables/useNumbers';
import numeral from 'numeral';
import { SorManager } from '@/lib/utils/balancer/helpers/sor/sorManager';
import useDexesQuery from '@/composables/queries/useDexesQuery';
import { getAddress } from '@ethersproject/address';

const WFTM = getAddress('0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83');
const USDC = getAddress('0x04068DA6C83AFCFA0e13ba15A6696662335D5B75');
const BTC = getAddress('0x321162Cd933E2Be498Cd2267a90534A804051b11');
const ETH = getAddress('0x74b23882a30290451A17c44f4F05243b6b58C76d');
const DAI = getAddress('0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e');
const MIM = getAddress('0x82f0b8b456c1a451378467398982d4834b6829c1');
const SPIRIT = getAddress('0x5cc61a78f164885776aa610fb0fe1257df78e59b');

const SWAPS = [
  {
    id: '0',
    amountIn: '60000000000',
    spookyPath: [USDC, WFTM, BTC],
    spiritPath: [USDC, WFTM, BTC],
    tokenIn: USDC,
    tokenInDecimal: 6,
    tokenOut: BTC,
    tokenOutDecimal: 8,
    amountInNumber: 60000,
    amountInNumberFormatted: '60k',
    amountOutFormat: '0.0000'
  },
  {
    id: '1',
    amountIn: '100000000',
    spookyPath: [BTC, WFTM, USDC],
    spiritPath: [BTC, WFTM, USDC],
    tokenIn: BTC,
    tokenInDecimal: 8,
    tokenOut: USDC,
    tokenOutDecimal: 6,
    amountInNumber: 1,
    amountInNumberFormatted: '1.0',
    amountOutFormat: '0,0'
  },
  {
    id: '2',
    amountIn: '10000000000',
    spookyPath: [USDC, WFTM, DAI],
    spiritPath: [USDC, WFTM, SPIRIT, DAI],
    tokenIn: USDC,
    tokenOut: DAI,
    tokenInDecimal: 6,
    tokenOutDecimal: 18,
    amountInNumber: 10000,
    amountInNumberFormatted: '10k',
    amountOutFormat: '0,0'
  },
  {
    id: '3',
    amountIn: '10000000000000000000000',
    spookyPath: [MIM, WFTM, ETH],
    spiritPath: [MIM, WFTM, ETH],
    tokenIn: MIM,
    tokenOut: ETH,
    tokenInDecimal: 18,
    tokenOutDecimal: 18,
    amountInNumber: 10000,
    amountInNumberFormatted: '10k',
    amountOutFormat: '0.[0000]'
  }
];

export default defineComponent({
  components: {},

  props: {
    sorManager: {
      type: Object as PropType<SorManager>,
      required: true
    }
  },

  setup(props) {
    const { fNum } = useNumbers();
    const { isLoading, data, isIdle } = useDexesQuery(props.sorManager, SWAPS);

    const spooky = computed(() => data.value?.spooky || []);
    const spirit = computed(() => data.value?.spirit || []);
    const beets = computed(() => data.value?.beets || []);
    const loading = computed(() => isLoading.value || isIdle.value);

    return {
      // data
      items: SWAPS,
      spooky,
      spirit,
      beets,
      loading,

      // methods
      fNum,
      numeral
    };
  }
});
</script>
