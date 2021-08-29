<template>
  <div class="lg:container lg:mx-auto pt-10 md:pt-12">
    <div class="px-4 lg:px-0">
      <h3 class="mb-3">Farm detail</h3>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { EXTERNAL_LINKS } from '@/constants/links';
import usePools from '@/composables/pools/usePools';
import useWeb3 from '@/services/web3/useWeb3';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import { usePool } from '@/composables/usePool';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import usePoolSnapshotsQuery from '@/composables/queries/usePoolSnapshotsQuery';
import useApp from '@/composables/useApp';
import { useI18n } from 'vue-i18n';
import useNumbers from '@/composables/useNumbers';
import { useQueryClient } from 'vue-query';
import useTokens from '@/composables/useTokens';

export default defineComponent({
  components: {},

  setup() {
    /**
     * COMPOSABLES
     */
    const { appLoading } = useApp();
    const router = useRouter();
    const { t } = useI18n();
    const route = useRoute();
    const { fNum } = useNumbers();
    const queryClient = useQueryClient();
    const { prices } = useTokens();
    const { isWalletReady, isV1Supported } = useWeb3();

    const poolQuery = usePoolQuery(route.params.id as string);
    const pool = computed(() => poolQuery.data.value);

    const loading = computed(
      () =>
        poolQuery.isLoading.value ||
        poolQuery.isIdle.value ||
        poolQuery.error.value
    );

    return {
      appLoading,
      loading,

      // computed
      isWalletReady,

      //methods
      router,

      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>
