import { computed, ref, Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import useEthers from '@/composables/useEthers';
import useTransactions from '../useTransactions';
import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { default as abi } from '@/lib/abi/ERC20.json';
import { MaxUint256 } from '@ethersproject/constants';

export async function approveToken(
  web3: Web3Provider,
  spender: string,
  token: string,
  amount: string
): Promise<TransactionResponse> {
  return sendTransaction(web3, token, abi, 'approve', [spender, amount]);
}

export default function useFarmTokenApprovals(
  tokenAddress: string,
  amount: Ref<string> = ref(MaxUint256.toString())
) {
  /**
   * STATE
   */
  const approving = ref(false);
  const approvedAll = ref(false);

  /**
   * COMPOSABLES
   */
  const { getProvider, appNetworkConfig } = useWeb3();
  const { tokens, refetchAllowances, approvalsRequired } = useTokens();
  const { txListener } = useEthers();
  const { addTransaction } = useTransactions();
  const { t } = useI18n();

  /**
   * COMPUTED
   */
  const requiredAllowances = computed(() =>
    approvalsRequired([tokenAddress], [amount.value])
  );

  /**
   * METHODS
   */

  // console.log('REUIRED allowances', requiredAllowances);
  async function approveAllowances(): Promise<void> {
    try {
      approving.value = true;
      const tokenAddress = requiredAllowances.value[0];

      const txs = await approveToken(
        getProvider(),
        appNetworkConfig.addresses.masterChef || '',
        tokenAddress,
        amount.value
      );

      addTransaction({
        id: txs.hash,
        type: 'tx',
        action: 'approve',
        summary: `Approve for farming ${tokens.value[tokenAddress]?.symbol ??
          ''}`,
        details: {
          contractAddress: tokenAddress,
          spender: appNetworkConfig.addresses.masterChef
        }
      });

      txListener(txs, {
        onTxConfirmed: async () => {
          await refetchAllowances.value();
          approving.value = false;
        },
        onTxFailed: () => {
          approving.value = false;
        }
      });
    } catch (error) {
      approving.value = false;
      console.error(error);
    }
  }

  return {
    approving,
    approvedAll,
    // computed
    requiredAllowances,
    // methods
    approveAllowances
  };
}
