<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';
import { useFreshBeets } from '@/beethovenx/composables/stake/useFreshBeets';
import LockHeader from '@/beethovenx/components/pages/lock/LockHeader.vue';
import LockStatSideCard from '@/beethovenx/components/pages/lock/LockStatSideCard.vue';
import LockStatCards from '@/beethovenx/components/pages/lock/LockStatCards.vue';
import LockMyLocks from '@/beethovenx/components/pages/lock/LockMyLocks.vue';
import BalTabs from '@/components/_global/BalTabs/BalTabs.vue';
import LockDepositSteps from '@/beethovenx/components/pages/lock/LockDepositSteps.vue';
import LockWithdrawSteps from '@/beethovenx/components/pages/lock/LockWithdrawSteps.vue';
import useTokens from '@/composables/useTokens';
import BalAlert from '@/components/_global/BalAlert/BalAlert.vue';
import { useLockUser } from '@/beethovenx/composables/lock/useLockUser';
import { fNum } from '@/composables/useNumbers';
import { getAddress } from '@ethersproject/address';

const { appNetworkConfig } = useWeb3();
const {
  fBeetsLoading,
  userBptTokenBalance,
  userUnstakedFbeetsBalance
} = useFreshBeets();
const {
  balanceFor,
  injectTokens,
  dynamicDataLoading,
  loading: tokensLoading
} = useTokens();
const {
  totalLockedAmount,
  totalUnlockedAmount,
  lockingUserVotingPower,
  lockingPeriods
} = useLockUser();

const hasUnstakedFbeets = computed(() => userUnstakedFbeetsBalance.value.gt(0));
const hasBpt = computed(() => userBptTokenBalance.value.gt(0));

const beetsBalance = computed(() =>
  fNum(balanceFor(getAddress(appNetworkConfig.addresses.beets)), 'token')
);

onMounted(() => {
  injectTokens([
    appNetworkConfig.fBeets.poolAddress,
    appNetworkConfig.fBeets.address
  ]);
});

const dataLoading = computed(
  () => fBeetsLoading.value || tokensLoading.value || dynamicDataLoading.value
);

const tabs = [
  { value: 'lock', label: 'Lock' },
  { value: 'withdraw', label: 'Withdraw' },
  { value: 'my-locks', label: 'My Locks' }
];

const activeTab = ref(tabs[0].value);
</script>

<template>
  <div class="lg:container lg:mx-auto pt-12 md:pt-12">
    <LockHeader />
    <div class="flex justify-center">
      <div class="w-full max-w-3xl">
        <BalAlert
          v-if="
            lockingUserVotingPower < totalLockedAmount - totalUnlockedAmount
          "
          title="You have locked new fBEETS"
          description="Your newly locked fBEETS will be added to your voting power at the start of the next epoch."
          size="md"
          class="mb-4"
          block
        />
        <BalAlert
          v-if="userBptTokenBalance.gt(0)"
          title="You have unstaked BPT in your wallet"
          description="Use your BPT's to mint fBEETS and be eligible to earn a portion of Beethoven X Protocol Revenue."
          type="warning"
          size="md"
          class="mb-4"
          block
        />
        <BalAlert
          v-if="userUnstakedFbeetsBalance.gt(0)"
          title="You have fBEETS in your wallet"
          description="Lock your fBEETS to earn additional rewards and have voting power."
          type="warning"
          size="md"
          class="mb-4"
          block
        />
      </div>
    </div>

    <div class="lg:flex justify-center mb-8">
      <div class="w-full lg:max-w-3xl">
        <div class="mb-6">
          <LockStatCards />
        </div>
        <div class="mb-4">
          <BalTabs v-model="activeTab" :tabs="tabs" no-pad class="-mb-px" />
        </div>
        <LockDepositSteps
          v-if="activeTab === 'lock'"
          :hasBpt="hasBpt"
          :hasBeets="beetsBalance > 0"
          :hasUnstakedFbeets="hasUnstakedFbeets"
          :loading="dataLoading"
        />
        <LockWithdrawSteps
          v-if="activeTab === 'withdraw'"
          :hasUnstakedFbeets="hasUnstakedFbeets"
          :loading="dataLoading"
        />
        <LockMyLocks
          v-if="activeTab === 'my-locks'"
          :loading="dataLoading"
          :locks="lockingPeriods"
        />
      </div>
    </div>
  </div>
</template>
