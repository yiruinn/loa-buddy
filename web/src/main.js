import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router';

import App from './App.vue'
import Home from './views/Home.vue'
import Mari from './views/Mari.vue'
import Engravings from './views/Engravings.vue'
import SpecialHoning from './views/SpecialHoning.vue'
import Settings from './views/Settings.vue'
import PrimeVue from 'primevue/config';

import 'primevue/resources/themes/lara-light-teal/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';          

const routes = [
    { path: '/', component: Home },
    { path: '/mari', component: Mari },
    { path: '/honing', component: SpecialHoning },
    { path: '/engravings', component: Engravings },
    { path: '/settings', component: Settings },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
  })

const app = createApp(App);

app.use(PrimeVue);
app.use(router)

app.mount('#app');