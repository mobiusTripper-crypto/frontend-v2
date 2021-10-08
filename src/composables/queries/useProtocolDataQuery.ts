import { reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/constants/queryKeys';
import useWeb3 from '@/services/web3/useWeb3';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import {
  PoolToken,
  SubgraphBalancer
} from '@/services/balancer/subgraph/types';

interface ProtocolData extends SubgraphBalancer {
  beetsPrice: number;
}

export default function useProtocolDataQuery(
  options: QueryObserverOptions<ProtocolData> = {}
) {
  const { appNetworkConfig } = useWeb3();

  const queryFn = async () => {
    const [beetsPool] = await balancerSubgraphService.pools.get({
      where: {
        id: appNetworkConfig.addresses.beetsUsdcReferencePricePool.toLowerCase(),
        totalShares_gt: -1 // Avoid the filtering for low liquidity pools
      }
    });

    if (!beetsPool) {
      throw new Error('Could not load beets reference price pool');
    }

    const balancerData = await balancerSubgraphService.balancers.get();

    return {
      ...balancerData,
      beetsPrice: calculateBeetsPrice(
        beetsPool.tokens,
        appNetworkConfig.addresses.beets,
        appNetworkConfig.addresses.usdc
      )
    };
  };

  const queryOptions = reactive({
    enabled: true,
    ...options
  });

  return useQuery<ProtocolData>(
    QUERY_KEYS.ProtocolData.All,
    queryFn,
    queryOptions
  );
}

function calculateBeetsPrice(
  tokens: PoolToken[],
  beetsAddress: string,
  usdcAddress: string
) {
  const beets = tokens.find(
    token => token.address.toLowerCase() === beetsAddress.toLowerCase()
  );
  const usdc = tokens.find(
    token => token.address.toLowerCase() === usdcAddress.toLowerCase()
  );

  if (!beets || !usdc) {
    return 0;
  }

  return (
    ((parseFloat(beets.weight) / parseFloat(usdc.weight)) *
      parseFloat(usdc.balance)) /
    parseFloat(beets.balance)
  );
}
