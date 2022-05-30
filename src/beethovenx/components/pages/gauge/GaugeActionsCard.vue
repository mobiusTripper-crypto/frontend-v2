<script setup lang="ts">
import GaugeDepositForm from '@/beethovenx/components/pages/gauge/GaugeDepositForm.vue';
import GaugeWithdrawForm from '@/beethovenx/components/pages/gauge/GaugeWithdrawForm.vue';
import useWeb3 from '@/services/web3/useWeb3';
import { ref } from 'vue';
import useTokens from '@/composables/useTokens';
import BalTabs from '@/components/_global/BalTabs/BalTabs.vue';
import SuccessOverlay from '@/components/cards/SuccessOverlay.vue';

type Props = {
  tokenAddress: string;
  gaugeAddress: string;
  hasUnstakedBpt: boolean;
  hasStakeRewards: boolean;
};

const props = defineProps<Props>();

/**
 * STATE
 */
const { explorerLinks: explorer } = useWeb3();

const { loading, dynamicDataLoading } = useTokens();

const gaugeInvestmentSuccess = ref(false);
const gaugeWithdrawalSuccess = ref(false);
const txHash = ref('');

function handleGaugeInvestment(txReceipt): void {
  gaugeInvestmentSuccess.value = true;
  txHash.value = txReceipt.hash;
}

function handleGaugeWithdrawal(txReceipt): void {
  gaugeWithdrawalSuccess.value = true;
  txHash.value = txReceipt.hash;
}

const tabs = [
  { value: 'deposit', label: 'Deposit' },
  { value: 'withdraw', label: 'Withdraw' }
];

const activeTab = ref(tabs[0].value);
</script>

<template>
  <div class="mt-4 relative">
    <BalAlert
      v-if="!loading && props.hasUnstakedBpt"
      title="You have unstaked BPT in your wallet"
      description="If you stake your BPT into the LP, you will earn additional rewards."
      type="warning"
      size="sm"
      class="mb-3"
    />
    <BalLoadingBlock v-if="loading || dynamicDataLoading" class="h-96" />
    <BalCard v-else>
      <div class="text-gray-500 text-sm">
        Stake your LP to earn Rewards
      </div>
      <h5 class="mb-1">Stake</h5>

      <BalTabs v-model="activeTab" :tabs="tabs" no-pad class="-mb-px" />
      <div v-if="activeTab === 'deposit'" class="mt-4">
        <GaugeDepositForm
          :token-address="props.tokenAddress"
          :gauge-address="props.gaugeAddress"
          @success="handleGaugeInvestment($event)"
        />
      </div>
      <SuccessOverlay
        v-if="gaugeInvestmentSuccess"
        :title="$t('stakeDepositSettled')"
        :description="$t('stakeDepositSuccess')"
        :closeLabel="$t('close')"
        :explorerLink="explorer.txLink(txHash)"
        @close="gaugeInvestmentSuccess = false"
        class="h-96"
      />
      <div v-if="activeTab === 'withdraw'" class="mt-4">
        <GaugeWithdrawForm
          :token-address="props.tokenAddress"
          :gauge-address="props.gaugeAddress"
          @success="handleGaugeWithdrawal($event)"
        />
      </div>
      <SuccessOverlay
        v-if="gaugeWithdrawalSuccess"
        :title="$t('stakeWithdrawalSettled')"
        :description="$t('stakeWithdrawalSuccess')"
        :closeLabel="$t('close')"
        :explorerLink="explorer.txLink(txHash)"
        @close="gaugeWithdrawalSuccess = false"
      />
    </BalCard>
  </div>
</template>
