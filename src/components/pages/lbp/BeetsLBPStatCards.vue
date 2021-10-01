<template>
  <div class="grid grid-cols-3 sm:grid-cols-3 xl:grid-cols-3 gap-4">
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
        Oct 6, 18:00:00 UTC
      </div>
    </BalCard>
    <BalCard>
      <div class="text-sm text-gray-500 font-medium mb-2">
        Current BEETS Price
      </div>
      <div class="text-xl font-medium truncate flex items-center">
        $0.14
      </div>
      <div class="text-sm text-gray-500 font-medium mt-1">
        Predicted price*: $0.08
      </div>
    </BalCard>
    <BalCard>
      <div class="text-sm text-gray-500 font-medium mb-2">
        Tokens Sold
      </div>
      <div class="text-xl font-medium truncate flex items-center">
        8%
      </div>
      <div class="text-sm text-gray-500 font-medium mt-1">
        1.25m of 5m
      </div>
    </BalCard>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import useNumbers from '@/composables/useNumbers';
import BigNumber from 'bignumber.js';
import { scale } from '@/lib/utils';
import useEthers from '@/composables/useEthers';
import { useRoute } from 'vue-router';
import { parseISO, differenceInMilliseconds } from 'date-fns';

export default defineComponent({
  components: {},

  props: {},

  setup(props) {
    const route = useRoute();
    const { fNum } = useNumbers();
    const { txListener } = useEthers();
    const harvesting = ref(false);

    const timeRemaining = differenceInMilliseconds(
      parseISO('2021-10-06T18:00:00+0000'),
      new Date()
    );

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
      timeRemaining
    };
  }
});
</script>
