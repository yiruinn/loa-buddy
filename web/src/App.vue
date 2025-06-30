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
          <div v-if="currentTool === 'crafting'">
            <div class="reduction-inputs">
              <div class="input-group">
                <span>Crafting Cost Reduction (%)</span>
                <n-input-number v-model:value="craftingCostReductionPercent" :min="0" :max="100" />
              </div>
              <div class="input-group">
                <span>Crafting Time Reduction (%)</span>
                <n-input-number v-model:value="craftingTimeReductionPercent" :min="0" :max="100" />
              </div>
            </div>
            <MaterialCosts :materials="materials" />
            <CraftingCalculator
              :recipes="recipes"
              :materials="materials"
              :crafting-cost-reduction-percent="craftingCostReductionPercent"
              :crafting-time-reduction-percent="craftingTimeReductionPercent"
              style="margin-bottom: 20px;"
            />
          </div>
          <MarketCalculator v-if="currentTool === 'market'" />
        </n-layout-content>
      </n-layout>
    </n-layout>
  </n-config-provider>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { NLayout, NLayoutHeader, NLayoutContent, NLayoutSider, NMenu, NConfigProvider, darkTheme, NInputNumber } from 'naive-ui';
import CraftingCalculator from './components/CraftingCalculator.vue';
import MaterialCosts from './components/MaterialCosts.vue';
import MarketCalculator from './components/MarketCalculator.vue';
import { materialCosts } from './store';

const currentTool = ref('crafting');
const recipes = ref([]);
const materials = ref([]);
const craftingCostReductionPercent = ref(10);
const craftingTimeReductionPercent = ref(20);

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
];

const handleMenuSelect = (key) => {
  currentTool.value = key;
};

onMounted(async () => {
  try {
    const [recipesResponse, materialsResponse] = await Promise.all([
      fetch('/data/recipes.json'),
      fetch('/data/materials.json')
    ]);
    const recipesData = await recipesResponse.json();
    const materialsData = await materialsResponse.json();
    
    materials.value = materialsData;
    
    materialsData.forEach(material => {
      materialCosts[material.id] = material.pricePer100;
    });

    recipes.value = recipesData;

  } catch (error) {
    console.error('Failed to load data:', error);
  }
});
</script>

<style>
.reduction-inputs {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
