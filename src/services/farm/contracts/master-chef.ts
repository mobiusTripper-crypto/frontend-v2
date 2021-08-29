import Service from '@/services/balancer/contracts/balancer-contracts.service';
import ConfigService from '@/services/config/config.service';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { default as MasterChefAbi } from '@/lib/abi/MasterChefV2.json';

export default class MasterChef {
  service: Service;

  constructor(service, private readonly configService = new ConfigService()) {
    this.service = service;
  }

  public async getPendingBeetx(pid: number, user: string): Promise<number> {
    let result = {} as Record<any, any>;

    const masterChefMultiCaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      MasterChefAbi
    );

    masterChefMultiCaller.call('pendingBeetx', this.address, 'pendingBeetx', [
      pid,
      user
    ]);
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

    masterChefMultiCaller.call('harvest', this.address, 'harvest', [pid, to]);
    await masterChefMultiCaller.execute();
  }

  public async deposit(pid: number, amount: number, to: string) {
    const masterChefMultiCaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      MasterChefAbi
    );

    masterChefMultiCaller.call('deposit', this.address, 'deposit', [
      pid,
      amount,
      to
    ]);
    await masterChefMultiCaller.execute();
  }

  public get address(): string {
    return this.service.config.addresses.masterChef || '';
  }
}
