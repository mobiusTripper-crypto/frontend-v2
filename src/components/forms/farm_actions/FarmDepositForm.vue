<template>
  <BalForm ref="depositForm" @on-submit="submit">
    <div class="px-4 pt-6 border-b dark:border-gray-900">
      <!--      <BalTextInput
        name="Deposit"
        :rules="amountRules()"
        type="number"
        min="0"
        step="any"
        placeholder="0"
        validate-on="input"
        prepend-border
        append-shadow
      >
        <template v-slot:prepend>
          <div class="flex items-center h-full w-24"></div>
        </template>
        <template v-slot:info>
          <div
            class="cursor-pointer"
            @click.prevent="amounts[i] = tokenBalance(i).toString()"
          >
            {{ $t('balance') }}: {{ formatBalance(i) }}
          </div>
        </template>
        <template v-slot:append>
          <div class="p-2">
            <BalBtn
              size="xs"
              color="white"
              @click.prevent="amounts[i] = tokenBalance(i).toString()"
            >
              {{ $t('max') }}
            </BalBtn>
          </div>
        </template>
      </BalTextInput>-->
      <BalTextInput
        v-model="modelValue"
        v-bind="args"
        type="number"
        min="0"
        step="any"
        placeholder="0"
        validate-on="input"
        prepend-border
        append-shadow
      >
        <template v-slot:info>
          <div class="cursor-pointer">
            {{ $t('balance') }}: {{ '1234.232' }}
          </div>
        </template>
        <template v-slot:append>
          <div class="p-2">
            <BalBtn size="xs" color="white">
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
          v-if="requireApproval"
          :label="`${$t('approve')}`"
          :loading="approving"
          :loading-label="$t('approving')"
          :disabled="!hasAmounts || !hasValidInputs"
          block
          @click.prevent="approveAllowance"
        />
        <template v-else>
          <BalBtn
            type="submit"
            :loading-label="$t('confirming')"
            color="gradient"
            :disabled="!hasAmounts || !hasValidInputs"
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
  toRef,
  toRefs,
  watch
} from 'vue';
import { FormRef } from '@/types';
import { isPositive, isRequired } from '@/lib/utils/validations';
import { useI18n } from 'vue-i18n';
import { formatUnits } from '@ethersproject/units';
import isEqual from 'lodash/isEqual';

import useTokenApprovals from '@/composables/pools/useTokenApprovals';
import useNumbers from '@/composables/useNumbers';
import useSlippage from '@/composables/useSlippage';

import PoolExchange from '@/services/pool/exchange';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';
import { getPoolWeights } from '@/services/pool/pool.helper';
import { bnum } from '@/lib/utils';
import { Farm, FullPool } from '@/services/balancer/subgraph/types';
import useFathom from '@/composables/useFathom';

import { TOKENS } from '@/constants/tokens';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import useEthers from '@/composables/useEthers';
import useTransactions from '@/composables/useTransactions';
import { usePool } from '@/composables/usePool';
import useFarmTokenApprovals from '@/composables/farms/useFarmTokenApprovals';

export enum FormTypes {
  proportional = 'proportional',
  custom = 'custom'
}

type DataProps = {
  investForm: FormRef;
  investType: FormTypes;
  loading: boolean;
  amount: string;
  propMax: string[];
  validInputs: boolean[];
  propToken: number;
  range: number;
  highPiAccepted: boolean;
};

export default defineComponent({
  name: 'FarmDepositForm',

  components: {},

  emits: ['success'],

  props: {
    farm: { type: Object as PropType<Farm>, required: true },
    pool: { type: Object as PropType<FullPool>, required: true }
  },

  setup(props: { pool: FullPool; farm: Farm }, { emit }) {
    const data = reactive<DataProps>({
      investForm: {} as FormRef,
      investType: FormTypes.proportional,
      loading: false,
      amount: '0',
      propMax: [],
      validInputs: [],
      propToken: 0,
      range: 1000,
      highPiAccepted: false
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
    const { tokens, balances: allBalances } = useTokens();
    const { trackGoal, Goals } = useFathom();
    const { txListener } = useEthers();
    const { addTransaction } = useTransactions();
    const { isStableLikePool, isWethPool, isWstETHPool } = usePool(
      toRef(props, 'pool')
    );

    const { amount } = toRefs(data);

    const {
      requiresAllowance,
      approveAllowance,
      approving,
      approvedAll
    } = useFarmTokenApprovals(props.farm.pair, amount);

    // SERVICES
    const poolExchange = computed(
      () => new PoolExchange(props.pool, appNetworkConfig.key, tokens.value)
    );

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

    const hasValidInputs = computed(() => {
      return data.validInputs.every(validInput => validInput === true);
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
      return requiresAllowance();
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
      if (!data.investForm.validate()) return;
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

    watch(
      () => data.investType,
      newType => {
        if (newType === FormTypes.proportional) {
          setPropMax();
        }
      }
    );

    watch(
      () => data.range,
      newVal => {
        setPropAmountsFor(newVal);
      }
    );

    watch(isWalletReady, isAuth => {
      if (!isAuth) {
        data.amount = '0';
        data.propMax = [];
      }
    });

    watch(account, () => {
      if (hasZeroBalance.value) {
        data.investType = FormTypes.custom;
      } else {
        setPropMax();
      }
    });

    onMounted(() => {
      if (hasZeroBalance.value) {
        data.investType = FormTypes.custom;
      } else {
        setPropMax();
      }
    });

    return {
      // data
      ...toRefs(data),
      Goals,
      TOKENS,
      // computed
      tokens,
      appNetworkConfig,
      hasValidInputs,
      hasAmounts,
      approving,
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
      isWethPool,
      isWstETHPool,
      isStableLikePool,
      // methods
      submit,
      approveAllowance,
      fNum,
      trackGoal,
      tokenDecimals,
      modelValue: ''
    };
  }
});
</script>
