import { reactive, ref, Ref, computed } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/constants/queryKeys';
import { tokenService } from '@/services/token/token.service';
import { ContractAllowancesMap } from '@/services/token/concerns/allowances.concern';
import useWeb3 from '@/services/web3/useWeb3';
import useTokenLists from '../useTokenLists';
import { TokenInfoMap } from '@/types/TokenList';
import { blockSubgraphClient } from '@/services/balancer/subgraph/block-subraph.client';

/**
 * TYPES
 */
/**
 * Fetches all allowances for given tokens for each provided contract address.
 */
export default function useAverageBlockTimeQuery(
  options: UseQueryOptions<number> = {}
) {
  const queryFn = async () => {
    console.log('Fetching average block time');

    return await blockSubgraphClient.getAverageBlockTime();
  };

  const queryOptions = reactive({
    ...options
  });

  return useQuery<number>(['AverageBlockTime'], queryFn, queryOptions);
}
