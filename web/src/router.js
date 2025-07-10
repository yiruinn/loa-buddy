
import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './components/HomePage.vue';
import CraftingCalculator from './components/CraftingCalculator.vue';
import MariCalculator from './components/MariCalculator.vue';
import MaterialsPage from './components/MaterialsPage.vue';
import StrongholdExchangeCalculator from './components/StrongholdExchangeCalculator.vue';
import BlacklistPage from './components/BlacklistPage.vue';

const routes = [
  { path: '/', component: HomePage, name: 'home' },
  { path: '/crafting', component: CraftingCalculator, name: 'crafting' },
  { path: '/mari', component: MariCalculator, name: 'mari' },
  { path: '/materials', component: MaterialsPage, name: 'materials' },
  { path: '/stronghold', component: StrongholdExchangeCalculator, name: 'stronghold' },
  { path: '/blacklist', component: BlacklistPage, name: 'blacklist' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
