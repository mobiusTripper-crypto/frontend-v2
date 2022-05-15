<script setup lang="ts">
import { toRef, computed, ref, onBeforeMount } from 'vue';
import { FullPool } from '@/services/balancer/subgraph/types';
import { isLessThanOrEqualTo, isRequired } from '@/lib/utils/validations';
// Composables
import useWithdrawMath from './composables/useWithdrawMath';
import useWithdrawalState from './composables/useWithdrawalState';
import useWeb3 from '@/services/web3/useWeb3';
import { useI18n } from 'vue-i18n';
// Components
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import WithdrawTotals from './components/WithdrawTotals.vue';
import WithdrawPreviewModal from './components/WithdrawPreviewModal/WithdrawPreviewModal.vue';
import ProportionalWithdrawalInput from './components/ProportionalWithdrawalInput.vue';
import WithdrawalTokenSelect from './components/WithdrawalTokenSelect.vue';
import usePools from '@/composables/pools/usePools';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import BalAlert from '@/components/_global/BalAlert/BalAlert.vue';

/**
 * TYPES
 */
type Props = {
  pool: FullPool;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

const showPreview = ref(false);

/**
 * COMPOSABLES
 */
const { t } = useI18n();

const {
  isProportional,
  tokenOut,
  tokenOutIndex,
  highPriceImpactAccepted,
  validInput,
  maxSlider,
  tokensOut
} = useWithdrawalState(toRef(props, 'pool'));

const { usdAsset } = usePoolTransfers();
const withdrawMath = useWithdrawMath(
  toRef(props, 'pool'),
  usdAsset,
  isProportional,
  tokenOut,
  tokenOutIndex
);

const {
  hasAmounts,
  highPriceImpact,
  singleAssetMaxes,
  tokenOutAmount,
  tokenOutPoolBalance,
  initMath,
  loadingAmountsOut
} = withdrawMath;

const {
  isWalletReady,
  toggleWalletSelectModal,
  isMismatchedNetwork
} = useWeb3();

/**
 * COMPUTED
 */
const hasAcceptedHighPriceImpact = computed((): boolean =>
  highPriceImpact.value ? highPriceImpactAccepted.value : true
);

const hasValidInputs = computed((): boolean => {
  return validInput.value && hasAcceptedHighPriceImpact.value;
});

const disabled = computed(() => {
  return (
    !hasAmounts.value ||
    !hasValidInputs.value ||
    isMismatchedNetwork.value ||
    loadingAmountsOut.value ||
    (isProportional.value &&
      props.pool.id ===
        '0xdfc65c1f15ad3507754ef0fd4ba67060c108db7e000000000000000000000406')
  );
});

const singleAssetRules = computed(() => [
  isLessThanOrEqualTo(tokenOutPoolBalance.value, t('exceedsPoolBalance'))
]);

/**
 * CALLBACKS
 */
onBeforeMount(() => {
  isProportional.value = true;
  maxSlider();
  initMath();
});
</script>

<template>
  <div>
    <ProportionalWithdrawalInput
      v-if="isProportional"
      :pool="pool"
      :tokenAddresses="tokensOut"
      :math="withdrawMath"
    />
    <BalAlert
      type="warning"
      v-if="
        pool.id ===
          '0xdfc65c1f15ad3507754ef0fd4ba67060c108db7e000000000000000000000406' &&
          isProportional
      "
      title="Proportional withdraw disabled"
      description="Proportional withdraw has been disabled for this pool. Please withdraw with DEI"
      class="mt-4"
    />
    <TokenInput
      v-else
      :name="tokenOut"
      :address="tokenOut"
      v-model:amount="tokenOutAmount"
      v-model:isValid="validInput"
      :customBalance="singleAssetMaxes[tokenOutIndex] || '0'"
      :rules="singleAssetRules"
      :balanceLabel="$t('singleTokenMax')"
      :balanceLoading="loadingAmountsOut"
      fixedToken
      disableNativeAssetBuffer
      :disableMax="
        pool?.id ===
          '0x6da14f5acd58dd5c8e486cfa1dc1c550f5c61c1c0000000000000000000003cf'
      "
    >
      <template #tokenSelect>
        <WithdrawalTokenSelect :pool="pool" :initToken="tokenOut" />
      </template>
    </TokenInput>

    <WithdrawTotals :math="withdrawMath" class="mt-4" />

    <div
      v-if="highPriceImpact"
      class="border dark:border-gray-700 rounded-lg p-2 pb-2 mt-4"
    >
      <BalCheckbox
        v-model="highPriceImpactAccepted"
        :rules="[isRequired($t('priceImpactCheckbox'))]"
        name="highPriceImpactAccepted"
        size="sm"
        :label="$t('priceImpactAccept', [$t('withdrawing')])"
      />
    </div>

    <div class="mt-4">
      <BalBtn
        v-if="!isWalletReady"
        :label="$t('connectWallet')"
        color="gradient"
        block
        @click="toggleWalletSelectModal"
      />
      <BalBtn
        v-else
        :label="$t('preview')"
        color="gradient"
        :disabled="disabled"
        block
        @click="showPreview = true"
      />
    </div>

    <teleport to="#modal">
      <WithdrawPreviewModal
        v-if="showPreview"
        :pool="pool"
        :math="withdrawMath"
        @close="showPreview = false"
      />
    </teleport>
  </div>
</template>
