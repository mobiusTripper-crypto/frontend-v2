<script lang="ts" setup>
import { computed, ref } from 'vue';
import useNumbers from '@/composables/useNumbers';
import useEthers from '@/composables/useEthers';
import useFarm from '@/beethovenx/composables/farms/useFarm';
import { GqlBalancerPoolWithRequiredFarm } from '@/beethovenx/services/beethovenx/beethovenx-types';
import BalAsset from '@/components/_global/BalAsset/BalAsset.vue';
import useUserPoolData from '@/beethovenx/composables/useUserPoolData';
import useUserPendingRewards from '@/beethovenx/composables/useUserPendingRewards';

type Props = {
  pool: GqlBalancerPoolWithRequiredFarm;
};

const props = defineProps<Props>();

const { fNum } = useNumbers();
const { txListener } = useEthers();
const { harvest } = useFarm(ref(props.pool.address), ref(props.pool.farm.id));
const harvesting = ref(false);
const { userPoolData } = useUserPoolData(ref(props.pool.id));
const { userPendingRewards, userPendingRewardsQuery } = useUserPendingRewards();

async function harvestRewards(): Promise<void> {
  harvesting.value = true;
  const tx = await harvest();

  if (!tx) {
    harvesting.value = false;
    return;
  }

  txListener(tx, {
    onTxConfirmed: async () => {
      await userPendingRewardsQuery.refetch.value();
      harvesting.value = false;
    },
    onTxFailed: () => {
      harvesting.value = false;
    }
  });
}

const farmPendingRewards = computed(() =>
  userPendingRewards.value.farm.farms.find(
    farm => farm.farmId === props.pool.farm.id
  )
);
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-2 gap-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          TVL
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ fNum(props.pool.farmTotalLiquidity, 'usd') }}
        </div>
      </BalCard>
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          Rewards
        </div>
        <div
          v-for="(rewardToken, i) in props.pool.farm.rewardTokens"
          :key="i"
          :class="[
            'text-xl font-medium truncate flex items-center',
            i < props.pool.farm.rewardTokens.length - 1 ? 'mb-1' : ''
          ]"
        >
          {{ fNum(rewardToken.rewardPerDay, 'token_lg') }}
          <BalAsset :address="rewardToken.address" class="mx-1" />
          <span>/ day</span>
        </div>
      </BalCard>
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          My Balance
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ fNum(userPoolData?.farmBalanceUSD ?? '0', 'usd') }}
        </div>
      </BalCard>
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          My Share
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{
            fNum(
              `${parseFloat(userPoolData?.farmBalanceUSD || '0') /
                parseFloat(props.pool.farmTotalLiquidity ?? '1')}`,
              'percent'
            )
          }}
        </div>
      </BalCard>
    </div>
    <BalCard>
      <div class="text-sm text-gray-500 font-medium mb-2">
        My Pending Rewards
      </div>
      <div
        v-for="(rewardToken, i) in farmPendingRewards?.tokens || []"
        class="text-xl font-medium truncate flex items-center"
        :key="i"
      >
        {{ fNum(rewardToken.balance, 'token_fixed') }} BEETS
      </div>
      <div class="truncate flex items-center pb-8">
        {{ fNum(farmPendingRewards?.balanceUSD || '0', 'usd') }}
      </div>

      <BalBtn
        label="Harvest"
        block
        color="gradient"
        :disabled="!farmPendingRewards"
        :loading="harvesting"
        @click.prevent="harvestRewards"
      />
    </BalCard>
  </div>
</template>
