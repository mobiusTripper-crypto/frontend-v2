<template>
  <BalLoadingBlock v-if="isLoading" :style="{ height: '622px' }" />
  <div
    v-else
    class="grid grid-cols-1 grid-cols-2 xl:grid-cols-4 gap-y-8 gap-x-0 md:gap-x-4 mb-8"
  >
    <BalCard class="col col-span-1" v-if="topPerformer">
      <div class="text-gray-500 font-medium mb-4">
        Top Performer (24h)
      </div>
      <BalAssetSet
        :addresses="topPerformer.tokens.map(token => token.address)"
        :size="40"
        :width="150"
      />
      <div class="font-medium truncate flex items-center mt-2 text-gray-500">
        {{ topPerformer.name }}
      </div>
      <div class="text-xl font-medium mt-4">
        <div>
          {{ topPerformer.priceChange >= 0 ? '+' : '-'
          }}{{ fNum(topPerformer.priceChange, 'usd') }}&nbsp;
        </div>
      </div>
      <div
        :class="[
          ' text-sm',
          topPerformer.priceChangePercent >= 0
            ? 'text-green-500'
            : 'text-red-500'
        ]"
      >
        {{ topPerformer.priceChangePercent >= 0 ? '+' : '-'
        }}{{ fNum(topPerformer.priceChangePercent, 'percent') }}
      </div>
    </BalCard>
    <BalCard class="col col-span-1" v-if="topPerformer">
      <div class="text-gray-500 font-medium mb-4">
        Top Earner (24h)
      </div>
      <BalAssetSet
        :addresses="topEarner.tokens.map(token => token.address)"
        :size="40"
        :width="150"
      />
      <div class="font-medium truncate flex items-center mt-2 text-gray-500">
        {{ topEarner.name }}
      </div>
      <div class="text-xl font-medium mt-4">
        <div>{{ fNum(topEarner.myFees, 'usd') }}&nbsp;</div>
      </div>
      <div class="text-gray-500 text-sm">
        In swap fees
      </div>
    </BalCard>
    <BalCard class="col col-span-1" v-if="highestVolume">
      <div class="text-gray-500 font-medium mb-4">
        Highest Volume (24h)
      </div>
      <BalAssetSet
        :addresses="highestVolume.tokens.map(token => token.address)"
        :size="40"
        :width="150"
      />
      <div class="font-medium truncate flex items-center mt-2 text-gray-500">
        {{ highestVolume.name }}
      </div>
      <div class="text-xl font-medium mt-4">
        {{ fNum(highestVolume.swapVolume, 'usd') }}
      </div>
      <div class="text-gray-500 text-sm"></div>
    </BalCard>
    <BalCard class="col col-span-1" v-if="worstPerformer">
      <div class="text-gray-500 font-medium mb-4">
        Worst Performer (24h)
      </div>
      <BalAssetSet
        :addresses="worstPerformer.tokens.map(token => token.address)"
        :size="42"
        :width="150"
      />
      <div class="font-medium truncate flex items-center mt-2 text-gray-500">
        {{ worstPerformer.name }}
      </div>
      <div class="text-xl font-medium mt-4">
        <div>
          -$11,079.74
        </div>
      </div>
      <div
        :class="[
          ' text-sm',
          worstPerformer.priceChangePercent >= 0
            ? 'text-green-500'
            : 'text-red-500'
        ]"
      >
        <!--        {{ worstPerformer.priceChange >= 0 ? '+' : '-'
        }}{{ fNum(worstPerformer.priceChangePercent, 'percent') }}-->
        -0.05%
      </div>
    </BalCard>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import numeral from 'numeral';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import { UserPoolData, UserTokenData } from '@/services/beethovenx/types';
import { orderBy } from 'lodash';
import useNumbers from '@/composables/useNumbers';

export default defineComponent({
  props: {
    pools: {
      type: Array as PropType<UserPoolData[]>,
      required: true
    },
    isLoading: {
      type: Boolean
    }
  },
  components: {
    BalCard
  },
  setup(props) {
    const { fNum } = useNumbers();

    const topPerformer = computed(() => {
      const sorted = orderBy(props.pools, 'priceChange', 'desc');

      return sorted[0];
    });

    const topEarner = computed(() => {
      const sorted = orderBy(props.pools, 'myFees', 'desc');

      return sorted[0];
    });

    const highestVolume = computed(() => {
      const sorted = orderBy(props.pools, 'swapVolume', 'desc');

      return sorted[0];
    });

    const worstPerformer = computed(() => {
      const sorted = orderBy(props.pools, 'priceChange', 'asc');

      return sorted[0];
    });

    return {
      //refs

      numeral,
      fNum,
      topPerformer,
      topEarner,
      highestVolume,
      worstPerformer
    };
  }
});
</script>
