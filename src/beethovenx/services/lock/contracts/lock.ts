import Service from '@/services/balancer/contracts/balancer-contracts.service';
import ConfigService from '@/services/config/config.service';
import { default as LockAbi } from '@/beethovenx/abi/FBeetsLocker.json';
import { BigNumber } from 'ethers';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { Web3Provider } from '@ethersproject/providers';

export default class Lock {
  service: Service;

  constructor(service, private readonly configService = new ConfigService()) {
    this.service = service;
  }

  public async lock(provider: Web3Provider, amount: string, account: string) {
    return sendTransaction(provider, this.lockAddress, LockAbi, 'lock', [
      account,
      BigNumber.from(amount)
    ]);
  }

  public async relock(provider: Web3Provider) {
    return sendTransaction(
      provider,
      this.lockAddress,
      LockAbi,
      'processExpiredLocks',
      [true]
    );
  }

  public async withdraw(provider: Web3Provider) {
    return sendTransaction(
      provider,
      this.lockAddress,
      LockAbi,
      'processExpiredLocks',
      [false]
    );
  }

  public async getReward(provider: Web3Provider) {
    return sendTransaction(
      provider,
      this.lockAddress,
      LockAbi,
      'getReward',
      []
    );
  }

  public get fbeetsAddress(): string {
    return this.service.config.fBeets.address || '';
  }
  public get lockAddress(): string {
    return this.service.config.fBeets.lockAddress || '';
  }
}
