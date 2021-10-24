<template>
  <div class="mt-12">
    <div class="mb-4">
      <h2>Create an Investment Pool</h2>
      <ul class="list-disc list-inside ml-2">
        <li>An investment pool can be created with 2-8 tokens.</li>
        <li>The weights should add up to 100%.</li>
        <li>
          Initial balances should be in line with your weights or the pool will
          get drained.
        </li>
      </ul>
    </div>
    <BalCard class="pt-2">
      <PoolCreateDefinitionFields
        :pool-name="poolName"
        :pool-symbol="poolSymbol"
        :pool-owner="poolOwner"
        :swap-fee-percentage="swapFeePercentage"
        @poolNameChange="handlePoolNameChange"
        @poolSymbolChange="handlePoolSymbolChange"
        @poolOwnerChange="handlePoolOwnerChange"
        @poolSwapFeePercentageChange="handleSwapFeePercentageChange"
        @isInputValid="handleIsInputValid"
      />

      <div class="font-medium mb-1">Tokens</div>
      <div v-if="tokenListsLoaded">
        <div class="mb-3" v-for="(token, idx) in poolTokens" :key="idx">
          <PoolCreateTokenRow
            :token-address-input="token.address"
            :token-amount-input="token.amount"
            :token-weight-input="token.weight"
            :can-delete="poolTokens.length > 2"
            @token-delete="() => deleteToken(idx)"
            @token-address-change="value => tokenAddressChange(value, idx)"
            @token-amount-change="value => tokenAmountChange(value, idx)"
            @token-weight-change="value => tokenWeightChange(value, idx)"
          />
        </div>
      </div>

      <div class="grid grid-cols-3 mt-4 items-center">
        <div></div>
        <div class="flex-1 flex justify-center">
          <div>
            <BalAlert
              v-if="tokensError"
              type="error"
              class="pl-4 pr-6 py-1"
              size="sm"
              :title="tokensError.header"
              :description="tokensError.body"
              block
            />
          </div>
        </div>
        <div class="flex justify-end pt-1 pb-2">
          <BalBtn
            color="green"
            :disabled="poolTokens.length === 8"
            @click="addToken"
          >
            <BalIcon name="plus" />
          </BalBtn>
        </div>
      </div>
    </BalCard>
    <PoolCreateActions
      :pool-name="poolName"
      :pool-symbol="poolSymbol"
      :pool-owner="poolOwner"
      :swap-fee-percentage="swapFeePercentage"
      :can-create-pool="canCreatePool"
      :pool-tokens="poolTokens"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useStore } from 'vuex';
import useTokenLists from '@/composables/useTokenLists';
import PoolCreateTokenRow from '@/components/pages/pool-create/PoolCreateTokenRow.vue';
import { getAddress } from '@ethersproject/address';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import BalIcon from '@/components/_global/BalIcon/BalIcon.vue';
import { remove } from 'lodash';
import { ZERO_ADDRESS } from '@balancer-labs/sor2';
import { PoolTokenInput } from '@/services/pool/creator/pool-creator.service';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import PoolCreateDefinitionFields from '@/components/pages/pool-create/PoolCreateDefinitionFields.vue';
import BalAlert from '@/components/_global/BalAlert/BalAlert.vue';
import { getTokensErrorFromInputs } from '@/lib/utils/poolCreateHelper';
import PoolCreateActions from '@/components/pages/pool-create/PoolCreateActions.vue';

export default defineComponent({
  components: {
    PoolCreateActions,
    PoolCreateDefinitionFields,
    BalIcon,
    BalBtn,
    BalCard,
    PoolCreateTokenRow,
    BalAlert
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { loadingTokenLists, tokenListsLoaded } = useTokenLists();
    const { appNetworkConfig } = useWeb3();
    const { tokens, balances, approvalsRequired } = useTokens();
    const appLoading = computed(() => store.state.app.loading);
    const poolName = ref('');
    const poolSymbol = ref('');
    const swapFeePercentage = ref('0.25');
    const isDefinitionInputValid = ref(false);
    const poolOwner = ref(appNetworkConfig.addresses.defaultPoolOwner);

    const poolTokens = ref<PoolTokenInput[]>([
      {
        address: getAddress(appNetworkConfig.addresses.weth),
        weight: '50',
        amount: ''
      },
      {
        address: getAddress(appNetworkConfig.addresses.usdc),
        weight: '50',
        amount: ''
      }
    ]);

    const tokensError = computed(() =>
      getTokensErrorFromInputs(
        poolTokens.value,
        tokens.value,
        balances.value,
        approvalsRequired
      )
    );

    const canCreatePool = computed(() => {
      return !tokensError.value && isDefinitionInputValid.value;
    });

    function addToken() {
      poolTokens.value.push({
        address: getAddress(appNetworkConfig.addresses.weth),
        weight: '50',
        amount: ''
      });
    }

    function deleteToken(idx: number) {
      remove(poolTokens.value, (token, index) => idx === index);
    }

    function tokenAddressChange(value: string, idx: number) {
      poolTokens.value[idx].address = value;
    }

    function tokenAmountChange(value: string, idx: number) {
      poolTokens.value[idx].amount = value;
    }

    function tokenWeightChange(value: string, idx: number) {
      poolTokens.value[idx].weight = value;
    }

    function handlePoolNameChange(value: string) {
      poolName.value = value;
    }

    function handlePoolSymbolChange(value: string) {
      poolSymbol.value = value.toUpperCase();
    }

    function handlePoolOwnerChange(value: string) {
      poolOwner.value = value;
    }

    function handleSwapFeePercentageChange(value: string) {
      swapFeePercentage.value = value;
    }

    function handleIsInputValid(valid: boolean) {
      isDefinitionInputValid.value = valid;
    }

    return {
      appLoading,
      loadingTokenLists,
      poolTokens,
      addToken,
      deleteToken,
      tokenAddressChange,
      tokenAmountChange,
      tokenWeightChange,
      poolName,
      poolSymbol,
      poolOwner,
      swapFeePercentage,
      handlePoolNameChange,
      handlePoolSymbolChange,
      handlePoolOwnerChange,
      tokenListsLoaded,
      handleSwapFeePercentageChange,
      handleIsInputValid,
      tokensError,
      canCreatePool
    };
  }
});
</script>
<style scoped>
.card-container {
  @apply p-3 flex items-center border rounded-lg dark:border-gray-800;
}
.card-step {
  @apply w-9 h-9 flex items-center justify-center border rounded-full dark:border-gray-700;
}
</style>
