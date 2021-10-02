<template>
  <BalLoadingBlock v-if="loading || appLoading" class="h-96" />
  <div class="chart mr-n2 ml-n2" v-else>
    <BalLbpLineChart
      :data="series"
      :isPeriodSelectionEnabled="false"
      :axisLabelFormatter="{ yAxis: '$0.00', xAxis: 'datetime' }"
      :color="chartColors"
      height="96"
      :showLegend="true"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { useStore } from 'vuex';
import { zip } from 'lodash';
import {
  addHours,
  format,
  formatISO,
  fromUnixTime,
  parseISO,
  isBefore
} from 'date-fns';
import useTailwind from '@/composables/useTailwind';
import {
  DecoratedPool,
  SubgraphTokenPrice
} from '@/services/balancer/subgraph/types';

interface HistoryItem {
  timestamp: number;
  price: number[];
  amounts: string[];
  totalShares: string;
}

export default defineComponent({
  name: 'BeetsLBPChart',

  props: {
    lbpTokenName: { type: String, required: true },
    lbpTokenAddress: { type: String, required: true },
    lbpPoolId: { type: String, required: true },
    lbpEndTime: { type: String, required: true },
    lbpStartTime: { type: String, required: true },
    lbpStartPrice: { type: Number, required: true },
    weightStep: { type: Number, required: true },
    loading: { type: Boolean, default: true },
    usdcAddress: { type: String, required: true },
    tokenPrices: {
      type: Array as PropType<SubgraphTokenPrice[]>,
      required: true
    },
    pool: { type: Object as PropType<DecoratedPool>, required: true }
  },

  setup(props) {
    const store = useStore();
    const appLoading = computed(() => store.state.app.loading);
    const tailwind = useTailwind();
    const lastPrice = computed(() => {
      const prices = props.tokenPrices;

      return prices && prices.length > 0
        ? parseFloat(prices[prices.length - 1].price)
        : props.lbpStartPrice;
    });
    const lastPriceTimestamp = computed(() => {
      const prices = props.tokenPrices;

      return prices && prices.length > 0
        ? formatISO(fromUnixTime(prices[prices.length - 1].timestamp))
        : props.lbpStartTime;
    });

    const chartColors = [
      tailwind.theme.colors.green['400'],
      tailwind.theme.colors.red['500']
    ];

    const times: string[] = [];
    const predicted: number[] = [];
    const current: number[] = [];
    const date = parseISO(props.lbpStartTime);

    const beetsBalance = 5000000;
    const usdcBalance = 43000;
    let beetsWeight = 0.95;
    let usdcWeight = 0.05;
    const weightStep = 0.00625;
    const currentHour = 0;

    for (let i = currentHour; i < 24; i++) {
      times.push(format(addHours(date, i), 'yyyy-MM-dd HH:mm:ss'));

      if (i < 8) {
        current.push(0.17);
        predicted.push(0.17);
      } else {
        const beetsPrice =
          ((beetsWeight / usdcWeight) * usdcBalance) / beetsBalance;
        predicted.push(beetsPrice);
      }

      beetsWeight -= weightStep;
      usdcWeight += weightStep;
    }

    const beetsPriceValues = computed(() => {
      const prices = props.tokenPrices || [];

      return zip(
        prices.map(price =>
          format(fromUnixTime(price.timestamp), 'yyyy-MM-dd HH:mm:ss')
        ),
        prices.map(price => parseFloat(price.price))
      );
    });

    const predictedPriceValues = computed(() => {
      const tokens = props.pool?.tokens;
      const beets = tokens?.find(
        token => token.address.toLowerCase() === props.lbpTokenAddress
      );
      const usdc = tokens?.find(
        token => token.address.toLowerCase() === props.usdcAddress
      );

      if (!beets || !usdc) {
        return [];
      }

      const beetsBalance = parseFloat(beets.balance);
      const usdcBalance = parseFloat(usdc.balance);
      let beetsWeight = parseFloat(beets.weight);
      let usdcWeight = parseFloat(usdc.weight);
      const predicted: number[] = [lastPrice.value];
      const times: string[] = [
        format(parseISO(lastPriceTimestamp.value), 'yyyy-MM-dd HH:mm:ss')
      ];
      const endTimestamp = parseISO(props.lbpEndTime);
      let timestamp = parseISO(lastPriceTimestamp.value);

      while (isBefore(addHours(timestamp, 1), endTimestamp)) {
        const beetsPrice =
          ((beetsWeight / usdcWeight) * usdcBalance) / beetsBalance;

        predicted.push(beetsPrice);
        times.push(format(timestamp, 'yyyy-MM-dd HH:mm:ss'));

        timestamp = addHours(timestamp, 1);
        beetsWeight -= props.weightStep;
        usdcWeight += props.weightStep;
      }

      console.log('predicted prices', zip(times, predicted));

      return zip(times, predicted);
    });

    const series = computed(() => {
      return [
        {
          name: 'Predicted Price*',
          values: predictedPriceValues.value
        },
        {
          name: 'BEETS Price',
          values: beetsPriceValues.value
        }
      ];
    });

    return {
      series,
      appLoading,
      chartColors,
      lastPriceTimestamp
    };
  }
});
</script>
