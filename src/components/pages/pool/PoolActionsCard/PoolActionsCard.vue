<template>
  <BalCard noPad>
    <div class="relative overflow-hidden">
      <div
        class="flex justify-between items-end border-b dark:border-gray-900 px-4"
      >
        <BalTabs v-model="activeTab" :tabs="tabs" class="pt-4 -mb-px" no-pad />
        <TradeSettingsPopover :context="TradeSettingsContext.invest" />
      </div>

      <template v-if="activeTab === 'invest'">
        <InvestForm
          :pool="pool"
          :missing-prices="missingPrices"
          @success="handleInvestment($event)"
          :has-unstaked-bpt="hasUnstakedBpt"
        />
        <SuccessOverlay
          v-if="investmentSuccess"
          :title="$t('investmentSettled')"
          :description="$t('investmentSuccess')"
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
          :has-staked-bpt="hasStakedBpt"
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
      <template v-if="activeTab === 'farm'">
        <FarmDepositForm :pool="pool" @success="handleFarmInvestment($event)" />
        <SuccessOverlay
          v-if="farmInvestmentSuccess"
          :title="$t('farmDepositSettled')"
          :description="$t('farmDepositSuccess')"
          :closeLabel="$t('close')"
          :explorerLink="explorer.txLink(txHash)"
          @close="farmInvestmentSuccess = false"
        />
        <FarmWithdrawForm
          :pool="pool"
          @success="handleFarmWithdrawal($event)"
        />
        <SuccessOverlay
          v-if="farmWithdrawalSuccess"
          :title="$t('farmWithdrawalSettled')"
          :description="$t('farmWithdrawalSuccess')"
          :closeLabel="$t('close')"
          :explorerLink="explorer.txLink(txHash)"
          @close="farmWithdrawalSuccess = false"
        />
      </template>
    </div>
  </BalCard>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import InvestForm from '@/components/forms/pool_actions/InvestForm.vue';
import WithdrawForm from '@/components/forms/pool_actions/WithdrawForm.vue';
import SuccessOverlay from '@/components/cards/SuccessOverlay.vue';
import { useI18n } from 'vue-i18n';
import TradeSettingsPopover, {
  TradeSettingsContext
} from '@/components/popovers/TradeSettingsPopover.vue';
import useFathom from '@/composables/useFathom';
import useWeb3 from '@/services/web3/useWeb3';
import FarmWithdrawForm from '@/components/forms/farm_actions/FarmWithdrawForm.vue';
import FarmDepositForm from '@/components/forms/farm_actions/FarmDepositForm.vue';
import { getAddress } from '@ethersproject/address';
import useTokens from '@/composables/useTokens';

export default defineComponent({
  name: 'PoolActionsCard',

  emits: ['onTx'],

  components: {
    InvestForm,
    WithdrawForm,
    SuccessOverlay,
    TradeSettingsPopover,
    FarmWithdrawForm,
    FarmDepositForm
  },

  props: {
    pool: { type: Object, required: true },
    missingPrices: { type: Boolean, default: false }
  },

  setup(props, { emit }) {
    /**
     * COMPOSABLES
     */
    const { t } = useI18n();
    const { trackGoal, Goals } = useFathom();
    const { explorerLinks: explorer } = useWeb3();
    const { balanceFor } = useTokens();

    /**
     * STATE
     */
    const hasUnstakedBpt = computed(() => {
      const balance = props.pool.farm
        ? balanceFor(getAddress(props.pool.farm.pair))
        : '0';
      return props.pool.farm && parseFloat(balance) > 0;
    });
    const hasStakedBpt = computed(
      () => props.pool.farm && props.pool.farm.share > 0
    );

    const tabs = computed(() => {
      const tabs: { value: string; label: string; alert?: boolean }[] = [
        { value: 'invest', label: t('invest') },
        { value: 'withdraw', label: t('withdraw') }
      ];

      if (props.pool.farm) {
        tabs.push({
          value: 'farm',
          label: 'Farm',
          alert: hasUnstakedBpt.value
        });
      }

      return tabs;
    });
    const activeTab = ref(tabs.value[0].value);
    const investmentSuccess = ref(false);
    const withdrawalSuccess = ref(false);
    const farmInvestmentSuccess = ref(false);
    const farmWithdrawalSuccess = ref(false);
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

    function handleFarmInvestment(txReceipt): void {
      farmInvestmentSuccess.value = true;
      txHash.value = txReceipt.hash;
      trackGoal(Goals.Invested);
      emit('onTx', txReceipt);
    }

    function handleFarmWithdrawal(txReceipt): void {
      farmWithdrawalSuccess.value = true;
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
      TradeSettingsContext,
      // methods
      handleInvestment,
      handleWithdrawal,
      handleFarmInvestment,
      handleFarmWithdrawal,
      explorer,
      hasUnstakedBpt,
      hasStakedBpt
    };
  }
});
</script>
