<template>
  <div class="grid grid-cols-3 sm:grid-cols-3 xl:grid-cols-3 gap-4">
    <template v-if="loading">
      <BalLoadingBlock v-for="n in 3" :key="n" class="h-28" />
    </template>
    <template v-else>
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          {{ countdownLabel }}
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          <vue-countdown
            :time="timeRemaining"
            v-slot="{ hours, minutes, seconds }"
            :transform="transformTime"
            @end="$emit('lbpStateChange')"
          >
            {{ hours }}:{{ minutes }}:{{ seconds }}
          </vue-countdown>
        </div>
        <div class="text-sm text-gray-500 font-medium mt-1">
          {{ countdownDateFormatted }}
        </div>
      </BalCard>
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          Current BEETS Price
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ lbpData ? lbpData.tokenPrice : '' }}
        </div>
        <div class="text-sm text-gray-500 font-medium mt-1">
          Predicted price*:
          {{ lbpData ? lbpData.predictedPrice : '' }}
        </div>
      </BalCard>
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          Current Pool Weights
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{
            lbpData ? `${lbpData.beetsWeight}% / ${lbpData.usdcWeight}%` : ''
          }}
        </div>
        <div class="text-sm text-gray-500 font-medium mt-1">
          BEETS / USDC
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
import { differenceInMilliseconds, format, isBefore, parseISO } from 'date-fns';
import { DecoratedPool } from '@/services/balancer/subgraph/types';
import numeral from 'numeral';

export default defineComponent({
  components: {},

  emits: ['lbpStateChange'],

  props: {
    lbpTokenName: { type: String, required: true },
    lbpTokenAddress: { type: String, required: true },
    lbpTokenStartingAmount: { type: Number, required: true },
    usdcAddress: { type: String, required: true },
    lbpStartTime: { type: String, required: true },
    lbpEndTime: { type: String, required: true },
    pool: { type: Object as PropType<DecoratedPool> },
    loading: { type: Boolean, default: true },
    isBeforeLbpStart: { type: Boolean, required: true }
  },

  setup(props) {
    const { fNum } = useNumbers();
    const harvesting = ref(false);

    const timeRemaining = computed(() =>
      props.isBeforeLbpStart
        ? differenceInMilliseconds(parseISO(props.lbpStartTime), new Date())
        : differenceInMilliseconds(parseISO(props.lbpEndTime), new Date())
    );

    const countdownDateFormatted = computed(() =>
      props.isBeforeLbpStart
        ? format(parseISO(props.lbpStartTime), 'MMM d') +
          ' at ' +
          format(parseISO(props.lbpStartTime), 'HH:mm')
        : format(parseISO(props.lbpEndTime), 'MMM d') +
          ' at ' +
          format(parseISO(props.lbpEndTime), 'HH:mm')
    );

    const countdownLabel = computed(() =>
      props.isBeforeLbpStart ? 'Starts In' : 'Ends In'
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
        percentSold: sold / props.lbpTokenStartingAmount,
        tokenPrice: numeral(tokenPrice).format('$0,0.0000'),
        predictedPrice: numeral(predictedPrice).format('$0,0.0000'),
        beetsWeight: numeral(parseFloat(beets.weight) * 100).format('0.[00]'),
        usdcWeight: numeral(parseFloat(usdc.weight) * 100).format('0.[00]')
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
      countdownDateFormatted,
      countdownLabel
    };
  }
});
</script>
