<template>
  <n-config-provider :theme="darkTheme">
    <n-layout style="height: 100vh">
      <n-layout-header bordered style="height: 64px; padding: 16px">
        <router-link :to="{ name: 'home' }" style="text-decoration: none; color: inherit;">
          <h1 style="margin: 0">LOA Buddy</h1>
        </router-link>
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
            :default-expanded-keys="['tools']"
          />
        </n-layout-sider>

        <n-layout-content style="padding: 24px;">
          <div v-if="currentTool === 'crafting'">
            <n-card style="margin-bottom: 20px;">
              <n-collapse :default-expanded-names="['1']">
                <n-collapse-item name="1">
                  <template #header>
                    <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                      <span style="font-size: 1.2em; font-weight: bold;">Crafting Reductions</span>
                      <n-switch v-model:value="useLowestPrice" @click.stop>
                        <template #checked>
                          Use Lowest Price
                        </template>
                        <template #unchecked>
                          Use Market Price
                        </template>
                      </n-switch>
                    </div>
                  </template>
                  <div class="reduction-inputs">
                    <div class="category-group">
                      <h3>General</h3>
                      <div class="input-group">
                        <span>Cost Reduction (%)</span>
                        <n-input-number v-model:value="craftingReductions.general.cost" :min="0" :max="100" :show-button="false" />
                      </div>
                      <div class="input-group">
                        <span>Time Reduction (%)</span>
                        <n-input-number v-model:value="craftingReductions.general.time" :min="0" :max="100" :show-button="false" />
                      </div>
                    </div>
                    <div class="category-group">
                      <h3>Battle Items</h3>
                      <div class="input-group">
                        <span>Cost Reduction (%)</span>
                        <n-input-number v-model:value="craftingReductions.battleItems.cost" :min="0" :max="100" :show-button="false" />
                      </div>
                      <div class="input-group">
                        <span>Time Reduction (%)</span>
                        <n-input-number v-model:value="craftingReductions.battleItems.time" :min="0" :max="100" :show-button="false" />
                      </div>
                    </div>
                    <div class="category-group">
                      <h3>Cooking</h3>
                      <div class="input-group">
                        <span>Cost Reduction (%)</span>
                        <n-input-number v-model:value="craftingReductions.cooking.cost" :min="0" :max="100" :show-button="false" />
                      </div>
                      <div class="input-group">
                        <span>Time Reduction (%)</span>
                        <n-input-number v-model:value="craftingReductions.cooking.time" :min="0" :max="100" :show-button="false" />
                      </div>
                    </div>
                    <div class="category-group">
                      <h3>Special</h3>
                      <div class="input-group">
                        <span>Cost Reduction (%)</span>
                        <n-input-number v-model:value="craftingReductions.special.cost" :min="0" :max="100" :show-button="false" />
                      </div>
                      <div class="input-group">
                        <span>Time Reduction (%)</span>
                        <n-input-number v-model:value="craftingReductions.special.time" :min="0" :max="100" :show-button="false" />
                      </div>
                    </div>
                  </div>
                </n-collapse-item>
              </n-collapse>
            </n-card>
          </div>
          <router-view
            :recipes="recipes"
            :materials="materials"
            :crafting-reductions="craftingReductions"
            :use-lowest-price="useLowestPrice"
            style="margin-bottom: 20px;"
          />
        </n-layout-content>
      </n-layout>
    </n-layout>
  </n-config-provider>
</template>

<script setup>
import { ref, onMounted, reactive, watch, h, computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { NLayout, NLayoutHeader, NLayoutContent, NLayoutSider, NMenu, NConfigProvider, darkTheme, NInputNumber, NCard, NCollapse, NCollapseItem, NSwitch } from 'naive-ui';

const route = useRoute();
const currentTool = computed(() => route.name);

const recipes = ref([]);
const materials = ref([]);
const useLowestPrice = ref(false);
const craftingReductions = reactive({
  general: { cost: 0, time: 0 },
  battleItems: { cost: 0, time: 0 },
  cooking: { cost: 0, time: 0 },
  special: { cost: 0, time: 0 },
});

watch(craftingReductions, (newValue) => {
  localStorage.setItem('craftingReductions', JSON.stringify(newValue));
});

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
      },
      {
        label: () => h(RouterLink, { to: { name: 'materials' } }, { default: () => 'Material Prices' }),
        key: 'materials'
      }
    ]
  },
  {
    label: () => h(RouterLink, { to: { name: 'blacklist' } }, { default: () => 'Blacklist' }),
    key: 'blacklist'
  }
];

onMounted(async () => {
  const savedReductions = localStorage.getItem('craftingReductions');
  if (savedReductions) {
    Object.assign(craftingReductions, JSON.parse(savedReductions));
  }

  try {
    const [recipesResponse, materialsResponse] = await Promise.all([
      fetch('/data/recipes.json'),
      fetch('/data/materials.json')
    ]);
    const recipesData = await recipesResponse.json();
    const materialsData = await materialsResponse.json();
    
    materials.value = materialsData.materials;
    recipes.value = recipesData;

  } catch (error) {
    console.error('Failed to load data:', error);
  }
});
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
