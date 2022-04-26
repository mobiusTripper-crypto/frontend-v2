<script setup lang="ts">
import LockClaimRewardsCard from '@/beethovenx/components/pages/lock/LockClaimRewardsCard.vue';
import LockMyStatsCard from '@/beethovenx/components/pages/lock/LockMyStatsCard.vue';
import LockTotalStatsCard from '@/beethovenx/components/pages/lock/LockTotalStatsCard.vue';
import useWeb3 from '@/services/web3/useWeb3';

const { isWalletReady, toggleWalletSelectModal } = useWeb3();
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <BalCard v-if="!isWalletReady" class="lg:col-span-2">
      <h5 class="text-md text-gray-500 mb-3 px-3 pt-3">
        Please connect your wallet to view your lock stats!
      </h5>
      <template v-slot:footer>
        <BalBtn
          :label="$t('connectWallet')"
          block
          @click.prevent="toggleWalletSelectModal"
        />
      </template>
    </BalCard>
    <template v-else>
      <LockMyStatsCard />
      <LockClaimRewardsCard />
    </template>

    <LockTotalStatsCard />
  </div>
</template>
