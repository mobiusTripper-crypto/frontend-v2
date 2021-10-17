<template>
  <BalLoadingBlock v-if="isLoading" class="h-96 mt-16" />
  <div v-else>
    <BalCard>
      <h4 class="mb-4 mt-1">
        Pools<BalTooltip>
          <template v-slot:activator>
            <BalIcon name="info" size="sm" class="ml-1 text-gray-400 -mb-px" />
          </template>
          <div v-html="$t('portfolioPoolsInfoText')" class="w-52" />
        </BalTooltip>
      </h4>
      <div>
        <ECharts
          ref="chartInstance"
          class="h-60 w-full"
          :option="chartConfig"
          autoresize
          :update-options="{ replaceMerge: 'series' }"
        />
      </div>
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
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import { chartColors } from '@/constants/colors';
import { UserPoolData } from '@/services/beethovenx/types';

export default defineComponent({
  props: {
    pools: {
      type: Array as PropType<UserPoolData[]>,
      required: true
    }
  },
  components: {
    BalCard,
    ECharts
  },
  setup(props) {
    const chartInstance = ref<echarts.ECharts>();
    const currentValue = ref('$0,00');
    const change = ref(0);
    const { fNum } = useNumbers();
    const tailwind = useTailwind();
    const { darkMode } = useDarkMode();

    const chartConfig = computed(() => ({
      tooltip: {
        trigger: 'item'
      },
      legend: {
        show: false
      },
      series: [
        {
          name: 'My Assets',
          type: 'pie',
          radius: ['45%', '95%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: tailwind.theme.colors.gray['850'],
            borderWidth: 2
          },
          label: {
            show: false
          },
          labelLine: {
            show: false
          },
          data: [
            ...props.pools.map(pool => ({
              name: pool.name,
              value: Math.round(pool.totalPrice * 100) / 100
            }))
          ],
          color: chartColors
        }
      ]
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
