import Service from '@/services/balancer/contracts/balancer-contracts.service';
import ConfigService from '@/services/config/config.service';
import { OnchainPoolData, PoolType } from '@/services/balancer/subgraph/types';
import { TokenInfoMap } from '@/types/TokenList';
import { getAddress } from '@ethersproject/address';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { default as vaultAbi } from '@/lib/abi/Vault.json';
import { default as MasterChefAbi } from '@/lib/abi/MasterChefV2.json';
import { formatUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';

export default class MasterChef {
  service: Service;

  constructor(service, private readonly configService = new ConfigService()) {
    this.service = service;
  }

  public async getPendingBeetx(): Promise<number> {
    let result = {} as Record<any, any>;

    const masterChefMultiCaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      MasterChefAbi
    );

    masterChefMultiCaller.call(
      'pendingBeetx',
      this.address,
      'pendingBeetx',
      []
    );
    result = await masterChefMultiCaller.execute(result);

    return result.pendingBeetx;
  }

  public async withdrawAndHarvest(pid: number, amount: number, to: string) {
    const masterChefMultiCaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      MasterChefAbi
    );

    masterChefMultiCaller.call(
      'withdrawAndHarvest',
      this.address,
      'withdrawAndHarvest',
      [pid, amount, to]
    );
    await masterChefMultiCaller.execute();
  }

  public async harvest(pid: number, to: string) {
    const masterChefMultiCaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      MasterChefAbi
    );

    masterChefMultiCaller.call(
      'withdrawAndHarvest',
      this.address,
      'withdrawAndHarvest',
      [pid, to]
    );
    await masterChefMultiCaller.execute();
  }

  public get address(): string {
    return this.service.config.addresses.masterChef;
  }
}
