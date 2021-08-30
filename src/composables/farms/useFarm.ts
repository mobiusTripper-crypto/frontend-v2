import { ref, Ref } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';
import useEthers from '@/composables/useEthers';
import useTransactions from '../useTransactions';
import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { default as abi } from '@/lib/abi/ERC20.json';
import { MaxUint256 } from '@ethersproject/constants';
import { bnum } from '@/lib/utils';
import { erc20ContractService } from '@/services/erc20/erc20-contracts.service';
import { Farm } from '@/services/balancer/subgraph/types';
import { masterChefContractsService } from '@/services/farm/master-chef-contracts.service';

export async function approveToken(
  web3: Web3Provider,
  spender: string,
  token: string,
  amount: string
): Promise<TransactionResponse> {
  return sendTransaction(web3, token, abi, 'approve', [spender, amount]);
}

export default function useFarm(farm: Ref<Farm> | Ref<undefined>) {
  const { getProvider, appNetworkConfig, account } = useWeb3();
  const { txListener } = useEthers();
  const { addTransaction } = useTransactions();

  const approving = ref(false);
  const approvedAll = ref(false);
  const provider = getProvider();
  const tokenAddress = farm.value?.pair || '';
  const farmId = farm.value?.id || '';

  async function requiresApproval(
    amount: Ref<string> = ref(MaxUint256.toString())
  ) {
    const allowance = await erc20ContractService.erc20.allowance(
      tokenAddress,
      account.value,
      appNetworkConfig.addresses.masterChef
    );

    if (!amount || bnum(amount.value).eq(0)) return false;

    return allowance.lt(amount.value);
  }

  async function approveAllowance(
    amount: Ref<string> = ref(MaxUint256.toString())
  ): Promise<void> {
    try {
      approving.value = true;

      const tx = await erc20ContractService.erc20.approveToken(
        provider,
        appNetworkConfig.addresses.masterChef,
        tokenAddress,
        amount.value
      );

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'approve',
        summary: `Approve LP token`,
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

  async function checkAllowanceAndApprove() {
    if (await requiresApproval()) {
      await approveAllowance();
    }
  }

  async function deposit(amount: Ref<string> = ref(MaxUint256.toString())) {
    const tx = await masterChefContractsService.masterChef.deposit(
      provider,
      farmId,
      amount.value,
      account.value
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'invest',
      summary: 'Deposit LP tokens into farm',
      details: {
        contractAddress: tokenAddress,
        spender: appNetworkConfig.addresses.masterChef
      }
    });
  }

  async function harvest() {
    const tx = await masterChefContractsService.masterChef.harvest(
      provider,
      farmId,
      account.value
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'claim',
      summary: 'Harvest farm rewards',
      details: {
        contractAddress: tokenAddress,
        spender: appNetworkConfig.addresses.masterChef
      }
    });
  }

  async function withdrawAndHarvest(
    amount: Ref<string> = ref(MaxUint256.toString())
  ) {
    const tx = await masterChefContractsService.masterChef.withdrawAndHarvest(
      provider,
      farmId,
      amount.value,
      account.value
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'claim',
      summary: 'Withdraw LP tokens',
      details: {
        contractAddress: tokenAddress,
        spender: appNetworkConfig.addresses.masterChef
      }
    });
  }

  return {
    approving,
    approvedAll,
    requiresApproval,
    approveAllowance,
    checkAllowanceAndApprove,
    deposit,
    harvest,
    withdrawAndHarvest
  };
}
