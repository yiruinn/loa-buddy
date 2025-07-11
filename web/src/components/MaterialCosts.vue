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
              <n-button @click.stop="updateAllPrices(selectedRegion)" size="small">Refresh</n-button>
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
import { materialCosts, updateAllPrices, saveMaterialCosts, recalculateEffectiveCosts } from '../store';

const props = defineProps({
  materials: {
    type: Array,
    required: true,
  },
});

const selectedRegion = ref(materialCosts.region);
const regionOptions = [
  { label: 'NAW', value: 'naw' },
  { label: 'NAE', value: 'nae' },
  { label: 'EUC', value: 'euc' },
];

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

const itemCategoryMapping = {
  'fish': 'Fishing',
  'redflesh_fish': 'Fishing',
  'abidos_solar_carp': 'Fishing',
  'oreha_solar_carp': 'Fishing',
  'meat': 'Hunting',
  'treated_meat': 'Hunting',
  'abidos_thick_raw_meat': 'Hunting',
  'oreha_thick_meat': 'Hunting',
  'thick_raw_meat': 'Hunting',
  'ancient_relic': 'Excavating',
  'rare_relic': 'Excavating',
  'abidos_relic': 'Excavating',
  'oreha_relic': 'Excavating',
  'relic': 'Excavating',
  'wild_flower': 'Foraging',
  'shy_wild_flower': 'Foraging',
  'abidos_wild_flower': 'Foraging',
  'bright_wild_flower': 'Foraging',
  'flower': 'Foraging',
  'timber': 'Logging',
  'tender_timber': 'Logging',
  'abidos_timber': 'Logging',
  'sturdy_timber': 'Logging',
  'iron_ore': 'Mining',
  'heavy_iron_ore': 'Mining',
  'abidos_iron_ore': 'Mining',
  'strong_iron_ore': 'Mining',
  'ore': 'Mining',
};

const groupedItems = computed(() => {
  const groups = {
    'Logging': { category: 'Logging', items: [] },
    'Foraging': { category: 'Foraging', items: [] },
    'Mining': { category: 'Mining', items: [] },
    'Hunting': { category: 'Hunting', items: [] },
    'Fishing': { category: 'Fishing', items: [] },
    'Excavating': { category: 'Excavating', items: [] },
  };
  
  props.materials.forEach(item => {
    const category = itemCategoryMapping[item.id];
    if (category && groups[category]) {
      groups[category].items.push(item);
    }
  });
  return Object.values(groups).filter(group => group.items.length > 0);
});

const topRowCategories = ['Fishing', 'Hunting', 'Excavating'];
const topRowGroups = computed(() => 
  groupedItems.value.filter(g => topRowCategories.includes(g.category))
);
const bottomRowGroups = computed(() => 
  groupedItems.value.filter(g => !topRowCategories.includes(g.category))
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
