<script setup lang="ts">
import useWeb3 from '@/services/web3/useWeb3';
import StepContainer from '@/beethovenx/components/containers/StepContainer.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import LockDepositForm from '@/beethovenx/components/pages/lock/LockDepositForm.vue';
import FreshBeetsDepositForm from '@/beethovenx/components/pages/fbeets/FreshBeetsDepositForm.vue';
import { useLockUser } from '@/beethovenx/composables/lock/useLockUser';

type Props = {
  hasBpt: boolean;
  hasBeets: boolean;
  hasUnstakedFbeets: boolean;
  loading: boolean;
};

const props = defineProps<Props>();

const { appNetworkConfig } = useWeb3();
const { lockUserQuery } = useLockUser();

function handleLockDeposit(txReceipt): void {
  lockUserQuery.refetch.value();
}
</script>

<template>
  <StepContainer
    :step-number="1"
    title="Deposit your BEETS or FTM into the Fidelio Duetto pool"
    :complete="!props.hasBeets"
  >
    <template v-slot:right>
      <BalBtn
        class="w-40"
        tag="router-link"
        :to="{
          name: 'invest',
          params: { id: appNetworkConfig.fBeets.poolId }
        }"
        label="Deposit"
      />
    </template>
  </StepContainer>
  <StepContainer
    v-if="props.hasBpt"
    :step-number="2"
    title="Use your Fidelio Duetto BPTs to mint fBEETS"
    :complete="!props.hasUnstakedFbeets"
  >
    <template v-slot:content>
      <FreshBeetsDepositForm :loading="props.loading" />
    </template>
  </StepContainer>
  <StepContainer
    :step-number="props.hasBpt ? 3 : 2"
    title="Lock your fBEETS"
    :complete="props.hasStakedFbeets"
  >
    <template v-slot:content>
      <LockDepositForm
        :farm-id="appNetworkConfig.fBeets.farmId"
        :token-address="appNetworkConfig.fBeets.address"
        token-name="fBEETS"
        :data-loading="props.loading"
        @success="handleLockDeposit($event)"
      />
    </template>
  </StepContainer>
</template>
