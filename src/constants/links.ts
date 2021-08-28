export const EXTERNAL_LINKS = {
  Balancer: {
    Home: 'https://beethovenx.io/',
    Farm: 'https://farm.beethovenx.io/',
    BalForGas:
      'https://docs.balancer.finance/core-concepts/bal-balancer-governance-token/bal-for-gas',
    Claim: (account: string) => `https://claim.balancer.finance/#/${account}`,
    PoolsV1Dashboard: 'https://pools.balancer.exchange/#/dashboard',
    PoolsV1Explore: 'https://pools.balancer.exchange/#/explore'
  },
  Gauntlet: {
    Home: 'https://gauntlet.network'
  },
  Ethereum: {
    Wallets: 'https://ethereum.org/en/wallets'
  }
};
