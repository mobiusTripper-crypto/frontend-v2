<template>
  <div :class="`app-nav-toggle bg-gray-50 dark:bg-gray-${darkModeBg}`">
    <router-link
      :to="{ name: 'home' }"
      :class="[
        'toggle-link px-6 rounded-l-lg',
        { [activeClasses]: !isTradePage && !isFarmPage }
      ]"
      @click="trackGoal(Goals.ClickNavInvest)"
    >
      {{ $t('invest') }}
    </router-link>
    <router-link
      :to="{ name: 'trade' }"
      :class="[
        'toggle-link px-6 rounded-r-lg',
        { [activeClasses]: isTradePage }
      ]"
      @click="trackGoal(Goals.ClickNavTrade)"
    >
      {{ $t('trade') }}
    </router-link>
    <router-link
      :to="{ name: 'farm' }"
      :class="[
        'toggle-link px-6 rounded-r-lg',
        { [activeClasses]: isFarmPage }
      ]"
      @click="trackGoal(Goals.ClickNavFarm)"
    >
      Farm
    </router-link>
  </div>
</template>

<script lang="ts">
import useFathom from '@/composables/useFathom';
import { computed, defineComponent } from 'vue';
import { useRoute } from 'vue-router';
import { EXTERNAL_LINKS } from '@/constants/links';

export default defineComponent({
  name: 'AppNavToggle',
  components: {},
  props: {
    darkModeBg: { type: String, default: '800' }
  },

  setup() {
    const route = useRoute();
    const activeClasses =
      'bg-black text-white rounded-lg dark:text-black dark:bg-white';
    const isTradePage = computed(() => route.name === 'trade');
    const isFarmPage = computed(() => String(route.name).startsWith('farm'));
    const { trackGoal, Goals } = useFathom();

    return {
      isTradePage,
      isFarmPage,
      activeClasses,
      trackGoal,
      Goals,
      EXTERNAL_LINKS
    };
  }
});
</script>

<style scoped>
.app-nav-toggle {
  @apply h-10 flex items-center rounded-lg shadow;
  font-variation-settings: 'wght' 600;
}

.toggle-link {
  @apply h-full flex items-center;
}
</style>
