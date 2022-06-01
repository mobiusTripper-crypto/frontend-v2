import { computed, Ref, reactive } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';
import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { default as abi } from '@/lib/abi/ERC20.json';
import { bnum } from '@/lib/utils';
import BigNumber from 'bignumber.js';
import useTransactions from '@/composables/useTransactions';
import { erc20ContractService } from '@/beethovenx/services/erc20/erc20-contracts.service';
import GAUGE_CONTRACT_ABI from '@/beethovenx/abi/LiquidityGaugeV5.json';
import { FullPool } from '@/services/balancer/subgraph/types';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { configService } from '@/services/config/config.service';
import useGaugeUserQuery from '@/beethovenx/composables/gauge/useGaugeUserQuery';
import { formatUnits } from 'ethers/lib/utils';
import { useQuery } from 'vue-query';
import QUERY_KEYS from '@/constants/queryKeys';
import useTokens from '@/composables/useTokens';
import useGaugeUserBalanceQuery from '@/beethovenx/composables/gauge/useGaugeUserBalanceQuery';

export async function approveToken(
  web3: Web3Provider,
  spender: string,
  token: string,
  amount: string
): Promise<TransactionResponse> {
  return sendTransaction(web3, token, abi, 'approve', [spender, amount]);
}

export default function useGauge(pool: Ref<FullPool>) {
  const { getProvider, appNetworkConfig, account } = useWeb3();
  const { addTransaction } = useTransactions();
  const gaugeUserQuery = useGaugeUserQuery(pool.value.id);
  const { data: gaugeUserBalance } = useGaugeUserBalanceQuery(
    pool.value.gauge?.address
  );

  const { priceFor } = useTokens();

  async function approve() {
    try {
      const provider = getProvider();
      const tx = await erc20ContractService.erc20.approveToken(
        provider,
        pool.value.gauge.address,
        pool.value.address
      );

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'approve',
        summary: `Approve LP token`,
        details: {
          contractAddress: pool.value.address,
          spender: pool.value.gauge.address
        }
      });

      return tx;
    } catch (error) {
      console.error(error);
    }
  }

  async function deposit(amount: BigNumber) {
    try {
      const tx = await getDepositTransaction(amount.toString());

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'invest',
        summary: 'Deposit LP tokens',
        details: {
          contractAddress: pool.value.address,
          spender: pool.value.gauge.address
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
      pool.value.gauge.address,
      GAUGE_CONTRACT_ABI,
      'deposit(uint256)',
      [amount.toString()]
    );
  }

  async function harvest() {
    try {
      const tx = await getHarvestTransaction();

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'claim',
        summary: 'Harvest staked rewards',
        details: {
          contractAddress: pool.value.address
        }
      });

      return tx;
    } catch (error) {
      console.error(error);
    }
  }

  async function getHarvestTransaction() {
    const provider = getProvider();
    return sendTransaction(
      provider,
      pool.value.gauge.address,
      GAUGE_CONTRACT_ABI,
      'claim_rewards()',
      []
    );
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
          contractAddress: pool.value.address,
          spender: pool.value.gauge.address
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
      pool.value.gauge.address,
      GAUGE_CONTRACT_ABI,
      'withdraw(uint256,bool)',
      [amount.toString(), true]
    );
  }

  const gaugeUser = computed(() => {
    return gaugeUserQuery.data.value;
  });

  const { isLoading: isPendingRewardsLoading, data: pendingRewards } = useQuery(
    QUERY_KEYS.Rewards.GetRewards(pool.value.id),
    getPendingRewards,
    reactive({
      enabled: true
    })
  );

  async function getPendingRewards() {
    const provider = getProvider();
    const multicaller = new Multicaller(
      configService.network.key,
      provider,
      GAUGE_CONTRACT_ABI
    );

    pool.value.gauge.rewardTokens.map(rewardToken => {
      multicaller.call(
        `${pool.value.gauge.address}.claimableRewards.${rewardToken.address}`,
        pool.value.gauge.address,
        'claimable_reward_write',
        [account.value, rewardToken.address]
      );
    });

    const gaugesDataMap = await multicaller.execute();

    let balanceUSD = 0;
    const rewards = pool.value.gauge.rewardTokens.map(rewardToken => {
      const balance =
        gaugesDataMap[pool.value.gauge.address].claimableRewards[
          rewardToken.address
        ];
      balanceUSD += bnum(balance)
        .times(priceFor(rewardToken.address))
        .toNumber();

      //      console.log(rewardToken.address, priceFor(rewardToken.address));

      return {
        symbol: rewardToken.symbol,
        balance: formatUnits(balance, rewardToken.decimals)
      };
    });
    //    console.log(balanceUSD); //TODO, need to add reward tokens to test this
    return { rewards: rewards, balanceUSD: balanceUSD };
  }

  return {
    approve,
    deposit,
    harvest,
    withdrawAndHarvest,
    gaugeUser,
    pendingRewards,
    isPendingRewardsLoading,
    gaugeUserBalance
  };
}
