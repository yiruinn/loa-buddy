<template>
  <n-card>
    <n-collapse :default-expanded-names="['special', 'battle', 'cooking']">
      <n-collapse-item v-for="(group, type) in groupedRecipes" :key="type" :name="type">
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <h2 class="group-header-title">{{ type.charAt(0).toUpperCase() + type.slice(1) }}</h2>
            <div v-if="type === 'special'" style="display: flex; align-items: center;" @click.stop>
              <span style="margin-right: 10px;">Row Multiplier:</span>
              <n-select
                v-model:value="craftingSlots"
                :options="craftingSlotOptions"
                size="small"
                :style="{ width: '80px' }"
              />
            </div>
          </div>
        </template>
        <div class="table-container">
          <n-table :bordered="false" :single-line="false" class="custom-table">
            <thead>
              <tr>
                <th style="width: 320px">Recipe</th>
                <th style="width: 100px">Gold</th>
                <th style="width: 120px">Total Cost</th>
                <th style="width: 120px">Unit Price</th>
                <th style="width: 120px">Selling Price</th>
                <th style="width: 120px">Net Profit (taxed)</th>
                <th style="width: 120px">Craft Time</th>
                <th style="width: 120px">Profit/Hour</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="recipe in group" :key="recipe.name">
                <td>
                  <n-select
                    :value="selectedCategories[getRecipeIndex(recipe)]"
                    :options="getSortedMaterialOptions(recipe)"
                    @update:value="category => updateMaterial(getRecipeIndex(recipe), category)"
                    placeholder="Select Material"
                    class="material-select"
                    :disabled="recipe.materialOptions.length <= 1"
                    :render-tag="({ option }) => renderSelectTag(recipe, option)"
                  />
                </td>
                <td>{{ getAdjustedCraftingCost(recipe) }}</td>
                <td>
                  <n-tooltip trigger="hover">
                    <template #trigger>
                      <span>{{ getTotalCost(recipe, getRecipeIndex(recipe)).toFixed(2) }}g</span>
                    </template>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                      <div v-for="(line, i) in getCostBreakdown(recipe, getRecipeIndex(recipe))" :key="i" style="display: grid; grid-template-columns: auto auto; justify-content: start; align-items: center; gap: 8px;">
                        <div style="display: flex; align-items: center; justify-content: flex-start; gap: 8px;">
                          <n-tooltip trigger="hover">
                            <template #trigger>
                              <div class="source-indicator" :class="getIndicatorClass(line)"></div>
                            </template>
                            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                              <span>{{ line.materialPrice }}g</span>
                              <div v-if="isExchangeCheaper(line)" style="display: flex; align-items: center; gap: 4px;">
                                <template v-for="(pathId, i) in line.path" :key="pathId">
                                  <img :src="`/icons/${pathId}.webp`" style="width: 24px; height: 24px;" />
                                  <span v-if="i < line.path.length - 1" style="font-size: 16px; color: #fff;">→</span>
                                </template>
                              </div>
                            </div>
                          </n-tooltip>
                          <img :src="line.icon" style="width: 24px; height: 24px;" />
                        </div>
                        <div style="font-weight: bold;">
                          {{ line.totalCost }}g
                        </div>
                      </div>
                    </div>
                  </n-tooltip>
                </td>
                <td :class="getUnitPriceClass(recipe, getRecipeIndex(recipe))">{{ getUnitPrice(recipe, getRecipeIndex(recipe)) }}</td>
                <td>
                  <InputNumber
                    v-model:value="recipe.sellingPrice"
                    :min="0"
                    :show-button="false"
                    :style="{ width: '100px' }"
                  />
                </td>
                <td :class="getProfitClass(recipe, getRecipeIndex(recipe))">{{ getProfit(recipe, getRecipeIndex(recipe)) }}</td>
                <td>{{ getAdjustedCraftingTime(recipe) }}</td>
                <td :class="getProfitClass(recipe, getRecipeIndex(recipe))">{{ getProfitPerHour(recipe, getRecipeIndex(recipe)) }}</td>
              </tr>
            </tbody>
          </n-table>
        </div>
      </n-collapse-item>
    </n-collapse>
  </n-card>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import InputNumber from './InputNumber.vue';
