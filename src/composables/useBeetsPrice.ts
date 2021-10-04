import usePoolQuery from '@/composables/queries/usePoolQuery';
import { configService } from '@/services/config/config.service';
import { computed } from 'vue';

export default function useBeetsPrice() {
  const beetsReferencePricePoolQuery = usePoolQuery(
    configService.network.addresses.beetsUsdcReferencePricePool
  );
  const beetsReferencePool = computed(
    () => beetsReferencePricePoolQuery.data.value
  );

  if (!beetsReferencePool.value) {
    return 0;
  }
  const tokens = beetsReferencePool.value.tokens;
  const beets = tokens?.find(
    token =>
      token.address.toLowerCase() === configService.network.addresses.beets
  );
  const usdc = tokens?.find(
    token =>
      token.address.toLowerCase() === configService.network.addresses.usdc
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
