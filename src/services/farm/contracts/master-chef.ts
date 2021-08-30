import Service from '@/services/balancer/contracts/balancer-contracts.service';
import ConfigService from '@/services/config/config.service';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { default as MasterChefAbi } from '@/lib/abi/MasterChefV2.json';
import { BigNumber } from 'ethers';
import { BN } from 'ethereumjs-util';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { Web3Provider } from '@ethersproject/providers';

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

  public async withdrawAndHarvest(
    provider: Web3Provider,
    pid: number,
    amount: string,
    to: string
  ) {
    return sendTransaction(
      provider,
      this.configService.network.addresses.masterChef || '',
      MasterChefAbi,
      'withdrawAndHarvest',
      [pid, amount.toString(), to]
    );
  }

  public async harvest(provider: Web3Provider, pid: number, to: string) {
    return sendTransaction(
      provider,
      this.configService.network.addresses.masterChef || '',
      MasterChefAbi,
      'harvest',
      [pid, to]
    );
  }

  public async deposit(
    provider: Web3Provider,
    pid: number,
    amount: string | number,
    to: string
  ) {
    return sendTransaction(
      provider,
      this.configService.network.addresses.masterChef || '',
      MasterChefAbi,
      'deposit',
      [pid, amount.toString(), to]
    );
    // masterChefMultiCaller.call('deposit', this.address, 'deposit', [
    //   pid,
    //   amount.toString(),
    //   to
    // ]);
    // await masterChefMultiCaller.execute();
  }

  public get address(): string {
    return this.service.config.addresses.masterChef || '';
  }
}