import {
  NCard, NTable, NSelect, NCollapse, NCollapseItem, NTooltip
} from 'naive-ui';
import { materialCosts, materialsList } from '../store';

const props = defineProps({
  recipes: {
    type: Array,
    required: true,
  },
  materials: {
    type: Array,
    required: true,
  },
  craftingReductions: {
    type: Object,
    required: true,
  },
  useLowestPrice: {
    type: Boolean,
    required: true,
  },
  enableGreatSuccess: {
    type: Boolean,
    required: true,
  }
});

const craftingSlots = ref(1);
const craftingSlotOptions = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
];
const selectedCategories = ref([]);

const groupedRecipes = computed(() => {
  const groupOrder = ['special', 'battle', 'cooking', 'uncategorized'];
  const groups = props.recipes.reduce((acc, recipe) => {
    const type = recipe.type || 'uncategorized';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(recipe);
    return acc;
  }, {});

  const orderedGroups = {};
  for (const type of groupOrder) {
    if (groups[type]) {
      orderedGroups[type] = groups[type];
    }
  }

  return orderedGroups;
});

const getRecipeIndex = (recipe) => {
  return props.recipes.findIndex(r => r.name === recipe.name);
};

const getAdjustedCraftingCost = (recipe) => {
  const categoryReduction = props.craftingReductions[recipe.type]?.cost || 0;
  const totalReduction = props.craftingReductions.general.cost + categoryReduction;
  return Math.floor(recipe.craftingCost * (1 - totalReduction / 100));
};

const getAdjustedCraftingTime = (recipe) => {
  const categoryReduction = props.craftingReductions[recipe.type]?.time || 0;
  const totalReduction = props.craftingReductions.general.time + categoryReduction;
  return (recipe.craftingTime * (1 - totalReduction / 100)).toFixed(2);
};

const getGreatSuccessChance = (recipe) => {
  if (!props.enableGreatSuccess) {
    return 0;
  }
  const BASE_RATE = 5;
  const generalBonus = props.craftingReductions.general.greatSuccess || 0;
  const categoryBonus = props.craftingReductions[recipe.type]?.greatSuccess || 0;
  
  const finalChance = BASE_RATE * (1 + (generalBonus / 100) + (categoryBonus / 100));
  return finalChance;
}

const calculateMaterialCost = (items) => {
  return items.reduce((sum, item) => {
    const priceKey = props.useLowestPrice ? 'effectivePrice' : 'marketPrice';
    const cost = materialCosts.materials[item.id]?.[priceKey] || 0;
    return sum + (item.quantity * cost) / 100;
  }, 0);
};

const getCostBreakdown = (recipe, index) => {
  const selectedCategory = selectedCategories.value[index];
  const selectedOption = recipe.materialOptions.find(o => o.category === selectedCategory);
  const priceKey = props.useLowestPrice ? 'effectivePrice' : 'marketPrice';

  const materialDetails = selectedOption.items.map(item => {
    const materialData = materialCosts.materials[item.id];
    const materialPrice = materialData?.[priceKey] || 0;
    const unitPrice = materialPrice / 100;
    const totalCost = item.quantity * unitPrice;
    const iconPath = `/icons/${item.id}.webp`;
    return {
      materialPrice: materialPrice.toFixed(2),
      totalCost: totalCost.toFixed(2),
      icon: iconPath,
      source: materialData?.source,
      path: materialData?.path
    };
  });

  const craftingCost = getAdjustedCraftingCost(recipe);
  const breakdown = [
    ...materialDetails,
    {
      materialPrice: (1).toFixed(2),
      totalCost: craftingCost.toFixed(2),
      icon: '/icons/gold.webp'
    }
  ];

  return breakdown;
};

const getSortedMaterialOptions = (recipe) => {
  const adjustedGoldCost = getAdjustedCraftingCost(recipe);
  return recipe.materialOptions
    .map(option => {
      const materialCost = calculateMaterialCost(option.items);
      const totalCost = materialCost + adjustedGoldCost;
      return {
        ...option,
        cost: totalCost,
      };
    })
    .sort((a, b) => a.cost - b.cost)
    .map(option => ({
      label: `${option.category} - ${option.cost.toFixed(2)}g`,
      value: option.category,
    }));
};

const updateMaterial = (index, category) => {
  selectedCategories.value[index] = category;
};

