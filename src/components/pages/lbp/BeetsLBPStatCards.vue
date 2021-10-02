<template>
  <div class="grid grid-cols-3 sm:grid-cols-3 xl:grid-cols-3 gap-4">
    <template v-if="loading">
      <BalLoadingBlock v-for="n in 3" :key="n" class="h-28" />
    </template>
    <template v-else>
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          Ends In
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          <vue-countdown
            :time="timeRemaining"
            v-slot="{ hours, minutes, seconds }"
            :transform="transformTime"
          >
            {{ hours }}:{{ minutes }}:{{ seconds }}
          </vue-countdown>
        </div>
        <div class="text-sm text-gray-500 font-medium mt-1">
          {{ endDateFormatted }}
        </div>
      </BalCard>
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          Current BEETS Price
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ lbpData ? fNum(lbpData.tokenPrice, 'usd') : '' }}
        </div>
        <div class="text-sm text-gray-500 font-medium mt-1">
          Predicted price*:
          {{ lbpData ? fNum(lbpData.predictedPrice, 'usd') : '' }}
        </div>
      </BalCard>
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          Tokens Sold
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ lbpData ? fNum(lbpData.percentSold, 'percent') : '' }}
        </div>
        <div class="text-sm text-gray-500 font-medium mt-1">
          {{ lbpData ? fNum(lbpData.sold, 'token_lg') : '' }} of 5m
        </div>
      </BalCard>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import useNumbers from '@/composables/useNumbers';
import useEthers from '@/composables/useEthers';
import { useRoute } from 'vue-router';
import { differenceInMilliseconds, format, parseISO } from 'date-fns';
import { DecoratedPool } from '@/services/balancer/subgraph/types';

export default defineComponent({
  components: {},

  props: {
    lbpTokenName: { type: String, required: true },
    lbpTokenAddress: { type: String, required: true },
    lbpTokenStartingAmount: { type: Number, required: true },
    usdcAddress: { type: String, required: true },
    lbpEndTime: { type: String, required: true },
    pool: { type: Object as PropType<DecoratedPool> },
    loading: { type: Boolean, default: true }
  },

  setup(props) {
    const route = useRoute();
    const { fNum } = useNumbers();
    const { txListener } = useEthers();
    const harvesting = ref(false);

    const timeRemaining = differenceInMilliseconds(
      parseISO(props.lbpEndTime),
      new Date()
    );

    const endDateFormatted = computed(() =>
      format(parseISO(props.lbpEndTime), 'MMM d, HH:mm:ss')
    );

    const lbpData = computed(() => {
      const tokens = props.pool?.tokens;
      const beets = tokens?.find(
        token => token.address.toLowerCase() === props.lbpTokenAddress
      );
      const usdc = tokens?.find(
        token => token.address.toLowerCase() === props.usdcAddress
      );

      if (!beets || !usdc) {
        return null;
      }

      const remaining = parseFloat(beets.balance);
      const sold = props.lbpTokenStartingAmount - remaining;
      const tokenPrice =
        ((parseFloat(beets.weight) / parseFloat(usdc.weight)) *
          parseFloat(usdc.balance)) /
        parseFloat(beets.balance);
      const predictedPrice =
        ((0.8 / 0.2) * parseFloat(usdc.balance)) / parseFloat(beets.balance);

      return {
        sold,
        remaining,
        percentSold: sold / remaining,
        tokenPrice,
        predictedPrice
      };
    });

    function transformTime(slotProps) {
      return {
        ...slotProps,
        hours: slotProps.hours < 10 ? `0${slotProps.hours}` : slotProps.hours,
        minutes:
          slotProps.minutes < 10 ? `0${slotProps.minutes}` : slotProps.minutes,
        seconds:
          slotProps.seconds < 10 ? `0${slotProps.seconds}` : slotProps.seconds
      };
    }

    return {
      fNum,
      harvesting,
      transformTime,
      timeRemaining,
      lbpData,
      endDateFormatted
    };
  }
});
</script>
