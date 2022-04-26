import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import useApp from '@/composables/useApp';
import useWeb3 from '@/services/web3/useWeb3';
import { beethovenxService } from '@/beethovenx/services/beethovenx/beethovenx.service';
import { GqlLockingUser } from '@/beethovenx/services/beethovenx/beethovenx-types';
import BigNumber from 'bignumber.js';
import { governanceContractsService } from '@/beethovenx/services/governance/governance-contracts.service';

interface QueryResponse {
  gqlData: { lockingUser: GqlLockingUser; lockingUserVotingPower: number };
  fBeetsData: {
    allowance: BigNumber;
  };
}

export default function useLockUserQuery() {
  const { appLoading } = useApp();
  const { isWalletReady, account } = useWeb3();
  const queryKey = reactive(QUERY_KEYS.Lock.User(account));
  const enabled = computed(() => !appLoading.value && isWalletReady.value);

  const queryFn = async () => {
    const gqlData = await beethovenxService.getLockUserData(account.value);
    const fBeetsData = await governanceContractsService.fbeets.getData(
      account.value
    );

    return {
      gqlData,
      fBeetsData: {
        allowance: new BigNumber(fBeetsData.allowance.toString())
      }
    };
  };

  const queryOptions = reactive({
    enabled
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
