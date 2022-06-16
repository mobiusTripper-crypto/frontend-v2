import { computed, reactive, Ref } from 'vue';
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
import useEthers from '@/composables/useEthers';
import ChildChainGaugeRewardHelper from '@/beethovenx/abi/ChildChainGaugeRewardHelper.json';
import useGaugeBptBalanceQuery from '@/beethovenx/composables/gauge/useGaugeBptBalanceQuery';
import useGaugeUserBalancesQuery from '@/beethovenx/composables/gauge/useGaugeUserBalancesQuery';
import { getAddress } from '@ethersproject/address';
import { formatFixed } from '@ethersproject/bignumber';

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
  const {
    data: gaugeUserBalance,
    refetch: gaugeUserBalanceReftech
  } = useGaugeUserBalanceQuery(pool.value.gauge?.address || null);
  const {
    data: gaugeBptBalance,
    refetch: gaugeBptBalanceRefetch
  } = useGaugeBptBalanceQuery(
    pool.value.address,
    pool.value.gauge?.address || null
  );

  const bptPrice = computed(() => {
    return (
      parseFloat(pool.value.totalLiquidity) / parseFloat(pool.value.totalShares)
    );
  });

  const gaugeUserBalanceUsd = computed(() => {
    return bptPrice.value * parseFloat(gaugeUserBalance.value || '0');
  });

  const gaugeBptBalanceUsd = computed(() => {
    return bptPrice.value * parseFloat(gaugeBptBalance.value || '0');
  });

  const { priceFor } = useTokens();
  const { txListener } = useEthers();

  const {
    isLoading: isPendingRewardsLoading,
    data: pendingRewards,
    refetch
  } = useQuery(
    QUERY_KEYS.Rewards.GetRewards(pool.value.id),
    getPendingRewards,
    reactive({
      enabled: !!pool.value.gauge,
      refetchInterval: 5000
    })
  );

  async function approve() {
    try {
      const provider = getProvider();
      const tx = await erc20ContractService.erc20.approveToken(
        provider,
        pool.value.gauge?.address || '',
        pool.value.address
      );

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'approve',
        summary: `Approve LP token`,
        details: {
          contractAddress: pool.value.address,
          spender: pool.value.gauge?.address || ''
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
          spender: pool.value.gauge?.address || ''
        }
      });

      txListener(tx, {
        onTxConfirmed: async () => {
          await gaugeBptBalanceRefetch.value();
          await gaugeUserBalanceReftech.value();
        },
        onTxFailed: () => {
          //
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
      pool.value.gauge?.address || '',
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

      txListener(tx, {
        onTxConfirmed: async () => {
          await refetch.value();
        },
        onTxFailed: () => {
          //
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
      appNetworkConfig.addresses.gaugeRewardHelper,
      ChildChainGaugeRewardHelper,
      'claimRewards',
      [pool.value.gauge?.address || '', account.value]
    );
  }

  async function withdrawAndHarvest(amount: BigNumber) {
    try {
      const tx = await getWithdrawTransaction(amount.toString());
      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'claim',
        summary: 'Withdraw staked LP tokens',
        details: {
          contractAddress: pool.value.address,
          spender: pool.value.gauge?.address || ''
        }
      });

      txListener(tx, {
        onTxConfirmed: async () => {
          await gaugeBptBalanceRefetch.value();
          await gaugeUserBalanceReftech.value();
        },
        onTxFailed: () => {
          //
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
      pool.value.gauge?.address || '',
      GAUGE_CONTRACT_ABI,
      'withdraw(uint256,bool)',
      [amount.toString(), true]
    );
  }

  const gaugeUser = computed(() => {
    return gaugeUserQuery.data.value;
  });

  async function getPendingRewards() {
    const provider = getProvider();
    const multicaller = new Multicaller(
      configService.network.key,
      provider,
      ChildChainGaugeRewardHelper
    );

    pool.value.gauge?.rewardTokens.map(rewardToken => {
      multicaller.call(
        `${pool.value.gauge?.address}.claimableRewards.${rewardToken.address}`,
        appNetworkConfig.addresses.gaugeRewardHelper,
        'pendingRewards',
        [pool.value.gauge?.address, account.value, rewardToken.address]
      );
    });

    const gaugesDataMap = await multicaller.execute();

    let balanceUSD = 0;
    const rewards = pool.value.gauge?.rewardTokens
      .map(rewardToken => {
        const balance = formatUnits(
          gaugesDataMap[pool.value.gauge?.address || '']?.claimableRewards[
            rewardToken.address
          ],
          rewardToken.decimals
        );

        if (parseFloat(balance) > 0) {
          balanceUSD +=
            parseFloat(balance) * priceFor(getAddress(rewardToken.address));

          return {
            symbol: rewardToken.symbol,
            balance: balance
          };
        }
      })
      .filter(item => item != undefined);
    return { rewards: rewards, balanceUSD: balanceUSD };
  }

  const hasPendingRewards = computed(
    () => pendingRewards.value?.balanceUSD != 0
  );

  return {
    approve,
    deposit,
    harvest,
    withdrawAndHarvest,
    gaugeUser,
    pendingRewards,
    hasPendingRewards,
    isPendingRewardsLoading,
    gaugeUserBalance,
    gaugeUserBalanceUsd,
    gaugeBptBalance,
    gaugeBptBalanceUsd
  };
}
