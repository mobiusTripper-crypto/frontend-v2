<script setup lang="ts">
import { defineProps, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { format } from 'date-fns';
import useNumbers from '@/composables/useNumbers';
import useBreakpoints from '@/composables/useBreakpoints';
import { GqlLockingPeriod } from '@/beethovenx/services/beethovenx/beethovenx-types';
import { ColumnDefinition } from '@/components/_global/BalTable/BalTable.vue';

/**
 * TYPES
 */
type LockRow = {
  locked: boolean;
  lockAmount: string;
  lockAmountUsd: string;
  epoch: string;
  formattedEpoch: string;
  formattedAmountUsd: string;
};

type Props = {
  lockingPeriods: GqlLockingPeriod[];
  isLoading?: boolean;
  noResultsLabel?: string;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

/**
 * COMPOSABLES
 */
const { fNum } = useNumbers();
const { t } = useI18n();
const { upToLargeBreakpoint } = useBreakpoints();

/**
 * COMPUTED
 */
const columns = computed<ColumnDefinition<LockRow>[]>(() => [
  {
    name: 'Locked?',
    id: 'locked',
    accessor: '',
    Cell: 'lockedCell',
    align: 'left',
    sortable: false,
    width: 75
  },
  {
    name: t('amount'),
    id: 'amount',
    accessor: '',
    Cell: 'amountCell',
    align: 'right',
    sortable: false,
    width: 75
  },
  {
    name: t('value'),
    id: 'value',
    accessor: 'value',
    Cell: 'valueCell',
    align: 'right',
    className: 'align-center w-40',
    sortKey: lockingPeriods => lockingPeriods.lockAmountUsd,
    width: 75
  },
  {
    name: t('date'),
    id: 'timeAgo',
    accessor: 'epoch',
    Cell: 'timeCell',
    align: 'right',
    sortKey: pool => pool.epoch,
    width: 150
  }
]);

function getEpochTime(): number {
  let twelveWeeksInSeconds: number;
  if (
    ['development', 'staging'].includes(
      process.env.VUE_APP_ENV || 'development'
    )
  ) {
    twelveWeeksInSeconds = 1 * 60 * 60; // 12 weeks on rinkeby :)
  } else {
    twelveWeeksInSeconds = 12 * 7 * 24 * 60 * 60;
  }

  return twelveWeeksInSeconds;
}

const lockPeriodRows = computed<LockRow[]>(() =>
  props.isLoading
    ? []
    : props.lockingPeriods.map(({ lockAmount, lockAmountUsd, epoch }) => {
        const endDate = new Date((parseInt(epoch) + getEpochTime()) * 1000);
        return {
          locked: Date.now() < endDate.getTime(),
          lockAmount,
          lockAmountUsd,
          formattedAmountUsd: fNum(
            fNum(parseFloat(lockAmountUsd), 'usd'),
            'usd_m'
          ),
          epoch,
          formattedEpoch: format(endDate, 'Pp')
        };
      })
);
</script>

<template>
  <BalCard
    class="overflow-x-auto"
    :square="upToLargeBreakpoint"
    :noBorder="upToLargeBreakpoint"
    noPad
  >
    <BalTable
      :columns="columns"
      :data="lockPeriodRows"
      :is-loading="isLoading"
      skeleton-class="h-64"
      sticky="both"
      :no-results-label="noResultsLabel"
      :initial-state="{
        sortColumn: 'timeAgo',
        sortDirection: 'desc'
      }"
    >
      <template v-slot:lockedCell="action">
        <div class="px-6 py-2">
          <div class="flex items-center">
            {{ action.locked ? 'Yes' : 'No' }}
          </div>
        </div>
      </template>

      <template v-slot:amountCell="action">
        <div class="px-6 py-4 flex justify-end font-numeric">
          {{ action.lockAmount }}
        </div>
      </template>

      <template v-slot:valueCell="action">
        <div class="px-6 py-4 flex justify-end font-numeric">
          {{ action.formattedAmountUsd }}
        </div>
      </template>

      <template v-slot:timeCell="action">
        <div class="px-6 py-4">
          <div
            class="flex items-center justify-end wrap whitespace-nowrap text-right"
          >
            {{ action.formattedEpoch }}
          </div>
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>

<style scoped>
.token-item {
  @apply m-1 flex items-center p-1 px-2 bg-gray-50 dark:bg-gray-700 rounded-lg;
}
</style>
