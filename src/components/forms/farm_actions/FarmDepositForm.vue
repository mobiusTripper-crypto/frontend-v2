<template>
  <BalForm ref="depositForm" @on-submit="submit">
    <div class="px-4 pt-6 pb-20 border-b dark:border-gray-900">
      <BalTextInput
        name="Deposit"
        v-model="amount"
        v-model:isValid="validInput"
        :rules="amountRules()"
        :disabled="loading"
        type="number"
        min="0"
        step="any"
        placeholder="0"
        :decimal-limit="18"
        validate-on="input"
        prepend-border
        append-shadow
      >
        <template v-slot:info>
          <div class="cursor-pointer" @click.prevent="amount = bptBalance">
            {{ $t('balance') }}:
            {{ bptBalance }}
          </div>
        </template>
        <template v-slot:append>
          <div class="p-2">
            <BalBtn
              size="xs"
              color="white"
              @click.prevent="amount = bptBalance"
            >
              {{ $t('max') }}
            </BalBtn>
          </div>
        </template>
      </BalTextInput>
      <div class="text-right">
        <router-link
          :to="{
            name: 'pool',
            params: {
              id: pool.id
            }
          }"
          class="text-xs text-gray-500 dark:text-white underline"
        >
          Get BPT
        </router-link>
      </div>
    </div>

    <div class="p-4">
      <BalBtn
        v-if="!isWalletReady"
        :label="$t('connectWallet')"
        block
        @click.prevent="toggleWalletSelectModal"
      />
      <template v-else>
        <BalBtn
          v-if="approvalRequired"
          :label="`${$t('approve')}`"
          :loading="approving"
          :loading-label="$t('approving')"
          :disabled="!validInput || parseFloat(amount) === 0 || amount === ''"
          block
          @click.prevent="approveToken"
        />
        <template v-else>
          <BalBtn
            type="submit"
            :loading-label="$t('confirming')"
            color="gradient"
            :disabled="!validInput || parseFloat(amount) === 0 || amount === ''"
            :loading="depositing"
            block
            @click="trackGoal(Goals.ClickFarmDeposit)"
          >
            {{ $t('deposit') }}
          </BalBtn>
        </template>
      </template>
    </div>
  </BalForm>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  PropType,
  reactive,
  ref,
  toRef,
  toRefs,
  watch
} from 'vue';
import { FormRef } from '@/types';
import {
  isLessThanOrEqualTo,
  isPositive,
  isRequired
} from '@/lib/utils/validations';
import { useI18n } from 'vue-i18n';
import useNumbers from '@/composables/useNumbers';
import { scale } from '@/lib/utils';
import { Farm, FarmUser, FullPool } from '@/services/balancer/subgraph/types';
import useFathom from '@/composables/useFathom';

import { TOKENS } from '@/constants/tokens';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import useFarm from '@/composables/farms/useFarm';
import useApprovalRequiredQuery from '@/composables/queries/useApprovalRequiredQuery';
import { getAddress } from '@ethersproject/address';
import { BigNumber } from 'bignumber.js';
import useEthers from '@/composables/useEthers';

type DataProps = {
  depositForm: FormRef;
  loading: boolean;
  amount: string;
  propMax: string[];
  validInput: boolean;
  propToken: number;
};

export default defineComponent({
  name: 'FarmDepositForm',

  components: {},

  emits: ['success'],

  props: {
    farm: { type: Object as PropType<Farm>, required: true },
    pool: { type: Object as PropType<FullPool> }
  },

  setup(props: { pool?: FullPool; farm: Farm; farmUser?: FarmUser }, { emit }) {
    const data = reactive<DataProps>({
      depositForm: {} as FormRef,
      loading: false,
      amount: '',
      propMax: [],
      validInput: true,
      propToken: 0
    });

    const {
      isWalletReady,
      account,
      toggleWalletSelectModal,
      appNetworkConfig
    } = useWeb3();
    const { fNum } = useNumbers();
    const { t } = useI18n();
    const { tokens, balanceFor } = useTokens();
    const { trackGoal, Goals } = useFathom();
    const { amount } = toRefs(data);
    const depositing = ref(false);
    const approving = ref(false);

    const { approve, deposit } = useFarm(toRef(props, 'farm'));

    const approvalRequiredQuery = useApprovalRequiredQuery(props.farm.pair);
    const bptBalance = computed(() => balanceFor(getAddress(props.farm.pair)));
    const approvalRequired = computed(() => approvalRequiredQuery.data.value);
    const { txListener } = useEthers();

    function amountRules() {
      return isWalletReady.value
        ? [
            isPositive(),
            isLessThanOrEqualTo(Number(bptBalance.value), t('exceedsBalance'))
          ]
        : [isPositive()];
    }

    async function approveToken(): Promise<void> {
      if (!data.depositForm.validate()) return;

      approving.value = true;
      const tx = await approve();

      if (!tx) {
        approving.value = false;
        return;
      }

      txListener(tx, {
        onTxConfirmed: async () => {
          data.amount = '';
          approving.value = false;
        },
        onTxFailed: () => {
          approving.value = false;
        }
      });
    }

    async function submit(): Promise<void> {
      if (!data.depositForm.validate()) return;

      depositing.value = true;
      const amountScaled = scale(new BigNumber(amount.value), 18);
      const tx = await deposit(amountScaled);

      if (!tx) {
        depositing.value = false;
        return;
      }

      txListener(tx, {
        onTxConfirmed: async () => {
          emit('success', tx);
          data.amount = '';
          depositing.value = false;
        },
        onTxFailed: () => {
          depositing.value = false;
        }
      });
    }

    /*watch(balances, (newBalances, oldBalances) => {
      const balancesChanged = !isEqual(newBalances, oldBalances);
      if (balancesChanged) {
        //
      }
    });*/

    watch(isWalletReady, isAuth => {
      if (!isAuth) {
        data.amount = '0';
        data.propMax = [];
      }
    });

    watch(account, () => {
      /*if (hasZeroBalance.value) {
        //
      } else {
        //
      }*/
    });

    onMounted(() => {
      /*if (hasZeroBalance.value) {
        //
      } else {
        //
      }*/
    });

    return {
      // data
      ...toRefs(data),

      approvalRequired,
      approveToken,
      depositing,
      approving,

      Goals,
      TOKENS,
      // computed
      tokens,
      appNetworkConfig,
      amountRules,
      isWalletReady,
      toggleWalletSelectModal,
      isRequired,
      // methods
      submit,
      fNum,
      trackGoal,
      bptBalance
    };
  }
});
</script>
