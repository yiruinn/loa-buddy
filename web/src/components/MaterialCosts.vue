<template>
  <n-card style="margin-bottom: 20px;">
    <n-collapse default-expanded-names="1">
      <n-collapse-item name="1">
        <template #header>
          <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
            <span style="font-size: 1.2em; font-weight: bold;">Material Costs</span>
            <div style="display: flex; align-items: center;">
              <span v-if="formattedLastUpdated" style="font-size: 0.9em; color: #aaa; margin-right: 15px">
                Last Updated: {{ formattedLastUpdated }}
              </span>
              <n-select
                v-model:value="selectedRegion"
                :options="regionOptions"
                size="small"
                style="width: 100px; margin-right: 10px;"
                @click.stop
              />
              <n-button @click.stop="updateAllPrices(selectedRegion, displayableMaterials)" size="small">Refresh</n-button>
            </div>
          </div>
        </template>
        <div class="table-container">
          <div class="material-costs-grid">
            <div class="material-row">
              <div v-for="group in topRowGroups" :key="group.category" class="material-group">
                <div class="category-header">
                  <img :src="getCategoryIcon(group.category)" :alt="group.category" class="category-icon" />
                  <h3>{{ group.category }}</h3>
                </div>
                <div v-for="item in group.items" :key="item.id" class="material-cost-item">
                  <div class="material-info">
                    <img :src="`/icons/${item.id}.webp`" :alt="item.name" class="material-icon" />
                    <span>{{ item.name }}</span>
                  </div>
                  <div class="price-input-container">
                    <n-input-number
                      v-if="materialCosts.materials[item.id]"
                      v-model:value="materialCosts.materials[item.id].marketPrice"
                      @update:value="onPriceUpdate"
                      :min="0"
                      :show-button="false"
                      :style="{ width: '100px' }"
                    />
                    <n-tooltip trigger="hover" :disabled="!isExchangeCheaper(item.id)">
                      <template #trigger>
                        <div class="source-indicator" :class="getIndicatorClass(item.id)"></div>
                      </template>
                      <div v-if="isExchangeCheaper(item.id)" class="tooltip-content">
                          <div>{{ materialCosts.materials[item.id].effectivePrice.toFixed(2) }}g</div>
                          <div class="tooltip-path">
                              <template v-for="(pathId, index) in materialCosts.materials[item.id].path" :key="pathId">
                                  <img :src="`/icons/${pathId}.webp`" class="tooltip-icon" />
                                  <span v-if="index < materialCosts.materials[item.id].path.length - 1" class="arrow-icon">→</span>
                              </template>
                          </div>
                      </div>
                    </n-tooltip>
                  </div>
                </div>
              </div>
            </div>
            <div class="material-row">
              <div v-for="group in bottomRowGroups" :key="group.category" class="material-group">
                <div class="category-header">
                  <img :src="getCategoryIcon(group.category)" :alt="group.category" class="category-icon" />
                  <h3>{{ group.category }}</h3>
                </div>
                <div v-for="item in group.items" :key="item.id" class="material-cost-item">
                  <div class="material-info">
                    <img :src="`/icons/${item.id}.webp`" :alt="item.name" class="material-icon" />
                    <span>{{ item.name }}</span>
                  </div>
                  <div class="price-input-container">
                    <n-input-number
                      v-if="materialCosts.materials[item.id]"
                      v-model:value="materialCosts.materials[item.id].marketPrice"
                      @update:value="onPriceUpdate"
                      :min="0"
                      :show-button="false"
                      :style="{ width: '100px' }"
                    />
                    <n-tooltip trigger="hover" :disabled="!isExchangeCheaper(item.id)">
                      <template #trigger>
                        <div class="source-indicator" :class="getIndicatorClass(item.id)"></div>
                      </template>
                      <div v-if="isExchangeCheaper(item.id)" class="tooltip-content">
                          <div>{{ materialCosts.materials[item.id].effectivePrice.toFixed(2) }}g</div>
                          <div class="tooltip-path">
                              <template v-for="(pathId, index) in materialCosts.materials[item.id].path" :key="pathId">
                                  <img :src="`/icons/${pathId}.webp`" class="tooltip-icon" />
                                  <span v-if="index < materialCosts.materials[item.id].path.length - 1" class="arrow-icon">→</span>
                              </template>
                          </div>
                      </div>
                    </n-tooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </n-collapse-item>
    </n-collapse>
  </n-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { NCard, NInputNumber, NCollapse, NCollapseItem, NButton, NSelect, NTooltip } from 'naive-ui';
