<script setup lang="ts">
import useWeb3 from '@/services/web3/useWeb3';
import StepContainer from '@/beethovenx/components/containers/StepContainer.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import LockWithdrawForm from '@/beethovenx/components/pages/lock/LockWithdrawForm.vue';
import FreshBeetsWithdrawForm from '@/beethovenx/components/pages/fbeets/FreshBeetsWithdrawForm.vue';
import { useLockUser } from '@/beethovenx/composables/lock/useLockUser';

type Props = {
  hasUnstakedFbeets: boolean;
  loading: boolean;
};

const props = defineProps<Props>();

const { appNetworkConfig } = useWeb3();
const { lockUserQuery, totalUnlockedAmount } = useLockUser();

function handleLockWithdrawal(txReceipt): void {
  lockUserQuery.refetch.value();
}
</script>

<template>
  <StepContainer
    :step-number="1"
    title="Withdraw ALL your unlocked fBEETS"
    :complete="totalUnlockedAmount === '0'"
  >
    <template v-slot:content>
      <LockWithdrawForm
        :farm-id="appNetworkConfig.fBeets.farmId"
        :token-address="appNetworkConfig.fBeets.address"
        token-name="fBEETS"
        @success="handleLockWithdrawal($event)"
        :data-loading="props.loading"
      />
    </template>
  </StepContainer>
  <StepContainer
    :step-number="2"
    title="Burn your fBEETS to receive Fidelio Duetto BPTs"
    :complete="!props.hasUnstakedFbeets"
  >
    <template v-slot:content>
      <FreshBeetsWithdrawForm :loading="props.loading" />
    </template>
  </StepContainer>
  <StepContainer
    :step-number="3"
    title="Withdraw your BEETS and/or FTM from the Fidelio Duetto pool"
    :complete="false"
  >
    <template v-slot:right>
      <BalBtn
        class="w-40"
        tag="router-link"
        :to="{
          name: 'withdraw',
          params: { id: appNetworkConfig.fBeets.poolId }
        }"
        label="Withdraw"
      />
    </template>
  </StepContainer>
</template>
