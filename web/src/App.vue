<template>
  <n-config-provider :theme="darkTheme">
    <n-layout style="height: 100vh">
      <n-layout-header bordered style="height: 64px; padding: 16px">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <router-link :to="{ name: 'home' }" style="text-decoration: none; color: inherit;">
            <h1 style="margin: 0">LOA Buddy</h1>
          </router-link>
          <a href="https://www.buymeacoffee.com/zyrdev" target="_blank">
            <img src="https://cdn.buymeacoffee.com/buttons/v2/default-white.png" alt="Buy Me A Coffee" style="height: 36px !important;width: 130px !important;" >
          </a>
        </div>
      </n-layout-header>

      <n-layout has-sider style="height: calc(100vh - 64px)">
        <n-layout-sider
          bordered
          show-trigger
          collapse-mode="width"
          :collapsed-width="32"
          :width="240"
        >
          <n-menu
            :options="menuOptions"
            :value="currentTool"
            :default-expanded-keys="['tools', 'market']"
          />
        </n-layout-sider>

        <n-layout-content style="padding: 24px;">
          <router-view style="margin-bottom: 20px;" />
        </n-layout-content>
      </n-layout>
    </n-layout>
  </n-config-provider>
</template>

<script setup>
import { onMounted, h, computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { NLayout, NLayoutHeader, NLayoutContent, NLayoutSider, NMenu, NConfigProvider, darkTheme } from 'naive-ui';
import { init } from './store';

const route = useRoute();
const currentTool = computed(() => route.name);

const menuOptions = [
  {
    label: 'Tools',
    key: 'tools',
    children: [
      {
        label: () => h(RouterLink, { to: { name: 'crafting' } }, { default: () => 'Crafting Calculator' }),
        key: 'crafting'
      },
      {
        label: () => h(RouterLink, { to: { name: 'mari' } }, { default: () => "Mari's Shop Calculator" }),
        key: 'mari'
      },
      {
        label: () => h(RouterLink, { to: { name: 'stronghold' } }, { default: () => 'Stronghold Arbitrage' }),
        key: 'stronghold'
      }
    ]
  },
  {
    label: 'Market',
    key: 'market',
    children: [
      {
        label: () => h(RouterLink, { to: { name: 'materials' } }, { default: () => 'Material Prices' }),
        key: 'materials'
      },
      {
        label: () => h(RouterLink, { to: { name: 'market-tracker' } }, { default: () => 'Market Tracker' }),
        key: 'market-tracker'
      }
    ]
  }
];

onMounted(init);
</script>

<style>
.reduction-inputs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.category-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid #444;
  padding: 10px;
  border-radius: 4px;
}
.input-group {
  display: flex;
  align-items: center;
  gap: 4px;
}
.input-group span {
  flex-basis: 60%;
}
.input-group .n-input-number {
  flex-basis: 40%;
}
.category-group h3 {
  margin: 0;
  font-size: 1.1em;
}
</style>
