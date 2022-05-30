import { ref, Ref } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';
import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { default as abi } from '@/lib/abi/ERC20.json';
import { MaxUint256 } from '@ethersproject/constants';
import { bnum } from '@/lib/utils';
import BigNumber from 'bignumber.js';
import { masterChefContractsService } from '@/beethovenx/services/farm/master-chef-contracts.service';
//import { DecoratedPoolWithRequiredFarm } from '@/beethovenx/services/subgraph/subgraph-types';
import useTransactions from '@/composables/useTransactions';
import { erc20ContractService } from '@/beethovenx/services/erc20/erc20-contracts.service';
import REWARDER_CONTRACT_ABI from '@/beethovenx/abi/LiquidityGaugeV5.json';

export async function approveToken(
  web3: Web3Provider,
  spender: string,
  token: string,
  amount: string
): Promise<TransactionResponse> {
  return sendTransaction(web3, token, abi, 'approve', [spender, amount]);
}

export default function useGauge(
  tokenAddress: Ref<string>,
  gaugeAddress: Ref<string>
) {
  const { getProvider, appNetworkConfig, account } = useWeb3();
  const { addTransaction } = useTransactions();

  // async function requiresApproval(
  //   amount: Ref<string> = ref(MaxUint256.toString())
  // ) {
  //   const allowance = await erc20ContractService.erc20.allowance(
  //     tokenAddress.value,
  //     account.value,
  //     appNetworkConfig.addresses.masterChef
  //   );

  //   if (!amount || bnum(amount.value).eq(0)) return false;

  //   return allowance.lt(amount.value);
  // }

  async function approve() {
    console.log('pre approval', gaugeAddress.value, tokenAddress.value);
    try {
      const provider = getProvider();
      const tx = await erc20ContractService.erc20.approveToken(
        provider,
        gaugeAddress.value,
        tokenAddress.value
      );

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'approve',
        summary: `Approve LP token`,
        details: {
          contractAddress: tokenAddress,
          spender: gaugeAddress
        }
      });

      return tx;
    } catch (error) {
      console.error(error);
    }
  }

  // async function checkAllowanceAndApprove() {
  //   if (await requiresApproval()) {
  //     await approve();
  //   }
  // }

  async function deposit(amount: BigNumber) {
    try {
      const tx = await getDepositTransaction(amount.toString());

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'invest',
        summary: 'Deposit LP tokens',
        details: {
          contractAddress: tokenAddress,
          spender: gaugeAddress
        }
      });

      return tx;
    } catch (error) {
      console.error(error);
    }
  }

  async function getDepositTransaction(amount: string | number) {
    const provider = getProvider();
    return sendTransaction(
      provider,
      gaugeAddress.value,
      REWARDER_CONTRACT_ABI,
      'deposit(uint256)',
      [amount.toString()]
    );
  }

  async function harvest() {
    try {
      const provider = getProvider();
      const tx = await masterChefContractsService.masterChef.harvest(
        provider,
        gaugeAddress.value,
        account.value
      );

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'claim',
        summary: 'Harvest staked rewards',
        details: {
          contractAddress: tokenAddress,
          spender: appNetworkConfig.addresses.masterChef
        }
      });

      return tx;
    } catch (error) {
      console.error(error);
    }
  }

  async function withdrawAndHarvest(amount: BigNumber) {
    try {
      const tx = await getWithdrawTransaction(amount.toString());
      console.log(tx);
      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'claim',
        summary: 'Withdraw staked LP tokens',
        details: {
          contractAddress: tokenAddress,
          spender: appNetworkConfig.addresses.masterChef
        }
      });

      return tx;
    } catch (error) {
      console.error(error);
    }
  }

  async function getWithdrawTransaction(amount: string | number) {
    const provider = getProvider();
    return sendTransaction(
      provider,
      gaugeAddress.value,
      REWARDER_CONTRACT_ABI,
      'withdraw(uint256,bool)',
      [amount.toString(), true]
    );
  }

  return {
    //    requiresApproval,
    approve,
    //    checkAllowanceAndApprove,
    deposit,
    harvest,
    withdrawAndHarvest
  };
}
