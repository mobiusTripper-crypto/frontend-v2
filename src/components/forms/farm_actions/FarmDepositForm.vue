<template>
  <BalForm ref="depositForm" @on-submit="submit">
    <div class="px-4 pt-6 border-b dark:border-gray-900">
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
          <div class="cursor-pointer" @click.prevent="amount = lpBalance">
            {{ $t('balance') }}:
            {{ lpBalance }}
          </div>
        </template>
        <template v-slot:append>
          <div class="p-2">
            <BalBtn size="xs" color="white" @click.prevent="amount = lpBalance">
              {{ $t('max') }}
            </BalBtn>
          </div>
        </template>
      </BalTextInput>
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
          :disabled="!validInput || amount === '0' || amount === ''"
          block
          @click.prevent="approveAllowance"
        />
        <template v-else>
          <BalBtn
            type="submit"
            :loading-label="$t('confirming')"
            color="gradient"
            :disabled="!validInput || amount === '0'"
            :loading="loading"
            block
            @click="trackGoal(Goals.ClickInvest)"
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
import { isPositive, isRequired } from '@/lib/utils/validations';
import { useI18n } from 'vue-i18n';
import { formatUnits } from '@ethersproject/units';
import isEqual from 'lodash/isEqual';

import useNumbers from '@/composables/useNumbers';
import useSlippage from '@/composables/useSlippage';

import PoolExchange from '@/services/pool/exchange';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';
import { getPoolWeights } from '@/services/pool/pool.helper';
import { bnum } from '@/lib/utils';
import { Farm, FarmUser, FullPool } from '@/services/balancer/subgraph/types';
import useFathom from '@/composables/useFathom';

