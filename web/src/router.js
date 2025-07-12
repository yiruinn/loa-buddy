
import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './components/HomePage.vue';
import CraftingPage from './components/CraftingPage.vue';
import MariCalculator from './components/MariCalculator.vue';
import MaterialsPage from './components/MaterialsPage.vue';
import StrongholdCalculator from './components/StrongholdCalculator.vue';
import MarketTracker from './components/MarketTracker.vue';

const routes = [
  { path: '/', component: HomePage, name: 'home' },
  { path: '/crafting', component: CraftingPage, name: 'crafting' },
  { path: '/mari', component: MariCalculator, name: 'mari' },
  { path: '/materials', component: MaterialsPage, name: 'materials' },
  { path: '/stronghold', component: StrongholdCalculator, name: 'stronghold' },
  { path: '/market', component: MarketTracker, name: 'market-tracker' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
