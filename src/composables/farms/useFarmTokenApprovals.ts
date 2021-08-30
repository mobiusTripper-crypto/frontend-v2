import { ref, Ref } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';
import useEthers from '@/composables/useEthers';
import useTransactions from '../useTransactions';
import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { default as erc20Abi, default as abi } from '@/lib/abi/ERC20.json';
import { MaxUint256 } from '@ethersproject/constants';
import { configService } from '@/services/config/config.service';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { rpcProviderService as _rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { bnum } from '@/lib/utils';
import { erc20ContractService } from '@/services/erc20/erc20-contracts.service';
import { tokenService } from '@/services/token/token.service';
import useTokens from '@/composables/useTokens';

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
  const { getProvider, appNetworkConfig, account } = useWeb3();
  const { txListener } = useEthers();
  const { addTransaction } = useTransactions();

  const requiresAllowance = async () => {
    // const result = await multicaller
    //   .call('allowance', tokenAddress, 'allowance', [
    //     account.value,
    //     configService.network.addresses.masterChef
    //   ])
    //   .execute();
    const allowance = await erc20ContractService.erc20.allowance(
      tokenAddress,
      account.value,
      configService.network.addresses.masterChef || ''
    );
    console.log('Allowance', allowance);
    // const allowance = await call(_rpcProviderService, erc20Abi, [
    //   tokenAddress,
    //   'allowance',
    //   [ account, configService.network.addresses.masterChef]
    // ]);

    if (!amount || bnum(amount.value).eq(0)) return false;
    return allowance.lt(amount.value);
  };

  /**
   * METHODS
   */

  // console.log('REUIRED allowances', requiredAllowances);
  async function approveAllowance(): Promise<void> {
    try {
      approving.value = true;

      const tx = await erc20ContractService.erc20.approveToken(
        getProvider(),
        appNetworkConfig.addresses.masterChef || '',
        tokenAddress,
        amount.value
      );

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'approve',
        summary: `Approve for farming`,
        details: {
          contractAddress: tokenAddress,
          spender: appNetworkConfig.addresses.masterChef
        }
      });

      txListener(tx, {
        onTxConfirmed: async () => {
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
    requiresAllowance,
    // methods
    approveAllowance
  };
}
