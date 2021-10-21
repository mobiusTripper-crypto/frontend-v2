import { Config } from '@/lib/config';
import { JsonRpcProvider } from '@ethersproject/providers';
import { rpcProviderService as _rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { configService as _configService } from '@/services/config/config.service';
import SpookySwap from '@/services/dex/contracts/spooky-swap';
import SpiritSwap from '@/services/dex/contracts/spirit-swap';

export default class DexContractsService {
  public readonly spookySwap: SpookySwap;
  public readonly spiritSwap: SpiritSwap;
  private readonly config: Config;
  private readonly provider: JsonRpcProvider;

  constructor(
    readonly configService = _configService,
    readonly rpcProviderService = _rpcProviderService
  ) {
    this.provider = this.rpcProviderService.jsonProvider;
    this.config = this.configService.network;

    this.spookySwap = new SpookySwap(this);
    this.spiritSwap = new SpiritSwap(this);
  }
}

export const dexContractsService = new DexContractsService();
