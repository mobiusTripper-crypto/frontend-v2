import { configService as _configService } from '@/services/config/config.service';
import axios from 'axios';
import {
  GqlUserPortfolioData,
  GqlUserTokenData,
  UserPortfolio,
  UserPortfolioData,
  UserTokenData
} from '@/services/beethovenx/beethovenx-types';

export default class BeethovenxService {
  private readonly url: string;

  constructor(private readonly configService = _configService) {
    this.url =
      configService.env.BACKEND_URL || configService.network.backendUrl;
  }

  public async getUserPortfolio(address: string): Promise<UserPortfolio> {
    const query = `
      query {
        portfolio: portfolioGetUserPortfolio {
          ...GqlUserPortfolioData
        }
        history: portfolioGetUserPortfolioHistory {
          ...GqlUserPortfolioData
        }
      }
      
      ${this.userProfileDataFragment}
    `;

    const response = await this.get<{
      portfolio: GqlUserPortfolioData;
      history: GqlUserPortfolioData[];
    }>(query, address);

    return {
      portfolio: this.mapPortfolioData(response.portfolio),
      history: response.history.map(item => this.mapPortfolioData(item))
    };
  }

  private async get<T>(query: string, address: string): Promise<T> {
    try {
      const {
        data: { data }
      } = await axios.post(
        this.url,
        { query },
        {
          headers: {
            'Content-Type': 'application/json',
            AccountAddress: '0xD111b37e1232D51149F62Ed69F4dcD2976DCbC6f'
          }
        }
      );
      return data;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  private get userProfileDataFragment() {
    return `
      fragment GqlUserPortfolioData on GqlUserPortfolioData {
        timestamp
        totalSwapFees
        totalSwapVolume
        totalValue
        myFees
        pools {
          id
          myFees
          name
          percentOfPortfolio
          percentShare
          poolAddress
          poolId
          priceChange
          priceChangePercent
          pricePerShare
          shares
          swapFees
          swapVolume
          tokens {
            address
            balance
            id
            name
            percentOfPortfolio
            pricePerToken
            symbol
            totalValue
          }
          totalValue
        }
        tokens {
          address
          balance
          id
          name
          percentOfPortfolio
          pricePerToken
          symbol
          totalValue
        }
      }
    `;
  }

  public mapPortfolioData(data: GqlUserPortfolioData): UserPortfolioData {
    return {
      ...data,
      totalValue: parseFloat(data.totalValue),
      totalSwapFees: parseFloat(data.totalSwapFees),
      totalSwapVolume: parseFloat(data.totalSwapVolume),
      myFees: parseFloat(data.myFees),
      pools: data.pools.map(pool => ({
        ...pool,
        totalValue: parseFloat(pool.totalValue),
        swapFees: parseFloat(pool.swapFees),
        swapVolume: parseFloat(pool.swapVolume),
        myFees: parseFloat(pool.myFees),
        priceChange: parseFloat(pool.priceChange),
        pricePerShare: parseFloat(pool.pricePerShare),
        shares: parseFloat(pool.shares),
        tokens: pool.tokens.map(token => this.mapUserTokenData(token))
      })),
      tokens: data.tokens.map(token => this.mapUserTokenData(token))
    };
  }

  private mapUserTokenData(token: GqlUserTokenData): UserTokenData {
    return {
      ...token,
      balance: parseFloat(token.balance),
      pricePerToken: parseFloat(token.pricePerToken),
      totalValue: parseFloat(token.totalValue)
    };
  }
}

export const beethovenxService = new BeethovenxService();
