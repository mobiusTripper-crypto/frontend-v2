<template>
  <BalCard noPad>
    <div class="relative overflow-hidden">
      <div
        class="flex justify-between items-end border-b dark:border-gray-900 px-4"
      >
        <BalTabs v-model="activeTab" :tabs="tabs" class="pt-4 -mb-px" no-pad />
      </div>

      <template v-if="activeTab === 'deposit'">
        <FarmDepositForm
          :pool="pool"
          :farm="farm"
          @success="handleInvestment($event)"
        />
        <SuccessOverlay
          v-if="investmentSuccess"
          :title="$t('farmDepositSettled')"
          :description="$t('farmDepositSuccess')"
          :closeLabel="$t('close')"
          :explorerLink="explorer.txLink(txHash)"
          @close="investmentSuccess = false"
        />
      </template>
      <template v-if="activeTab === 'withdraw'">
        <WithdrawForm
          :pool="pool"
          :missing-prices="missingPrices"
          @success="handleWithdrawal($event)"
        />
        <SuccessOverlay
          v-if="withdrawalSuccess"
          :title="$t('withdrawalSettled')"
          :description="$t('withdrawalSuccess')"
          :closeLabel="$t('close')"
          :explorerLink="explorer.txLink(txHash)"
          @close="withdrawalSuccess = false"
        />
      </template>
    </div>
  </BalCard>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import WithdrawForm from '@/components/forms/pool_actions/WithdrawForm.vue';
import SuccessOverlay from '@/components/cards/SuccessOverlay.vue';
import { useI18n } from 'vue-i18n';
import useFathom from '@/composables/useFathom';
import useWeb3 from '@/services/web3/useWeb3';
import FarmDepositForm from '@/components/forms/farm_actions/FarmDepositForm.vue';
import { Farm, FullPool } from '@/services/balancer/subgraph/types';

export default defineComponent({
  name: 'FarmActionsCard',

  emits: ['onTx'],

  components: {
    FarmDepositForm,
    WithdrawForm,
    SuccessOverlay
  },

  props: {
    pool: { type: Object as PropType<FullPool>, required: true },
    farm: { type: Object as PropType<Farm>, required: true },
    missingPrices: { type: Boolean, default: false }
  },

  setup(_, { emit }) {
    /**
     * COMPOSABLES
     */
    const { t } = useI18n();
    const { trackGoal, Goals } = useFathom();
    const { explorerLinks: explorer } = useWeb3();

    /**
     * STATE
     */
    const tabs = [
      { value: 'deposit', label: 'Deposit' },
      { value: 'withdraw', label: t('withdraw') }
    ];
    const activeTab = ref(tabs[0].value);
    const investmentSuccess = ref(false);
    const withdrawalSuccess = ref(false);
    const txHash = ref('');

    /**
     * METHODS
     */
    function handleInvestment(txReceipt): void {
      investmentSuccess.value = true;
      txHash.value = txReceipt.hash;
      trackGoal(Goals.Invested);
      emit('onTx', txReceipt);
    }

    function handleWithdrawal(txReceipt): void {
      withdrawalSuccess.value = true;
      txHash.value = txReceipt.hash;
      trackGoal(Goals.Withdrawal);
      emit('onTx', txReceipt);
    }

    return {
      // data
      activeTab,
      tabs,
      investmentSuccess,
      withdrawalSuccess,
      txHash,
      // methods
      handleInvestment,
      handleWithdrawal,
      explorer
    };
  }
});
</script>
