import Service from '@/services/balancer/contracts/balancer-contracts.service';
import ConfigService from '@/services/config/config.service';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { default as SpiritRouter } from '@/lib/abi/SpiritRouter.json';
import { GetAmountsOutInput } from '@/services/dex/dex-contract-types';

export default class SpiritSwap {
  service: Service;

  constructor(service, private readonly configService = new ConfigService()) {
    this.service = service;
  }

  public async getAmountsOut(inputs: GetAmountsOutInput[]): Promise<number[]> {
    let result = {} as Record<any, any>;

    const uniswapRouterMulticaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      SpiritRouter
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
    return '0x16327e3fbdaca3bcf7e38f5af2599d2ddc33ae52';
  }
}
