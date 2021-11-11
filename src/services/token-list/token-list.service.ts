import axios from 'axios';
import { JsonRpcProvider } from '@ethersproject/providers';
import { TokenList, TokenListMap } from '@/types/TokenList';
import { rpcProviderService as _rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { ipfsService as _ipfsService } from '../ipfs/ipfs.service';
import { configService as _configService } from '../config/config.service';

export default class TokenListService {
  provider: JsonRpcProvider;
  appNetworkKey: string;

  constructor(
    private readonly configService = _configService,
    private readonly rpcProviderService = _rpcProviderService,
    private readonly ipfsService = _ipfsService
  ) {
    this.provider = this.rpcProviderService.jsonProvider;
    this.appNetworkKey = this.configService.network.key;
  }

  public async getTokenListMap(): Promise<TokenListMap> {
    const url = this.configService.network.tokenListSanityUrl;
    const { data } = await axios.get<{ result: TokenList }>(
      this.configService.network.tokenListSanityUrl
    );

    return { [url]: data.result };
  }
}

export const tokenListService = new TokenListService();
