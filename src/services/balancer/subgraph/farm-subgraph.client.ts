import axios from 'axios';
import { configService as _configService } from '@/services/config/config.service';
import { Farm } from '@/services/balancer/subgraph/types';

export default class FarmSubgraphClient {
  url: string;

  constructor(private readonly configService = _configService) {
    this.url = configService.network.farmSubgraph || '';
  }

  public async getFarms() {
    const query = `
    query {
      farms: pools(
        first: 1000
        skip: 0
        orderBy: "id"
        orderDirection: "desc"
      ) {
        id
        pair
        allocPoint
        slpBalance
        masterChef {
          id
          totalAllocPoint
          beetxPerBlock
        }
        rewarder {
          id
          rewardToken
          rewardPerSecond
        }
      }
    }
    `;

    return this.get(query);
  }

  public async getFarm(id: string) {
    const query = `
    query {
      farm: pool(id: "${id}") {
        id
        pair
        allocPoint
        slpBalance
        masterChef {
          id
          totalAllocPoint
          beetxPerBlock
        }
        rewarder {
          id
          rewardToken
          rewardPerSecond
        }
      }
    }
    `;

    return this.get(query);
  }

  private async get(query) {
    try {
      const {
        data: { data }
      } = await axios.post(
        this.url,
        { query },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return data;
    } catch (error) {
      console.error(error);
    }
  }
}

export const farmSubgraphClient = new FarmSubgraphClient();
