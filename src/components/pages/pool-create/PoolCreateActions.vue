<template>
  <BalCard class="mt-4 mb-3">
    <div class="mt-2 mb-3">
      Pool creation requires 3 transactions:
    </div>
    <div>
      <div class="card-container">
        <div class="card-step text-green-500">
          <BalIcon
            v-if="poolAddress !== ''"
            name="check"
            class="text-green-500"
          />
          <span v-else class="text-gray-500 dark:text-gray-400">1</span>
        </div>
        <div class="ml-3 flex-1">
          <span>Create Pool</span>
        </div>
        <BalBtn
          v-if="poolAddress === ''"
          @click="createPool"
          :disabled="!canCreatePool"
          size="sm"
          :loading="creating"
        >
          Create Pool
        </BalBtn>
        <div v-else class="ml-4 text-sm">
          Pool address: {{ poolAddress }}<br />Pool id: {{ poolId }}
        </div>
      </div>
      <div class="card-container mt-3">
        <div class="card-step text-green-500">
          <BalIcon v-if="joined" name="check" class="text-green-500" />
          <span v-else class="text-gray-500 dark:text-gray-400">2</span>
        </div>
        <div class="ml-3 flex-1">
          <span>Join Pool</span>
        </div>
        <BalBtn
          v-if="!joined"
          @click="joinPool"
          :disabled="poolAddress === ''"
          size="sm"
          :loading="joining"
        >
          Join Pool
        </BalBtn>
        <div v-else class="ml-4 text-sm">
          Joined
        </div>
      </div>
      <div class="card-container mt-3">
        <div class="card-step text-green-500">
          <BalIcon v-if="verified" name="check" class="text-green-500" />
          <span v-else class="text-gray-500 dark:text-gray-400">3</span>
        </div>
        <div class="ml-3 flex-1">
          <span>Verify Pool</span>
        </div>
        <BalBtn
          v-if="!verified"
          @click="verifyPool"
          :disabled="!joined"
          size="sm"
          :loading="verifying"
        >
          Verify Pool
        </BalBtn>
        <div v-else class="ml-4 text-sm">
          Verified
        </div>
      </div>
    </div>
  </BalCard>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import { useStore } from 'vuex';
import useTokenLists from '@/composables/useTokenLists';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import BalIcon from '@/components/_global/BalIcon/BalIcon.vue';
import {
  PoolCreatorService,
  PoolTokenInput
} from '@/services/pool/creator/pool-creator.service';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import useEthers from '@/composables/useEthers';
import useTransactions from '@/composables/useTransactions';
import { PoolVerifierService } from '@/services/pool/creator/pool-verifier.service';

export default defineComponent({
  components: {
    BalIcon,
    BalBtn,
    BalCard
  },
  props: {
    swapFeePercentage: {
      type: String,
      required: true
    },
    poolOwner: {
      type: String,
      required: true
    },
    poolSymbol: {
      type: String,
      required: true
    },
    poolName: {
      type: String,
      required: true
    },
    poolTokens: {
      type: Array as PropType<PoolTokenInput[]>,
      required: true
    },
    canCreatePool: {
      type: Boolean,
      required: true
    }
  },
  emits: [
    'poolNameChange',
    'poolSymbolChange',
    'poolOwnerChange',
    'poolSwapFeePercentageChange',
    'isInputValid'
  ],

  setup(props) {
    // COMPOSABLES
    const store = useStore();
    const { loadingTokenLists, tokenListsLoaded } = useTokenLists();
    const { appNetworkConfig, getProvider, account } = useWeb3();
    const { tokens } = useTokens();
    const { txListener } = useEthers();
    const { addTransaction } = useTransactions();
    const appLoading = computed(() => store.state.app.loading);
    const poolCreatorService = computed(
      () => new PoolCreatorService(appNetworkConfig.key)
    );
    const poolVerifierService = computed(
      () => new PoolVerifierService(appNetworkConfig.key)
    );

    const verifying = ref(false);
    const verified = ref(false);
    const creating = ref(false);
    const joining = ref(false);
    const joined = ref(false);
    const blockHash = ref('');
    const poolAddress = ref('');
    const poolId = ref('');

    async function createPool(): Promise<void> {
      const {
        poolName,
        poolSymbol,
        poolOwner,
        swapFeePercentage,
        poolTokens
      } = props;

      try {
        creating.value = true;
        const tx = await poolCreatorService.value.createWeightedPool(
          getProvider(),
          props.poolName,
          `BPT-${poolSymbol}`,
          poolOwner,
          `${parseFloat(swapFeePercentage) / 100}`,
          poolTokens
        );

        addTransaction({
          id: tx.hash,
          type: 'tx',
          action: 'create',
          summary: `Creating your pool with name: ${poolName}`,
          details: { name: poolName, symbol: poolSymbol }
        });

        txListener(tx, {
          onTxConfirmed: async (tx: TransactionResponse) => {
            const data = await poolCreatorService.value.getPoolDataFromTransaction(
              getProvider(),
              tx
            );
            poolAddress.value = data.poolAddress;
            blockHash.value = data.blockHash;
            poolId.value = data.poolId;

            console.log(' data.poolAddress', data.poolAddress);
            console.log('data.blockHash', data.blockHash);

            creating.value = false;
          },
          onTxFailed: () => {
            creating.value = false;
          }
        });
      } catch (error) {
        console.error(error);
        creating.value = false;
      }
    }

    async function joinPool(): Promise<void> {
      try {
        joining.value = true;
        const tx = await poolCreatorService.value.joinPool(
          getProvider(),
          props.poolTokens,
          poolId.value,
          account.value,
          tokens.value
        );

        addTransaction({
          id: tx.hash,
          type: 'tx',
          action: 'invest',
          summary: `Joining your pool with name: ${props.poolName}`,
          details: {}
        });

        txListener(tx, {
          onTxConfirmed: async (tx: TransactionResponse) => {
            joining.value = false;
            joined.value = true;
          },
          onTxFailed: () => {
            joining.value = false;
          }
        });
      } catch (error) {
        console.error(error);
        joining.value = false;
      }
    }

    async function verifyPool() {
      const {
        poolName,
        poolSymbol,
        poolOwner,
        swapFeePercentage,
        poolTokens
      } = props;

      try {
        verifying.value = true;
        await poolCreatorService.value.verifyPool(
          getProvider(),
          poolName,
          `BPT-${poolSymbol}`,
          poolOwner,
          `${parseFloat(swapFeePercentage) / 100}`,
          poolTokens,
          poolAddress.value,
          blockHash.value
        );

        verifying.value = false;
        verified.value = true;
      } catch {
        verifying.value = false;
      }
    }

    return {
      appLoading,
      loadingTokenLists,
      tokenListsLoaded,
      createPool,
      joinPool,
      poolAddress,
      poolId,
      blockHash,
      creating,
      joining,
      joined,
      verifyPool,
      verifying,
      verified
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
