import { TransactionResponse } from '@ethersproject/abstract-provider';
import configs from '@/lib/config';
import { callStatic, sendTransaction } from '@/lib/utils/balancer/web3';
import { default as weightedPoolFactoryAbi } from '@/lib/abi/WeightedPoolFactory.json';
import { default as weightedPoolAbi } from '@/lib/abi/WeightedPool.json';
import { default as vaultAbi } from '@/lib/abi/Vault.json';
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { TokenInfoMap } from '@/types/TokenList';
import { orderBy } from 'lodash';
import { BigNumber } from '@ethersproject/bignumber';
import { bnToNormalizedWeights } from '@/lib/utils/numbers';
import { parseUnits } from '@ethersproject/units';
import { encodeJoinWeightedPool } from '@/lib/utils/balancer/weightedPoolEncoding';
import { PoolVerifierService } from '@/services/pool/creator/pool-verifier.service';

export interface PoolTokenInput {
  address: string;
  weight: string;
  amount: string;
}

export class PoolCreatorService {
  network: string;
  vaultAddress: string;
  weightedPoolFactoryAddress: string;
  helpersAddress: string;
  poolVerifier: PoolVerifierService;

  constructor(network: string) {
    this.network = network;
    this.vaultAddress = configs[network].addresses.vault;
    this.weightedPoolFactoryAddress =
      configs[network].addresses.weightedPoolFactory;
    this.helpersAddress = configs[network].addresses.balancerHelpers;
    this.poolVerifier = new PoolVerifierService(network);
  }

  public async createWeightedPool(
    provider: Web3Provider | JsonRpcProvider,
    name: string,
    symbol: string,
    owner: string,
    swapFeePercentage: string,
    tokens: PoolTokenInput[]
  ): Promise<TransactionResponse> {
    const sorted = orderBy(tokens, 'address', 'asc');

    return await sendTransaction(
      provider,
      this.weightedPoolFactoryAddress,
      weightedPoolFactoryAbi,
      'create',
      [
        name,
        symbol,
        sorted.map(token => token.address),
        //weights and swap fee come in as 1 = 1%, so its base 16
        bnToNormalizedWeights(
          sorted.map(token => parseUnits(token.weight, 16))
        ),
        parseUnits(swapFeePercentage, 16),
        owner
      ]
    );
  }

  public async joinPool(
    provider: Web3Provider | JsonRpcProvider,
    tokens: PoolTokenInput[],
    poolId: string,
    address: string,
    tokenInfoMap: TokenInfoMap
  ): Promise<TransactionResponse> {
    const sorted = orderBy(tokens, 'address', 'asc');
    const amountsIn = sorted.map(token =>
      parseUnits(token.amount, tokenInfoMap[token.address].decimals)
    );

    const joinPoolRequest = {
      assets: sorted.map(token => token.address),
      maxAmountsIn: amountsIn,
      userData: encodeJoinWeightedPool({ kind: 'Init', amountsIn }),
      fromInternalBalance: false
    };

    return await sendTransaction(
      provider,
      this.vaultAddress,
      vaultAbi,
      'joinPool',
      [poolId, address, address, joinPoolRequest]
    );
  }

  public async getPoolDataFromTransaction(
    provider: Web3Provider | JsonRpcProvider,
    tx: TransactionResponse
  ): Promise<{ poolAddress: string; blockHash: string; poolId: string }> {
    const receipt = (await tx.wait()) as any;
    const poolCreatedEvent = receipt.events.find(
      (e: { event: string }) => e.event === 'PoolCreated'
    );

    const poolId = await callStatic(
      provider,
      poolCreatedEvent.args.pool,
      weightedPoolAbi,
      'getPoolId',
      []
    );

    return {
      poolAddress: poolCreatedEvent.args.pool,
      blockHash: receipt.blockHash,
      poolId
    };
  }

  public async verifyPool(
    provider: Web3Provider | JsonRpcProvider,
    name: string,
    symbol: string,
    owner: string,
    swapFeePercentage: string,
    tokens: PoolTokenInput[],
    poolAddress: string,
    blockHash: string
  ) {
    const sorted = orderBy(tokens, 'address', 'asc');

    await this.poolVerifier.verifyPool(
      provider,
      name,
      symbol,
      owner,
      sorted.map(token => token.address),
      //weights and swap fee come in as 1 = 1%, so its base 16
      bnToNormalizedWeights(sorted.map(token => parseUnits(token.weight, 16))),
      parseUnits(swapFeePercentage, 16),
      poolAddress,
      blockHash
    );
  }
}
