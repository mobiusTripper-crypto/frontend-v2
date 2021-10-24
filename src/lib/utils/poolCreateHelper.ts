import { PoolTokenInput } from '@/services/pool/creator/pool-creator.service';
import { sumBy } from 'lodash';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import { TokenInfoMap } from '@/types/TokenList';
import { parseUnits } from '@ethersproject/units';

export function getTokensErrorFromInputs(
  poolTokens: PoolTokenInput[],
  tokens: TokenInfoMap,
  balances: BalanceMap,
  approvalsRequired: (
    tokenAddresses: string[],
    amounts: string[],
    contractAddress?: string
  ) => string[]
) {
  const totalWeight = sumBy(poolTokens, token => parseFloat(token.weight));

  if (totalWeight < 99.99 || totalWeight > 100.01) {
    return {
      header: 'Weights must add up to approx 100%',
      body: 'Your token weights do no add up to 100%'
    };
  }

  for (const poolToken of poolTokens) {
    if (!poolToken.weight || parseFloat(poolToken.weight) === 0) {
      return {
        header: 'All tokens must have a weight',
        body: 'One or more of your tokens does not have a valid weight'
      };
    }

    if (!poolToken.amount || parseFloat(poolToken.amount) === 0) {
      return {
        header: 'All tokens must have an initial amount',
        body: 'One or more of your tokens does not have a valid initial amount'
      };
    }

    if (
      parseFloat(poolToken.amount) > parseFloat(balances[poolToken.address])
    ) {
      return {
        header: 'An initial amount exceeds your balance',
        body: 'One or more of your input amounts exceeds your token balance'
      };
    }

    /*if (tokens[poolToken.address]) {
      const tokenInDecimals = tokens[poolToken.address].decimals;
      const tokenInAmountDenorm = parseUnits(poolToken.amount, tokenInDecimals);

      const requiredAllowances = approvalsRequired(
        [poolToken.address],
        [tokenInAmountDenorm.toString()]
      );

      if (requiredAllowances.length > 0) {
        return {
          header: 'A token requires approval',
          body: 'One or more of your tokens requires an approval'
        };
      }
    }*/
  }

  return undefined;
}
