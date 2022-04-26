import { Config } from '@/lib/config';
import { JsonRpcProvider } from '@ethersproject/providers';
import { configService as _configService } from '@/services/config/config.service';
import { rpcProviderService as _rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import Lock from '@/beethovenx/services/lock/contracts/lock';
import { default as LockAbi } from '@/beethovenx/abi/FBeetsLocker.json';

export default class LockContractsService {
  config: Config;
  provider: JsonRpcProvider;
  lock: Lock;

  constructor(
    readonly configService = _configService,
    readonly rpcProviderService = _rpcProviderService
  ) {
    this.provider = this.rpcProviderService.jsonProvider;
    this.config = this.configService.network;

    // Init contracts
    this.lock = new Lock(this);
  }

  // Combine all the ABIs and remove duplicates
  public get allABIs() {
    return Object.values(
      Object.fromEntries([...LockAbi].map(row => [row.name, row]))
    );
  }
}

export const lockContractsService = new LockContractsService();