import { TOKENS } from '@/constants/tokens';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import useEthers from '@/composables/useEthers';
import useTransactions from '@/composables/useTransactions';
import useFarm from '@/composables/farms/useFarm';
import useFarmUserQuery from '@/composables/queries/useFarmUserQuery';
import useBalancesQuery from '@/composables/queries/useBalancesQuery';
import useBalanceQuery from '@/composables/queries/useBalanceQuery';
import useApprovalRequiredQuery from '@/composables/queries/useApprovalRequiredQuery';

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
    pool: { type: Object as PropType<FullPool>, required: true }
  },

  setup(props: { pool: FullPool; farm: Farm; farmUser?: FarmUser }, { emit }) {
    const data = reactive<DataProps>({
      depositForm: {} as FormRef,
      loading: false,
      amount: '0',
      propMax: [],
      validInput: true,
      propToken: 0
    });

    // COMPOSABLES
    const {
      isWalletReady,
      account,
      toggleWalletSelectModal,
      getProvider,
      appNetworkConfig
    } = useWeb3();
    const { fNum, toFiat } = useNumbers();
    const { t } = useI18n();
    const { minusSlippage } = useSlippage();
    const { tokens, balances: allBalances, balanceFor } = useTokens();
    const { trackGoal, Goals } = useFathom();
    const { txListener } = useEthers();
    const { addTransaction } = useTransactions();
    const { amount } = toRefs(data);

    const {
      requiresApproval,
      approveAllowance,
      approving,
      approvedAll,
      checkAllowanceAndApprove,
      deposit
    } = useFarm(toRef(props, 'farm'));

    const farmUserQuery = useFarmUserQuery(props.farm.id);
    const balanceQuery = useBalanceQuery(props.farm.pair);
    const approvalRequiredQuery = useApprovalRequiredQuery(props.farm.pair);

    // SERVICES
    const poolExchange = computed(
      () => new PoolExchange(props.pool, appNetworkConfig.key, tokens.value)
    );
    const lpBalance = computed(() => {
      const value = balanceQuery.data.value;
      return value ? `${Number(parseInt(value) / 1e18)}` : '0';
    });
    const approvalRequired = computed(() => approvalRequiredQuery.data.value);

    const farmUser = computed(() => {
      return farmUserQuery.data.value;
    });
    const poolCalculator = new PoolCalculator(
      props.pool,
      tokens.value,
      allBalances,
      'join'
    );

    // COMPUTED
    const tokenWeights = computed(() =>
      Object.values(props.pool.onchain.tokens).map(t => t.weight)
    );

    const hasAmounts = computed(() => {
      const amountSum = fullAmounts.value
        .map(amount => parseFloat(amount))
        .reduce((a, b) => a + b, 0);
      return amountSum > 0;
    });

    const balances = computed(() => {
      return props.pool.tokenAddresses.map(
        token => allBalances.value[token] || '0'
      );
    });

    const hasZeroBalance = computed(() => {
      return balances.value.map(b => Number(b)).includes(0);
    });

    const total = computed(() => {
      const total = props.pool.tokenAddresses
        .map((_, i) => amountUSD(i))
        .reduce((a, b) => a + b, 0);

      if (total < 0) return fNum(0, 'usd');
      return fNum(total, 'usd');
    });

    const requireApproval = computed(() => {
      if (!hasAmounts.value) return false;
      if (approvedAll.value) return false;

      return false;
    });

    const fullAmounts = computed(() => {
      return props.pool.tokenAddresses.map((_, i) => {
        return data.amount;
      });
    });

    const minBptOut = computed(() => {
      let bptOut = poolCalculator
        .exactTokensInForBPTOut(fullAmounts.value)
        .toString();
      bptOut = formatUnits(bptOut, props.pool.onchain.decimals);
      console.log(bptOut, `TS EVM _exactTokensInForBPTOut`);

      return minusSlippage(bptOut, props.pool.onchain.decimals);
    });

    // METHODS
    function tokenBalance(index: number): string {
      return balances.value[index] || '0';
    }

    function tokenDecimals(index) {
      return tokens.value[props.pool.tokenAddresses[index]].decimals;
    }

    function amountUSD(index) {
      const amount = fullAmounts.value[index] || 0;
      return toFiat(amount, props.pool.tokenAddresses[index]);
    }

    function formatBalance(index) {
      return fNum(tokenBalance(index), 'token');
    }

    function amountRules() {
      /*
      return isWalletReady.value
        ? [
            isPositive(),
            isLessThanOrEqualTo(
              Number(tokenBalance(index)),
              t('exceedsBalance')
            )
          ]
        : [isPositive()];
       */

      return [isPositive()];
    }

    async function setPropMax() {
      const { send, fixedToken } = poolCalculator.propMax();
      data.propMax = [...send];
      data.propToken = fixedToken;
    }

    function setPropAmountsFor(range) {
      const fractionBasisPoints = (range / 1000) * 10000;
      const amount = bnum(balances.value[data.propToken])
        .times(fractionBasisPoints)
        .div(10000)
        .toFixed(tokenDecimals(data.propToken));

      // const { send } = poolCalculator.propAmountsGiven(
      //   amount,
      //   data.propToken,
      //   'send'
      // );
      data.amount = amount;
    }

    async function submit(): Promise<void> {
      if (!data.depositForm.validate()) return;
      try {
        data.loading = true;
        const tx = await poolExchange.value.join(
          getProvider(),
          account.value,
          fullAmounts.value,
          minBptOut.value
        );
        console.log('Receipt', tx);

        addTransaction({
          id: tx.hash,
          type: 'tx',
          action: 'invest',
          summary: t('transactionSummary.investInPool', [
            total.value,
            getPoolWeights(props.pool)
          ]),
          details: {
            total,
            pool: props.pool
          }
        });

        txListener(tx, {
          onTxConfirmed: async (tx: TransactionResponse) => {
            emit('success', tx);
            data.amount = '0';
            data.loading = false;
            setPropMax();
          },
          onTxFailed: () => {
            data.loading = false;
          }
        });
      } catch (error) {
        console.error(error);
        data.loading = false;
      }
    }

    watch(tokens, newTokens => {
      poolCalculator.setAllTokens(newTokens);
    });

    watch(
      () => props.pool.onchain.tokens,
      (newTokens, oldTokens) => {
        poolCalculator.setPool(props.pool);
        const tokensChanged = !isEqual(newTokens, oldTokens);
        if (tokensChanged) {
          setPropMax();
        }
      }
    );

    watch(balances, (newBalances, oldBalances) => {
      const balancesChanged = !isEqual(newBalances, oldBalances);
      if (balancesChanged) {
        setPropMax();
      }
    });

    watch(isWalletReady, isAuth => {
      if (!isAuth) {
        data.amount = '0';
        data.propMax = [];
      }
    });

    watch(account, () => {
      if (hasZeroBalance.value) {
        //
      } else {
        setPropMax();
      }
    });

    watch(ref(props.farmUser), () => {
      console.log('watching farm user', props.farmUser);
    });

    onMounted(() => {
      if (hasZeroBalance.value) {
        //
      } else {
        setPropMax();
      }
    });

    return {
      // data
      ...toRefs(data),

      approving: false,
      approvalRequired,

      Goals,
      TOKENS,
      // computed
      tokens,
      appNetworkConfig,
      hasAmounts,
      requireApproval,
      tokenWeights,
      tokenBalance,
      amountRules,
      total,
      isWalletReady,
      toggleWalletSelectModal,
      formatBalance,
      amountUSD,
      isRequired,
      hasZeroBalance,
      // methods
      submit,
      approveAllowance,
      fNum,
      trackGoal,
      tokenDecimals,
      farmUser,
      lpBalance,
      modelValue: ''
    };
  }
});
</script>
