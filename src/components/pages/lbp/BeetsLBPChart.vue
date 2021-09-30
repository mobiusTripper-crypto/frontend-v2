<template>
  <BalLoadingBlock v-if="loading || appLoading" class="h-96" />
  <div class="chart mr-n2 ml-n2">
    <BalLbpLineChart
      :data="series"
      :isPeriodSelectionEnabled="false"
      :axisLabelFormatter="{ yAxis: '$0.00', xAxis: 'datetime' }"
      :color="chartColors"
      height="96"
      :showLegend="true"
      :legendState="{ HODL: false }"
    />
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent, toRefs, computed, Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { zip } from 'lodash';
import { fromUnixTime, format, addHours, parseISO } from 'date-fns';
import { PoolSnapshots } from '@/services/balancer/subgraph/types';
import useTailwind from '@/composables/useTailwind';
import useDarkMode from '@/composables/useDarkMode';

interface HistoryItem {
  timestamp: number;
  price: number[];
  amounts: string[];
  totalShares: string;
}

export default defineComponent({
  name: 'BeetsLBPChart',

  props: {
    /*prices: {
      type: Object as PropType<Record<string, number[]>>,
      required: true
    },
    snapshots: {
      type: Object as PropType<PoolSnapshots>,
      required: true
    },*/
    loading: { type: Boolean, default: true }
  },

  setup(props) {
    const store = useStore();
    const { t } = useI18n();

    /*const {
      prices,
      snapshots
    }: {
      prices: Ref<Record<string, number[]>>;
      snapshots: Ref<PoolSnapshots>;
    } = toRefs(props);*/

    const appLoading = computed(() => store.state.app.loading);
    const tailwind = useTailwind();
    const { darkMode } = useDarkMode();

    const chartColors = [
      tailwind.theme.colors.green['400'],
      tailwind.theme.colors.red['500']
    ];

    /*const nonEmptySnapshots = computed(() => {
      if (!history.value || !history.value) return [];
      return history.value.filter((state: any) => state.totalShares !== '0');
    });*/

    /*function getPoolValue(amounts: string[], prices: number[]) {
      const values = amounts.map((amount, index) => {
        const price = prices[index];
        return price * parseFloat(amount);
      });
      return values.reduce((total, value) => total + value, 0);
    }

    const history = computed(() => {
      if (!prices || !prices.value || Object.values(prices.value).length === 0)
        return [];
      if (!snapshots || !snapshots.value) return [];

      const defaultState = {
        amounts: ['0', '0'],
        totalShares: '0'
      };

      const history = Object.keys(prices.value).map(timestamp => {
        if (!prices.value || !snapshots.value) return [];
        const price = prices.value[timestamp];
        const state = snapshots.value[timestamp]
          ? snapshots.value[timestamp]
          : defaultState;

        const amounts: string[] = state.amounts;
        const totalShares: string = state.totalShares;
        return {
          timestamp: parseInt(timestamp),
          price,
          amounts,
          totalShares
        };
      });
      return history;
    });*/

    /*const timestamps = computed(() => {
      if (!nonEmptySnapshots.value || nonEmptySnapshots.value.length === 0)
        return [];
      return nonEmptySnapshots.value.map((state: any) =>
        format(fromUnixTime(state.timestamp / 1000), 'yyyy/MM/dd')
      );
    });*/

    /*const holdValues = computed(() => {
      if (!nonEmptySnapshots.value || nonEmptySnapshots.value.length === 0) {
        return [];
      }
      const firstState: any = nonEmptySnapshots.value[0];
      const firstValue = getPoolValue(firstState.amounts, firstState.price);
      const values = history.value
        .filter((state: any) => state.totalShares !== '0')
        .map((state: any) => {
          if (state.timestamp < firstState.timestamp) {
            return 0;
          }
          const currentValue = getPoolValue(firstState.amounts, state.price);
          return currentValue / firstValue - 1;
        });
      return values;
    });

    const bptValues = computed(() => {
      if (!nonEmptySnapshots.value || nonEmptySnapshots.value.length === 0) {
        return [];
      }
      const firstState: any = nonEmptySnapshots.value[0];
      const firstValue = getPoolValue(firstState.amounts, firstState.price);
      const firstShares = parseFloat(firstState.totalShares);
      const firstValuePerBpt = firstValue / firstShares;
      const values = history.value
        .filter((state: any) => state.totalShares !== '0')
        .map((state: any) => {
          if (state.timestamp < firstState.timestamp) {
            return 0;
          }
          const currentValue = getPoolValue(state.amounts, state.price);
          const currentShares = parseFloat(state.totalShares);
          const currentValuePerBpt = currentValue / currentShares;
          return currentValuePerBpt / firstValuePerBpt - 1;
        });
      return values;
    });*/

    //24 hours, start 95/5, end 80/20
    //each hour causes a 0.625 shift
    //to calculate the predicted curve, we assume no buys/sells will take place from the status quo
    //take the current beets/usdc ratio, scale it down X hours (the remaining hours), taking into account the 0.625 weight shift per hour

    const times: string[] = [];
    const predicted: number[] = [];
    const current: number[] = [];
    const date = parseISO('2021-10-01T17:00:00');

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

    const series = computed(() => {
      return [
        {
          name: 'Predicted Price*',
          values: zip(times, predicted)
        },
        {
          name: 'BEETS Price',
          values: zip(times, current).filter(item => item[1] !== undefined)
        }
      ];
    });

    return {
      series,
      appLoading,
      chartColors
    };
  }
});
</script>
