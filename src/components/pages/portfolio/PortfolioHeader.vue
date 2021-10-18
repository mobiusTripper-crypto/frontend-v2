<template>
  <div class="mb-16 flex">
    <div class="flex-1">
      <h2 class="text-green-500 mb-2">My Portfolio</h2>
      <h2 class="text-5xl">$123,245.22</h2>
    </div>
    <BalCard class="w-48 mr-2">
      <div class="text-sm text-gray-500 font-medium mb-2">
        TVL
      </div>
      <div class="text-xl font-medium truncate flex items-center">
        $232,820,000
      </div>
      <!--      <div class="text-sm text-gray-500 font-medium mt-1">
        $454.22
      </div>-->
    </BalCard>
    <!--    <BalCard class="mr-2 w-48">
      <div class="text-sm text-gray-500 font-medium mb-2">
        BEETS Price
      </div>
      <div class="text-xl font-medium truncate flex items-center">
        $1.48
      </div>
      <div class="text-sm text-gray-500 font-medium mt-1">
        MC: $8,450,000
      </div>
    </BalCard>
    <BalCard class="w-48">
      <div class="text-sm text-gray-500 font-medium mb-2">
        Circulating Supply
      </div>
      <div class="text-xl font-medium truncate flex items-center">
        7,724,530
      </div>
      <div class="text-sm text-gray-500 font-medium mt-1">
        5.05 BEETS/block
      </div>
    </BalCard>-->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import numeral from 'numeral';
import BalCard from '@/components/_global/BalCard/BalCard.vue';

export default defineComponent({
  //emits: ['periodSelected'],
  props: {
    height: {
      type: String
    }
  },
  components: {
    BalCard
  },
  setup(props) {
    return {
      //refs

      numeral
    };
  }
});
</script>
