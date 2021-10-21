<template>
  <BalCard shadow="lg" class="mt-4" noPad>
    <div class="flex items-center border-gray-700 border-b pt-3 px-4 pb-2">
      <div class="flex-1">
        <span class="font-medium">Swap Rates</span>
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
    <div class="flex items-center border-gray-700 border-b pt-2 px-3 pb-2">
      <div class="flex items-center flex-1">
        <BalAsset
          address="0x04068da6c83afcfa0e13ba15a6696662335d5b75"
          :size="24"
        />
        <div class="ml-2 font-medium w-8">10k</div>
        <BalIcon
          name="arrow-right"
          size="sm"
          class="ml-1 mr-2 flex items-center"
        />
        <BalAsset
          address="0x321162Cd933E2Be498Cd2267a90534A804051b11"
          :size="24"
        />
      </div>
      <div class="w-20 flex justify-center">
        0.221
      </div>
      <div class="w-20 flex justify-center">
        0.231
      </div>
      <div class="w-20 flex justify-center text-green-500">
        0.234
      </div>
    </div>
    <div class="flex items-center border-gray-700 border-b pt-2 px-3 pb-2">
      <div class="flex items-center flex-1">
        <BalAsset
          address="0x321162Cd933E2Be498Cd2267a90534A804051b11"
          :size="24"
        />
        <span class="ml-2 font-medium w-8">0.5</span>
        <BalIcon
          name="arrow-right"
          size="sm"
          class="ml-1 mr-2 flex items-center"
        />
        <BalAsset
          address="0x04068da6c83afcfa0e13ba15a6696662335d5b75"
          :size="24"
        />
      </div>
      <div class="w-20 flex justify-center text-green-500">
        0.234
      </div>
      <div class="w-20 flex justify-center">
        0.221
      </div>
      <div class="w-20 flex justify-center">
        0.231
      </div>
    </div>
    <div class="flex items-center border-gray-700 border-b pt-2 px-3 pb-2">
      <div class="flex items-center flex-1">
        <BalAsset
          address="0x04068da6c83afcfa0e13ba15a6696662335d5b75"
          :size="24"
        />
        <div class="ml-2 font-medium w-8">10k</div>
        <BalIcon
          name="arrow-right"
          size="sm"
          class="ml-1 mr-2 flex items-center"
        />
        <BalAsset
          address="0x321162Cd933E2Be498Cd2267a90534A804051b11"
          :size="24"
        />
      </div>
      <div class="w-20 flex justify-center">
        0.221
      </div>
      <div class="w-20 flex justify-center text-green-500">
        0.234
      </div>
      <div class="w-20 flex justify-center">
        0.231
      </div>
    </div>
    <div class="flex items-center pt-2 px-3 pb-4">
      <div class="flex items-center flex-1">
        <BalAsset
          address="0x321162Cd933E2Be498Cd2267a90534A804051b11"
          :size="24"
        />
        <span class="ml-2 font-medium w-8">0.5</span>
        <BalIcon
          name="arrow-right"
          size="sm"
          class="ml-1 mr-2 flex items-center"
        />
        <BalAsset
          address="0x04068da6c83afcfa0e13ba15a6696662335d5b75"
          :size="24"
        />
      </div>
      <div class="w-20 flex justify-center">
        0.221
      </div>
      <div class="w-20 flex justify-center">
        0.231
      </div>
      <div class="w-20 flex justify-center text-green-500">
        0.234
      </div>
    </div>
  </BalCard>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import { useRouter } from 'vue-router';
import { SubgraphSwap } from '@/services/balancer/subgraph/types';
import { getAddress } from '@ethersproject/address';
import useNumbers from '@/composables/useNumbers';
import { ColumnDefinition } from '@/components/_global/BalTable/BalTable.vue';
import useDarkMode from '@/composables/useDarkMode';
import useBreakpoints from '@/composables/useBreakpoints';
import { isStableLike } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import { calculateRewardsPerDay } from '@/lib/utils/farmHelper';
import useWeb3 from '@/services/web3/useWeb3';
import { format } from 'date-fns';
import useSwapsQuery from '@/composables/queries/useSwapsQuery';
import { flatten, orderBy } from 'lodash';
import numeral from 'numeral';

export default defineComponent({
  components: {},

  props: {},

  setup(props) {
    const { fNum } = useNumbers();
    const router = useRouter();
    const { darkMode } = useDarkMode();
    const { upToLargeBreakpoint } = useBreakpoints();
    const { tokens, priceFor } = useTokens();
    const { isWalletReady } = useWeb3();

    const swapsQuery = useSwapsQuery(
      {},
      {
        poolIds: ref([
          '0x03c6b3f09d2504606936b1a4decefad204687890000200000000000000000015',
          '0xcde5a11a4acb4ee4c805352cec57e236bdbc3837000200000000000000000019'
        ])
      }
    );

    const swaps = computed(() =>
      swapsQuery.data.value
        ? orderBy(
            flatten(swapsQuery.data.value.pages.map(page => page.swaps)),
            'timestamp',
            'desc'
          )
        : []
    );

    function loadMoreSwaps() {
      swapsQuery.fetchNextPage.value();
    }

    const columns = ref<ColumnDefinition<SubgraphSwap>[]>([
      {
        name: 'Swap',
        id: 'timestamp',
        accessor: 'timestamp',
        sortKey: 'timestamp',
        width: 150
      },
      {
        name: 'Type',
        id: 'type',
        accessor: 'type',
        sortKey: 'type',
        width: 50
      },
      {
        name: 'Input',
        id: 'input',
        accessor: 'input',
        sortKey: 'input',
        width: 50
      },
      {
        name: 'Input',
        id: 'input',
        accessor: 'input',
        sortKey: 'input',
        width: 50
      }
    ]);

    const data = computed(() => {
      return [];
    });

    return {
      // data
      columns,
      data,

      // computed
      darkMode,
      upToLargeBreakpoint,

      // methods
      getAddress,
      fNum,
      isStableLike,
      calculateRewardsPerDay,
      loadMoreSwaps,
      isLoading: swapsQuery.isLoading,
      isLoadingMore: swapsQuery.isFetchingNextPage,
      hasNextPage: swapsQuery.hasNextPage
    };
  }
});
</script>
