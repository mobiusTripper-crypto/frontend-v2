import useWeb3 from '@/services/web3/useWeb3';
import { erc20ContractService } from '@/beethovenx/services/erc20/erc20-contracts.service';
import useLockUserQuery from '@/beethovenx/composables/lock/useLockUserQuery';
import { computed } from 'vue';
import useTransactions from '@/composables/useTransactions';
import BigNumber from 'bignumber.js';
import { lockContractsService } from '@/beethovenx/services/lock/lock-contracts.service';

function bn(num: number | string) {
  return new BigNumber(num);
}

export function useLockUser() {
  const { getProvider } = useWeb3();
  const { addTransaction } = useTransactions();
  const lockUserQuery = useLockUserQuery();
  const { isLoading, data, refetch } = lockUserQuery;

  const lockUserDataLoading = computed(() => isLoading.value);

  const totalLockedAmount = computed(
    () => data.value?.gqlData.lockingUser.totalLockedAmount
  );
  const totalLockedAmountUsd = computed(
    () => data.value?.gqlData.lockingUser.totalLockedAmountUsd
  );
  const totalUnlockedAmount = computed(
    () => data.value?.gqlData.lockingUser.totalUnlockedAmount
  );
  const totalUnlockedAmountUsd = computed(
    () => data.value?.gqlData.lockingUser.totalUnlockedAmountUsd
  );
  const lockingUserVotingPower = computed(
    () => data.value?.gqlData.lockingUserVotingPower
  );
  const lockedToVotingPowerRatio = computed(
    () => data.value?.gqlData.lockingUser.lockedToVotingPowerRatio
  );
  const lockingPeriods = computed(
    () => data.value?.gqlData.lockingUser.lockingPeriods
  );

  const userAllowance = computed(
    () => data.value?.fBeetsData.allowance.div(1e18) ?? bn(0)
  );

  async function approve(amount?: string) {
    const tx = await erc20ContractService.erc20.approveToken(
      getProvider(),
      lockContractsService.lock.lockAddress,
      lockContractsService.lock.fbeetsAddress,
      amount
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'approve',
      summary: `Approve token`,
      details: {
        contractAddress: lockContractsService.lock.lockAddress,
        spender: lockContractsService.lock.fbeetsAddress
      }
    });

    return tx;
  }

  async function lock(amount: string, account: string) {
    const tx = await lockContractsService.lock.lock(
      getProvider(),
      amount,
      account
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'lock',
      summary: 'Lock fBEETS',
      details: {
        contractAddress: lockContractsService.lock.lockAddress,
        spender: lockContractsService.lock.fbeetsAddress
      }
    });

    return tx;
  }

  async function relock() {
    const tx = await lockContractsService.lock.relock(getProvider());

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'lock',
      summary: 'Locking fBEETS',
      details: {
        contractAddress: lockContractsService.lock.lockAddress,
        spender: lockContractsService.lock.fbeetsAddress
      }
    });

    return tx;
  }

  async function withdraw() {
    const tx = await lockContractsService.lock.withdraw(getProvider());

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'withdraw',
      summary: 'Withdrawing fBEETS',
      details: {
        contractAddress: lockContractsService.lock.lockAddress,
        spender: lockContractsService.lock.fbeetsAddress
      }
    });

    return tx;
  }

  async function getReward() {
    try {
      const provider = getProvider();
      const tx = await lockContractsService.lock.getReward(provider);

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'getReward',
        summary: 'Get lock rewards',
        details: {
          contractAddress: lockContractsService.lock.lockAddress,
          spender: lockContractsService.lock.lockAddress
        }
      });

      return tx;
    } catch (error) {
      console.error(error);
    }
  }

  return {
    lockUserDataLoading,
    totalLockedAmount,
    totalLockedAmountUsd,
    totalUnlockedAmount,
    totalUnlockedAmountUsd,
    lockingUserVotingPower,
    userAllowance,
    lockedToVotingPowerRatio,
    lockingPeriods,
    refetch,
    lockUserQuery,
    approve,
    lock,
    relock,
    withdraw,
    getReward
  };
}
