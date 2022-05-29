export const EXTERNAL_LINKS = {
  Balancer: {
    Home: 'https://balancer.fi',
    BalForGas:
      'https://docs.balancer.finance/core-concepts/bal-balancer-governance-token/bal-for-gas',
    PoolsV1Dashboard: 'https://pools.balancer.exchange/#/dashboard',
    PoolsV1Explore: 'https://pools.balancer.exchange/#/explore'
  },
  Gauntlet: {
    Home: 'https://gauntlet.network'
  },
  Ethereum: {
    Wallets: 'https://fantom.foundation/wallets/'
  },
  Element: {
    Earn: 'https://app.element.fi/earn',
    Pools: {
      LUSD:
        'https://app.element.fi/pools/0xA8D4433BAdAa1A35506804B43657B0694deA928d',
      USDC:
        'https://app.element.fi/pools/0x787546Bf2c05e3e19e2b6BDE57A203da7f682efF'
    }
  },
  Copper: {
    Auctions: (poolAddress: string, networkPrefix = '') =>
      `https://${networkPrefix}copperlaunch.com/auctions/${poolAddress}`
  },
  Beethoven: {
    NavOtherItems: [
      {
        title: 'Vote',
        url: 'https://snapshot.org/#/beets.eth',
        chainId: [250]
      },
      {
        title: 'Analytics',
        url: 'https://info.beets.fi',
        chainId: [250]
      },
      {
        title: 'Docs & Help',
        url: 'https://docs.beets.fi',
        icon: 'gitbook-logo',
        chainId: [10, 250]
      },
      {
        title: 'Github',
        url: 'https://github.com/beethovenxfi',
        icon: 'github-logo',
        chainId: [10, 250]
      },
      {
        title: 'Twitter',
        url: 'https://twitter.com/beethoven_x',
        icon: 'twitter-icon',
        chainId: [10, 250]
      },
      {
        title: 'Medium',
        url: 'https://beethovenxio.medium.com/',
        icon: 'medium-icon',
        chainId: [10, 250]
      },
      {
        title: 'Discord',
        subTitle: '',
        url: 'https://discord.gg/jedS4zGk28',
        icon: 'discord-icon',
        chainId: [10, 250]
      },
      {
        title: 'Olympus Bonds',
        subtitle: 'olympus pro',
        url: 'https://pro.olympusdao.finance/#/bond',
        chainId: [250]
      },
      {
        title: 'Multichain Bridge',
        subTitle: 'ETH / AVAX / BSC / MATIC',
        url: 'https://app.multichain.org/#/router',
        chainId: [10, 250]
      },
      {
        title: 'AllBridge',
        subTitle: 'SOL / MATIC / CELO',
        url: 'https://app.allbridge.io/bridge?from=SOL&to=FTM&asset=SOL',
        chainId: [250]
      },
      {
        title: 'Wormhole Bridge',
        subTitle: 'TERRA / SOL / OTHERS',
        url: 'https://portalbridge.com/#/transfer',
        chainId: [250]
      }
    ]
  }
};
