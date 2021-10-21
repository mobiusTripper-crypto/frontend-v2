import Service from '@/services/balancer/contracts/balancer-contracts.service';
import ConfigService from '@/services/config/config.service';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { default as UniswapV2Router02 } from '@/lib/abi/UniswapV2Router02.json';
import { GetAmountsOutInput } from '@/services/dex/dex-contract-types';

export default class SpookySwap {
  service: Service;

  constructor(service, private readonly configService = new ConfigService()) {
    this.service = service;
  }

  public async getAmountsOut(inputs: GetAmountsOutInput[]): Promise<number[]> {
    let result = {} as Record<any, any>;

    const uniswapRouterMulticaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      UniswapV2Router02
    );

    for (const input of inputs) {
      uniswapRouterMulticaller.call(
        'getAmountsOut',
        this.routerAddress,
        'getAmountsOut',
        [input.amountIn.toString(), input.path]
      );
    }

    result = await uniswapRouterMulticaller.execute(result);

    console.log('amounts out result', result);

    return [];
  }

  public get routerAddress(): string {
    return '0xF491e7B69E4244ad4002BC14e878a34207E38c29';
  }
}
