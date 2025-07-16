<template>
  <n-card>
    <n-collapse default-expanded-names="1">
      <n-collapse-item name="1">
        <template #header>
          <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.2em; font-weight: bold;">{{ title }}</span>
              <n-tooltip v-if="title === 'Trade Skill'" trigger="hover" placement="right" style="max-width: 250px;">
                <template #trigger>
                  <n-icon size="20" style="cursor: pointer;">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm-1-13h2v2h-2v-2zm0 4h2v6h-2v-6z"></path></svg>
                  </n-icon>
                </template>
                <div>
                  Enter or refresh prices.<br>
                  <b>Green Dot</b>: current price is cheapest<br>
                  <b>Yellow Dot</b>: exchange price is cheapest.<br>
                  Hover over the yellow dot to see the cheapest price and exchange path.
                </div>
              </n-tooltip>
            </div>
            <div style="display: flex; align-items: center;">
              <span v-if="formattedLastUpdated" style="font-size: 0.9em; color: #aaa; margin-right: 15px">
                Last Refreshed: {{ formattedLastUpdated }}
              </span>
              <n-select
                v-model:value="selectedRegion"
                :options="regionOptions"
                size="small"
                style="width: 100px; margin-right: 10px;"
                @click.stop
              />
              <n-button @click.stop="updateAllPrices(selectedRegion, materials, title)" size="small">Refresh</n-button>
            </div>
          </div>
        </template>
        <div class="table-container">
          <div class="material-costs-grid">
            <div v-for="(row, rowIndex) in layout" :key="rowIndex" class="material-row">
              <div v-for="group in row" :key="group.category" class="material-group">
                <div class="category-header">
                  <img :src="getCategoryIcon(group.category)" :alt="group.category" class="category-icon" />
                  <h3>{{ group.category }}</h3>
                </div>
                <div class="items-container" :style="group.columns ? { display: 'grid', 'grid-template-columns': `repeat(${group.columns}, 1fr)`, 'gap': '8px' } : {}">
                  <div v-for="itemId in group.items" :key="itemId" class="material-cost-item">
                    <n-tooltip trigger="hover" :disabled="!materialCosts.materials[itemId] || !materialCosts.materials[itemId].lastUpdated">
                      <template #trigger>
                        <div class="material-info">
                          <img :src="`/icons/${itemId}.webp`" :alt="getMaterial(itemId)?.name" class="material-icon" />
                          <span>{{ getMaterial(itemId)?.name }}</span>
                        </div>
                      </template>
                      <span v-if="materialCosts.materials[itemId] && materialCosts.materials[itemId].lastUpdated">
                        Last updated: {{ formatLastUpdated(materialCosts.materials[itemId].lastUpdated) }}
                      </span>
                    </n-tooltip>
                    <div class="price-input-container">
                      <InputNumber
                        v-if="materialCosts.materials[itemId]"
                        v-model:value="materialCosts.materials[itemId].marketPrice"
                        @update:value="onPriceUpdate"
                        :min="0"
                        :show-button="false"
                        :style="{ width: '100px' }"
                      />
                      <n-tooltip trigger="hover" :disabled="!isExchangeCheaper(itemId)">
                        <template #trigger>
                          <div class="source-indicator" :class="getIndicatorClass(itemId)"></div>
                        </template>
                        <div v-if="isExchangeCheaper(itemId)" class="tooltip-content">
                            <div>{{ materialCosts.materials[itemId].effectivePrice.toFixed(2) }}g</div>
                            <div class="tooltip-path">
                                <template v-for="(pathId, index) in materialCosts.materials[itemId].path" :key="pathId">
                                    <img :src="`/icons/${pathId}.webp`" class="tooltip-icon" />
                                    <span v-if="index < materialCosts.materials[itemId].path.length - 1" class="arrow-icon">→</span>
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
        </div>
      </n-collapse-item>
    </n-collapse>
  </n-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { NCard, NCollapse, NCollapseItem, NButton, NSelect, NTooltip, NIcon } from 'naive-ui';
import InputNumber from './InputNumber.vue';
import { materialCosts, updateAllPrices, saveMaterialCosts, recalculateEffectiveCosts, materialsList } from '../store';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  layout: {
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

const allItemIds = computed(() => props.layout.flatMap(row => row.flatMap(group => group.items)));

const materials = computed(() =>
  materialsList.filter(item => allItemIds.value.includes(item.id))
);

const getMaterial = (id) => materialsList.find(m => m.id === id);

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

const formatLastUpdated = (timestamp) => {
  if (!timestamp) return '';
  // The timestamp from the API is in seconds, but Date expects milliseconds.
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

watch(
  () => materialCosts.materials,
  () => {
    saveMaterialCosts();
  },
  { deep: true }
);

const formattedLastUpdated = computed(() => {
  const lastUpdated = materialCosts.lastUpdated[props.title];
  if (!lastUpdated) return '';
  const date = new Date(lastUpdated);
  return date.toLocaleString();
});

const getCategoryIcon = (category) => {
  const validIconCategories = ['foraging', 'logging', 'mining', 'hunting', 'fishing', 'excavating'];
  const categoryLower = category.toLowerCase();
  if (validIconCategories.includes(categoryLower)) {
    return `/icons/${categoryLower}.webp`;
  }
  // Fallback to a generated SVG placeholder with the first letter of the category
  const firstLetter = category.charAt(0).toUpperCase();
  const bgColor = '%23444'; // Darker grey for the background
  const textColor = '%23AAA'; // Lighter grey for the text
  return `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" style="fill: ${bgColor};"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" style="fill: ${textColor};">${firstLetter}</text></svg>`;
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
