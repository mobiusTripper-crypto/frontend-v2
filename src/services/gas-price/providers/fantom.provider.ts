import axios from 'axios';

import { GWEI_UNIT } from '@/constants/units';

import { GasPrice } from './types';

type TxSpeedOptions = 'safeLow' | 'standard' | 'fast' | 'fastest';

interface FantomGasStationResponse {
  result: {
    pendingcount: string;
    avgminingblocktxcountsize: number;
    avgtxnsperblock: number;
    mingaspricegwei: number;
    avgnetworkutilization: number;
    rapidgaspricegwei: number;
    fastgaspricegwei: number;
    standardgaspricegwei: number;
    data: string;
  };
}

export default class FantomProvider {
  public async getLatest(
    txSpeed: TxSpeedOptions = 'standard'
  ): Promise<GasPrice | null> {
    try {
      const { data } = await axios.get<FantomGasStationResponse>(
        'https://gftm.blockscan.com/gasapi.ashx?apikey=key&method=pendingpooltxgweidata'
      );
      return { price: data.result.standardgaspricegwei * GWEI_UNIT };
    } catch (error) {
      console.log('[Fantom] Gas Platform Error', error);
      return null;
    }
  }
}
