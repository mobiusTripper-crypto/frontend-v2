<script setup lang="ts">
import LockTable from './LockTable.vue';

import useLockUserQuery from '@/beethovenx/composables/lock/useLockUserQuery';
import { computed } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';

const { isWalletReady } = useWeb3();

/**
 * QUERIES
 */
const lockUserQuery = useLockUserQuery();

/**
 * COMPUTED
 */
const lockingPeriods = computed(() =>
  lockUserQuery.data.value
    ? lockUserQuery.data.value.gqlData.lockingUser.lockingPeriods.filter(
        period => !period.withdrawn
      )
    : []
);
</script>

<template>
  <template v-if="!isWalletReady">
    <BalCard v-if="!isWalletReady" class="lg:col-span-2">
      <h5 class="text-md text-gray-500 mb-3 px-3 pt-3">
        Please connect your wallet to view your locks!
      </h5>
    </BalCard>
  </template>
  <template v-else>
    <LockTable
      :locking-periods="lockingPeriods"
      :is-loading="loading"
      no-results-label="You have no locked fBEETS."
    />
  </template>
</template>
