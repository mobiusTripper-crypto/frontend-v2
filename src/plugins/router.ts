import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Portfolio from '@/pages/Portfolio.vue';
import Pool from '@/pages/Pool.vue';
import LiquidityMining from '@/pages/LiquidityMining.vue';
import Trade from '@/pages/Trade.vue';
import Farm from '@/pages/FarmList.vue';
import FarmDetail from '@/pages/FarmDetail.vue';
import BeetsLBP from '@/pages/BeetsLBP.vue';
import Invest from '@/pages/Invest.vue';
import PoolCreate from '@/pages/PoolCreate.vue';
import FreshBeets from '@/pages/FreshBeets.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', redirect: '/trade' },
  { path: '/invest', name: 'invest', component: Invest },
  { path: '/my-portfolio', name: 'my-portfolio', component: Portfolio },
  { path: '/fbeets', name: 'fbeets', component: FreshBeets },
  { path: '/trade/:assetIn?/:assetOut?', name: 'trade', component: Trade },
  {
    path: '/swap/:assetIn?/:assetOut?',
    redirect: to => {
      return `/trade${to.path.split('/swap')[1]}`;
    }
  },
  { path: '/pool/:id', name: 'pool', component: Pool },
  //{ path: '/farm', name: 'farm', component: Farm },
  { path: '/farm/:id/:poolId?', name: 'farm-detail', component: FarmDetail },
  {
    path: '/liquidity-mining',
    name: 'liquidity-mining',
    component: LiquidityMining
  },
  { path: '/beets', name: 'beets', component: BeetsLBP },

  { path: '/pool-create', name: 'pool-create', component: PoolCreate },
  { path: '/:pathMatch(.*)*', name: 'not-found', redirect: '/' }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;
