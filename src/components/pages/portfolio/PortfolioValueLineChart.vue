<template>
  <BalLoadingBlock v-if="isLoading" class="h-96 mt-16" />
  <div v-else>
    <BalCard>
      <h4 class="mt-1">
        Portfolio Value
        <BalTooltip>
          <template v-slot:activator>
            <BalIcon name="info" size="sm" class="ml-1 text-gray-400 -mb-px" />
          </template>
          <div v-html="$t('portfolioValueInfo')" class="w-52" />
        </BalTooltip>
      </h4>
      <div class="text-gray-500">Sep. 14 - Oct. 14</div>
      <ECharts
        ref="chartInstance"
        :class="['w-full', 'portfolio-value-line-chart']"
        :option="chartConfig"
        autoresize
        :update-options="{ replaceMerge: 'series' }"
      />
    </BalCard>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import numeral from 'numeral';
import * as echarts from 'echarts/core';
import ECharts from 'vue-echarts';
import useNumbers from '@/composables/useNumbers';
import useTailwind from '@/composables/useTailwind';
import useDarkMode from '@/composables/useDarkMode';
import { format } from 'date-fns';
import { chartColors } from '@/constants/colors';
import { last } from 'lodash';
import { UserPoolData, UserTokenData } from '@/services/beethovenx/types';

export default defineComponent({
  //emits: ['periodSelected'],
  props: {
    assets: {
      type: Array as PropType<UserPoolData[]>,
      required: true
    },
    isLoading: {
      type: Boolean
    }
  },
  components: {
    ECharts
  },
  setup(props) {
    const chartInstance = ref<echarts.ECharts>();
    const currentValue = ref('$0,00');
    const change = ref(0);
    const { fNum } = useNumbers();
    const tailwind = useTailwind();
    const { darkMode } = useDarkMode();

    // https://echarts.apache.org/en/option.html
    const chartConfig = computed(() => ({
      xAxis: {
        type: 'category',
        data: [
          'Sep. 17',
          'Sep.21',
          'Sep. 28',
          'Oct. 3',
          'Oct. 8',
          'Oct. 10',
          'Oct. 14'
        ],
        axisLine: {
          onZero: false,
          lineStyle: { color: tailwind.theme.colors.gray['600'] }
        },
        axisLabel: {
          color: tailwind.theme.colors.gray[300],
          fontSize: 14
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          onZero: false,
          lineStyle: { color: tailwind.theme.colors.gray['600'] }
        },
        axisLabel: {
          color: tailwind.theme.colors.gray[300],
          fontSize: 14
        },
        splitLine: {
          lineStyle: {
            color: tailwind.theme.colors.gray['700']
          }
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      series: [
        {
          name: 'BTC',
          type: 'bar',
          data: [
            389.6,
            421.9,
            237,
            225.4,
            28.7,
            70.7,
            523.6,
            182.2,
            48.7,
            182.8,
            6.0,
            255.3
          ],
          itemStyle: {
            borderRadius: 6
          }
        },
        {
          name: 'ETH',
          type: 'bar',
          data: [
            100.0,
            105.9,
            227.0,
            308.2,
            25.6,
            76.7,
            115.6,
            162.2,
            32.6,
            20.0,
            555.4,
            123.3
          ],
          itemStyle: {
            borderRadius: 6
          }
        },

        {
          name: 'FTM',
          type: 'bar',
          data: [
            125.6,
            382.9,
            871.0,
            26.4,
            28.7,
            458,
            175.6,
            182.2,
            48.7,
            18.8,
            6.0,
            2.3
          ],
          itemStyle: {
            borderRadius: 6
          }
        },
        {
          name: 'BEETS',
          type: 'bar',
          data: [
            362,
            5.9,
            9.0,
            26.4,
            225.7,
            70.7,
            350.6,
            182.2,
            48.7,
            892.8,
            6.0,
            125
          ],
          itemStyle: {
            borderRadius: 6
          }
        },
        {
          name: 'My Portfolio Value',
          data: [820, 932, 901, 934, 1290, 1330, 1320],
          type: 'line',
          smooth: 0.3,
          lineStyle: {
            width: 4
          },
          markPoint: {
            symbol: 'roundRect',
            symbolSize: 50
          }
        }
      ],
      width: '100%',
      grid: {
        left: 0,
        right: '2.5%',
        top: '10%',
        bottom: '5%',
        containLabel: true
      },
      color: chartColors
    }));

    return {
      //refs
      chartInstance,

      numeral,

      // data
      currentValue,
      change,

      // computed
      chartConfig
    };
  }
});
</script>

<style>
.portfolio-value-line-chart {
  height: 536px;
}
</style>