import { materialCosts, updateAllPrices, saveMaterialCosts, recalculateEffectiveCosts, materialsList } from '../store';

const selectedRegion = ref(materialCosts.region);
const regionOptions = [
  { label: 'NAW', value: 'naw' },
  { label: 'NAE', value: 'nae' },
  { label: 'EUC', value: 'euc' },
];

const displayableItemIds = [
  'wild_flower', 'shy_wild_flower', 'bright_wild_flower', 'abidos_wild_flower',
  'timber', 'tender_timber', 'sturdy_timber', 'abidos_timber',
  'iron_ore', 'heavy_iron_ore', 'strong_iron_ore', 'abidos_iron_ore',
  'thick_raw_meat', 'treated_meat', 'oreha_thick_meat', 'abidos_thick_raw_meat',
  'fish', 'redflesh_fish', 'oreha_solar_carp', 'abidos_solar_carp',
  'ancient_relic', 'rare_relic', 'oreha_relic', 'abidos_relic'
];

const displayableMaterials = computed(() => 
  materialsList.filter(item => displayableItemIds.includes(item.id))
    .sort((a, b) => displayableItemIds.indexOf(a.id) - displayableItemIds.indexOf(b.id))
);

const isExchangeCheaper = (itemId) => {
    const mat = materialCosts.materials[itemId];
    return mat && mat.source === 'exchange';
};

const getIndicatorClass = (itemId) => {
    if (isExchangeCheaper(itemId)) {
        return 'source-exchange-available'; // Yellow
    }
    return 'source-lowest'; // Green
};

const onPriceUpdate = () => {
    recalculateEffectiveCosts();
};

watch(
  () => materialCosts.materials,
  () => {
    saveMaterialCosts();
  },
  { deep: true }
);

const formattedLastUpdated = computed(() => {
  if (!materialCosts.lastUpdated) return '';
  const date = new Date(materialCosts.lastUpdated);
  return date.toLocaleString();
});

const groupedItems = computed(() => {
  const groups = {};
  
  displayableMaterials.value.forEach(item => {
    if (item.mainCategory === 'trade_skill') {
      const categoryName = item.category.charAt(0).toUpperCase() + item.category.slice(1);
      if (!groups[categoryName]) {
        groups[categoryName] = { category: categoryName, items: [] };
      }
      groups[categoryName].items.push(item);
    }
  });

  return Object.values(groups).filter(group => group.items.length > 0);
});

const topRowCategories = ['Hunting', 'Fishing', 'Excavating'];
const bottomRowOrder = ['Foraging', 'Logging', 'Mining'];
const topRowGroups = computed(() => 
  groupedItems.value
    .filter(g => topRowCategories.includes(g.category))
    .sort((a, b) => topRowCategories.indexOf(a.category) - topRowCategories.indexOf(b.category))
);
const bottomRowGroups = computed(() => 
  groupedItems.value
    .filter(g => !topRowCategories.includes(g.category))
    .sort((a, b) => bottomRowOrder.indexOf(a.category) - bottomRowOrder.indexOf(b.category))
);

const getCategoryIcon = (category) => {
  return `/icons/${category.toLowerCase()}.webp`;
};
</script>

<style scoped>
.table-container {
  overflow-x: auto;
}

.material-costs-grid {
  padding: 16px;
  min-width: 900px; /* Reduced from 1100px */
}

.material-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.material-group {
  flex: 1;
  min-width: 300px; /* Reduced from 350px */
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.category-header h3 {
  margin: 0;
}

.category-icon {
  width: 24px;
  height: 24px;
}

.material-cost-item {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  white-space: nowrap;
}

.material-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.material-icon {
  width: 24px;
  height: 24px;
}

.price-input-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.source-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.source-lowest {
  background-color: #63e2b7; /* Green */
}

.source-exchange-available {
  background-color: #e2d463; /* Yellow */
  cursor: help;
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.tooltip-path {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tooltip-icon {
  width: 20px;
  height: 20px;
}

.arrow-icon {
    font-size: 16px;
    color: #fff;
}
</style>
