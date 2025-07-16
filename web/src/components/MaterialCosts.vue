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
              <span v-if="formattedLatestMaterialUpdate" style="font-size: 0.9em; color: #aaa; margin-right: 15px;">
                Last Updated: {{ formattedLatestMaterialUpdate }}
              </span>
              <n-select
                v-model:value="selectedRegion"
                :options="regionOptions"
                size="small"
                style="width: 100px; margin-right: 10px;"
                @click.stop
              />
              <n-tooltip trigger="hover" :disabled="!lastRefreshedRelative">
                <template #trigger>
                  <n-button @click.stop="updateAllPrices(selectedRegion, materials, title)" size="small">Refresh</n-button>
                </template>
                <span>
                  Last Refreshed: <span style="font-weight: bold;">{{ lastRefreshedRelative }}</span>
                </span>
              </n-tooltip>
            </div>
          </div>
        </template>
        <div class="table-container">
          <div class="material-costs-grid">
            <div v-for="(row, rowIndex) in layout" :key="rowIndex" class="material-row">
              <div v-for="group in row" :key="group.category" class="material-group">
                <div class="category-header">
                  <img v-if="isUrl(getCategoryIcon(group.category))" :src="getCategoryIcon(group.category)" :alt="group.category" class="category-icon" />
                  <n-icon v-else size="22">
                    <component :is="getCategoryIcon(group.category)" />
                  </n-icon>
                  <h3>{{ group.category }}</h3>
                </div>
                <div class="items-container" :style="group.columns ? { display: 'grid', 'grid-template-columns': `repeat(${group.columns}, 1fr)`, 'gap': '8px' } : {}">
                  <div v-for="itemId in group.items" :key="itemId" class="material-cost-item">
                    <div class="material-info">
                      <img v-if="itemIconExists(itemId)" :src="`/icons/${itemId}.webp`" :alt="getMaterial(itemId)?.name" class="material-icon" />
                      <n-icon v-else size="18">
                        <component :is="getLetterIcon(getMaterial(itemId)?.name)" />
                      </n-icon>
                      <span>{{ getMaterial(itemId)?.name }}</span>
                      <n-tooltip v-if="isOutdated(itemId)" trigger="hover">
                        <template #trigger>
                          <n-icon size="16" :color="'#d9534f'" style="margin-left: 4px; cursor: help;">
                            <Warning />
                          </n-icon>
                        </template>
                        <span>Last updated: {{ formatLastUpdated(materialCosts.materials[itemId].lastUpdated) }}</span>
                      </n-tooltip>
                    </div>
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
import { ref, computed, watch, onMounted, onUnmounted, h } from 'vue';
import { NCard, NCollapse, NCollapseItem, NButton, NSelect, NTooltip, NIcon } from 'naive-ui';
import InputNumber from './InputNumber.vue';
import { materialCosts, updateAllPrices, saveMaterialCosts, recalculateEffectiveCosts, materialsList } from '../store';

import { Warning } from '@vicons/ionicons5';
import { LetterA, LetterB, LetterC, LetterD, LetterE, LetterF, LetterG, LetterH, LetterI, LetterJ, LetterK, LetterL, LetterM, LetterN, LetterO, LetterP, LetterQ, LetterR, LetterS, LetterT, LetterU, LetterV, LetterW, LetterX, LetterY, LetterZ } from '@vicons/tabler';

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

