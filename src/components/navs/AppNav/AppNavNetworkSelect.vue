<template>
  <BalPopover align="right" no-pad>
    <template v-slot:activator>
      <BalBtn
        color="transparent"
        flat
        class="text-base"
        :size="upToLargeBreakpoint ? 'md' : 'sm'"
        :circle="upToLargeBreakpoint"
        :class="{ btn: upToLargeBreakpoint }"
      >
        <img
          :src="iconSrc(activeNetwork)"
          :alt="activeNetwork.name"
          :class="[bp === 'xs' ? 'h-8 w-8' : 'w-9 h-9', 'pl-2']"
        />
      </BalBtn>
    </template>
    <div class="flex flex-col w-44 rounded-lg overflow-hidden">
      <div
        class="p-3 border-b dark:border-gray-900 whitespace-nowrap text-gray-500 font-medium"
      >
        Select a network
      </div>
      <a
        v-for="network in networks"
        :key="network.id"
        :href="appUrl(network)"
        class="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-850"
      >
        <div class="flex items-center">
          <img
            :src="iconSrc(network)"
            :alt="network.name"
            class="w-5 h-5 rounded-full mr-2"
          />
          <span class="ml-1 font-medium">
            {{ network.name }}
          </span>
        </div>
        <BalIcon v-if="isActive(network)" name="check" class="text-green-500" />
      </a>
    </div>
  </BalPopover>
</template>

<script lang="ts">
import useBreakpoints from '@/composables/useBreakpoints';
import ConfigService from '@/services/config/config.service';
import { defineComponent } from 'vue';

interface Network {
  id: string;
  name: string;
  subdomain: string;
  key: string;
}

export default defineComponent({
  name: 'AppNavNetworkSelect',

  setup() {
    // SERVICES
    const configService = new ConfigService();

    // COMPOSABLES
    const { bp, upToLargeBreakpoint } = useBreakpoints();

    // DATA
    const networks = [
      {
        id: 'fantom',
        name: 'Fantom',
        subdomain: 'ftm',
        key: '250'
      },
      {
        id: 'optimism',
        name: 'Optimism',
        subdomain: 'op',
        key: '10'
      }
    ];

    const activeNetwork = networks.find(network => {
      return isActive(network);
    });

    // METHODS
    function iconSrc(network: Network): string {
      return require(`@/assets/images/icons/networks/${network.id}.svg`);
    }

    function appUrl(network: Network): string {
      return `https://${network.subdomain}.beets.fi`;
    }

    function isActive(network: Network): boolean {
      return configService.network.key === network.key;
    }

    return {
      // computed
      bp,
      upToLargeBreakpoint,
      // data
      networks,
      activeNetwork,
      // methods
      isActive,
      appUrl,
      iconSrc
    };
  }
});
</script>