const getTotalCost = (recipe, index) => {
  const selectedCategory = selectedCategories.value[index];
  const selectedOption = recipe.materialOptions.find(o => o.category === selectedCategory);
  const itemsCost = selectedOption ? calculateMaterialCost(selectedOption.items) : 0;
  return itemsCost + getAdjustedCraftingCost(recipe);
};

const getUnitPrice = (recipe, index) => {
  const greatSuccessChance = getGreatSuccessChance(recipe) / 100;
  const effectiveQuantity = recipe.quantity * (1 + greatSuccessChance);
  return (getTotalCost(recipe, index) / effectiveQuantity).toFixed(2);
}

const calculateTax = (sellingPrice) => Math.ceil(sellingPrice * 0.05);

const getProfit = (recipe, index) => {
  const totalCost = getTotalCost(recipe, index);
  const greatSuccessChance = getGreatSuccessChance(recipe) / 100;
  const effectiveQuantity = recipe.quantity * (1 + greatSuccessChance);
  const tax = calculateTax(recipe.sellingPrice);
  const netSellPrice = recipe.sellingPrice - tax;
  const netIncome = effectiveQuantity * netSellPrice;
  const totalProfit = netIncome - totalCost;
  return totalProfit.toFixed(2);
};

const getProfitPerHour = (recipe, index) => {
  const totalProfit = parseFloat(getProfit(recipe, index));
  const timeInHours = parseFloat(getAdjustedCraftingTime(recipe)) / 60;
  return ((totalProfit * craftingSlots.value) / timeInHours).toFixed(2);
};

const getProfitClass = (recipe, index) => {
  const profit = parseFloat(getProfit(recipe, index));
  if (profit > 0) {
    return 'profit';
  } else if (profit < 0) {
    return 'loss';
  }
  return '';
};

const getUnitPriceClass = (recipe, index) => {
  const unitPrice = parseFloat(getUnitPrice(recipe, index));
  const sellingPrice = recipe.sellingPrice;
  if (unitPrice < sellingPrice) {
    return 'profit';
  } else if (unitPrice > sellingPrice) {
    return 'loss';
  }
  return '';
};

const isExchangeCheaper = (line) => {
  return props.useLowestPrice && line.source === 'exchange';
};

const getIndicatorClass = (line) => {
  if (isExchangeCheaper(line)) {
    return 'source-exchange-available';
  }
  return 'source-lowest';
};

const initializeCategories = () => {
  selectedCategories.value = props.recipes.map(recipe => {
    const sortedOptions = getSortedMaterialOptions(recipe);
    return sortedOptions.length > 0 ? sortedOptions[0].value : null;
  });
};

const renderSelectTag = (recipe, option) => {
  if (recipe.materialOptions.length === 1) {
    return recipe.name;
  }
  return `${recipe.name} (${option.value})`;
};

onMounted(() => {
  initializeCategories();
  const savedCraftingSlots = localStorage.getItem('craftingSlots');
  if (savedCraftingSlots) {
    craftingSlots.value = JSON.parse(savedCraftingSlots);
  }
});

watch(craftingSlots, (newValue) => {
  localStorage.setItem('craftingSlots', JSON.stringify(newValue));
});

watch(() => [
  props.recipes,
  props.craftingReductions,
  props.useLowestPrice,
  props.enableGreatSuccess,
], initializeCategories, { deep: true });
</script>

<style scoped>
.group-header-title {
  margin: 0;
  font-size: 1.2em;
  font-weight: bold;
}
.material-select {
  width: 300px;
}

.material-select:deep(.n-base-selection.n-base-selection--disabled) {
  opacity: 1;
  background-color: #2d2d30;
  cursor: default;
}

.material-select:deep(.n-base-selection.n-base-selection--disabled .n-base-selection-input) {
  color: #fff !important;
}

.table-container {
  overflow-x: auto;
  width: 100%;
}

.n-table.custom-table th,
.n-table.custom-table td {
  padding: 8px 12px;
  white-space: nowrap;
}

.n-input-number {
  width: 100px;
}

.profit {
  color: #63e2b7;
}

.loss {
  color: #e88080;
}

.source-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.source-lowest {
  background-color: #63e2b7; /* Green */
  cursor: pointer;
}

.source-exchange-available {
  background-color: #e2d463; /* Yellow */
  cursor: pointer;
}
</style>
