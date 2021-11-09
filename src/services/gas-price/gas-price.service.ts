import ConfigService from '../config/config.service';
import BlocknativeProvider from './providers/blocknative.provider';
import PolygonProvider from './providers/polygon.provider';
import { GasPrice } from './providers/types';
import FantomProvider from '@/services/gas-price/providers/fantom.provider';

export default class GasPriceService {
  constructor(
    private readonly configService = new ConfigService(),
    private readonly blocknativeProvider = new BlocknativeProvider(),
    private readonly polygonProvider = new PolygonProvider(),
    private readonly fantomProvider = new FantomProvider()
  ) {}

  public async getLatest(): Promise<GasPrice | null> {
    switch (this.configService.network.key) {
      case '1':
        return await this.blocknativeProvider.getLatest();
      case '137':
        return await this.polygonProvider.getLatest();
      case '250':
        return await this.fantomProvider.getLatest();
      default:
        return null;
    }
  }
}
