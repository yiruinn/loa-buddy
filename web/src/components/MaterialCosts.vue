<template>
  <n-card style="margin-bottom: 20px;">
    <n-collapse>
      <n-collapse-item name="1">
        <template #header>
          <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
            <span style="font-size: 1.2em; font-weight: bold;">Material Costs</span>
            <span v-if="formattedLastUpdated" style="font-size: 0.9em; color: #aaa; margin-right: 15px">
              Last Updated: {{ formattedLastUpdated }}
            </span>
          </div>
        </template>
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
                <n-input-number
                  v-model:value="materialCosts[item.id]"
                  :min="0"
                  :show-button="false"
                  :style="{ width: '100px' }"
                />
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
                <n-input-number
                  v-model:value="materialCosts[item.id]"
                  :min="0"
                  :show-button="false"
                  :style="{ width: '100px' }"
                />
              </div>
            </div>
          </div>
        </div>
      </n-collapse-item>
    </n-collapse>
  </n-card>
</template>

<script setup>
import { computed } from 'vue';
import { NCard, NInputNumber, NCollapse, NCollapseItem } from 'naive-ui';
import { materialCosts } from '../store';

const props = defineProps({
  materials: {
    type: Array,
    required: true,
  },
  lastUpdated: {
    type: String,
    default: '',
  },
});

const formattedLastUpdated = computed(() => {
  if (!props.lastUpdated) return '';
  const date = new Date(props.lastUpdated);
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
.material-costs-grid {
  padding: 16px;
}

.material-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.material-group {
  flex: 1;
  padding: 0 12px;
}

.material-group h3 {
  margin-bottom: 12px;
  font-size: 16px;
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
</style>