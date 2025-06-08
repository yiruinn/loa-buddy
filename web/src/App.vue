<script setup>
import { ref, onMounted } from 'vue'
import { NLayout, NLayoutHeader, NLayoutContent, NLayoutSider, NMenu, NConfigProvider, darkTheme } from 'naive-ui'
import CraftingCalculator from './components/CraftingCalculator.vue'
import MarketCalculator from './components/MarketCalculator.vue'

const currentTool = ref('crafting')

const menuOptions = [
  {
    label: 'Tools',
    key: 'tools',
    children: [
      {
        label: 'Crafting Calculator',
        key: 'crafting'
      },
      {
        label: 'Market Calculator',
        key: 'market'
      }
    ]
  },
  {
    label: 'Blacklist',
    key: 'blacklist'
  }
]

const handleMenuSelect = (key) => {
  currentTool.value = key
}

const recipes = ref([]);
onMounted(async () => {
  try {
    const response = await fetch('/data/orehas.json'); 
    recipes.value = await response.json();
  } catch (error) {
    console.error('Failed to load recipes:', error);
  }
});
</script>

<template>
  <n-config-provider :theme="darkTheme">
    <n-layout style="height: 100vh">
      <n-layout-header bordered style="height: 64px; padding: 16px">
        <h1 style="margin: 0">LOA Buddy</h1>
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
            :default-value="currentTool"
            @update:value="handleMenuSelect"
          />
        </n-layout-sider>

        <n-layout-content style="padding: 24px;">
          <!-- <CraftingCalculator v-if="currentTool === 'crafting'" /> -->
          <CraftingCalculator
            v-if="currentTool === 'crafting' && recipes.length > 0"
            :recipes="recipes"
            :crafting-cost-reduction-percent="10"
            :crafting-time-reduction-percent="20"
          />
          <MarketCalculator v-if="currentTool === 'market'" />
        </n-layout-content>
      </n-layout>
    </n-layout>
  </n-config-provider>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  height: 100%;
}
</style>