const isOutdated = (itemId) => {
  const itemTimestamp = materialCosts.materials[itemId]?.lastUpdated;
  if (!itemTimestamp || !latestMaterialUpdate.value) {
    return false;
  }
  // Compare timestamps, ensuring we don't flag items that are updated at the same time
  return itemTimestamp < latestMaterialUpdate.value;
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

const currentTime = ref(Date.now());

onMounted(() => {
  const interval = setInterval(() => {
    currentTime.value = Date.now();
  }, 1000); // Update every second

  onUnmounted(() => {
    clearInterval(interval);
  });
});

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  const now = currentTime.value;
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 5) {
    return "just now";
  }

  if (seconds < 60) {
    return `${seconds} seconds ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const lastRefreshedRelative = computed(() => {
  const lastUpdated = materialCosts.lastUpdated[props.title];
  if (!lastUpdated) return '';
  // By depending on currentTime, this computed property will re-evaluate every second
  return formatTimeAgo(lastUpdated, currentTime.value);
});

const latestMaterialUpdate = computed(() => {
  const timestamps = allItemIds.value
    .map(id => materialCosts.materials[id]?.lastUpdated)
    .filter(Boolean);
  if (timestamps.length === 0) return null;
  // The timestamps are in seconds, so we can use Math.max directly.
  return Math.max(...timestamps);
});

const formattedLatestMaterialUpdate = computed(() => {
  if (!latestMaterialUpdate.value) return '';
  // The timestamp from the API is in seconds, but Date expects milliseconds.
  const date = new Date(latestMaterialUpdate.value * 1000);
  return date.toLocaleString();
});

const letterIcons = { A: LetterA, B: LetterB, C: LetterC, D: LetterD, E: LetterE, F: LetterF, G: LetterG, H: LetterH, I: LetterI, J: LetterJ, K: LetterK, L: LetterL, M: LetterM, N: LetterN, O: LetterO, P: LetterP, Q: LetterQ, R: LetterR, S: LetterS, T: LetterT, U: LetterU, V: LetterV, W: LetterW, X: LetterX, Y: LetterY, Z: LetterZ };

const getCategoryIcon = (category) => {
  const validIconCategories = ['foraging', 'logging', 'mining', 'hunting', 'fishing', 'excavating'];
  const categoryLower = category.toLowerCase();
  if (validIconCategories.includes(categoryLower)) {
    return `/icons/${categoryLower}.webp`;
  }
  const firstLetter = category.charAt(0).toUpperCase();
  const icon = letterIcons[firstLetter];
  return icon ? () => h(icon) : null;
};

const isUrl = (value) => {
  return typeof value === 'string' && value.startsWith('/');
}

const existingIcons = new Set([
  'abidos_fusion_material.webp', 'abidos_iron_ore.webp', 'abidos_relic.webp',
  'abidos_solar_carp.webp', 'abidos_thick_raw_meat.webp', 'abidos_timber.webp',
  'abidos_wild_flower.webp', 'ancient_relic.webp', 'aura.webp',
  'bright_wild_flower.webp', 'excavating.webp', 'excavating_powder.webp',
  'fish.webp', 'fishing.webp', 'fishing_powder.webp', 'foraging.webp',
  'gathering_powder.webp', 'gold.webp', 'heavy_iron_ore.webp', 'hunting.webp',
  'hunting_powder.webp', 'iron_ore.webp', 'logging.webp', 'logging_powder.webp',
  'mining.webp', 'mining_powder.webp', 'oreha_fusion_material.webp',
  'oreha_relic.webp', 'oreha_solar_carp.webp', 'oreha_thick_meat.webp',
  'prime_oreha_fusion_material.webp', 'rare_relic.webp', 'redflesh_fish.webp',
  'shy_wild_flower.webp', 'strong_iron_ore.webp', 'sturdy_timber.webp',
  'superior_oreha_fusion_material.webp', 'tender_timber.webp',
  'thick_raw_meat.webp', 'timber.webp', 'treated_meat.webp', 'wild_flower.webp'
]);

const itemIconExists = (itemId) => {
  return existingIcons.has(`${itemId}.webp`);
};

const getLetterIcon = (name) => {
  if (!name) return null;
  const match = name.match(/[a-zA-Z]/);
  if (!match) return null; // Or return a default icon if you have one
  const firstLetter = match[0].toUpperCase();
  const icon = letterIcons[firstLetter];
  return icon ? () => h(icon) : null;
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
