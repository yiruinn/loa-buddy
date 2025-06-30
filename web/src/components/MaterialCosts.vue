<template>
  <n-collapse class="material-costs-collapse">
    <n-collapse-item title="Material Costs" name="1">
      <div class="material-costs-grid">
        <div class="material-row">
          <div v-for="group in topRowGroups" :key="group.category" class="material-group">
            <h3>{{ group.category }}</h3>
            <div v-for="item in group.items" :key="item.id" class="material-cost-item">
              <span>{{ item.name }}</span>
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
            <h3>{{ group.category }}</h3>
            <div v-for="item in group.items" :key="item.id" class="material-cost-item">
              <span>{{ item.name }}</span>
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
</template>

<script setup>
import { computed } from 'vue';
import { NCollapse, NCollapseItem, NInputNumber } from 'naive-ui';
import { materialCosts } from '../store';

const props = defineProps({
  materials: {
    type: Array,
    required: true,
  },
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
  'ancient_relic': 'Excavation',
  'rare_relic': 'Excavation',
  'abidos_relic': 'Excavation',
  'oreha_relic': 'Excavation',
  'relic': 'Excavation',
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
    'Excavation': { category: 'Excavation', items: [] },
  };
  
  props.materials.forEach(item => {
    const category = itemCategoryMapping[item.id];
    if (category && groups[category]) {
      groups[category].items.push(item);
    }
  });
  return Object.values(groups).filter(group => group.items.length > 0);
});

const topRowCategories = ['Fishing', 'Hunting', 'Excavation'];
const topRowGroups = computed(() => 
  groupedItems.value.filter(g => topRowCategories.includes(g.category))
);
const bottomRowGroups = computed(() => 
  groupedItems.value.filter(g => !topRowCategories.includes(g.category))
);
</script>

<style scoped>
.material-costs-collapse {
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

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

.material-cost-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
</style>