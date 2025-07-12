<template>
  <n-card>
    <n-collapse :default-expanded-names="['special', 'battle', 'cooking']">
      <n-collapse-item v-for="(group, type) in groupedRecipes" :key="type" :name="type">
        <template #header>
          <h2 class="group-header-title">{{ type.charAt(0).toUpperCase() + type.slice(1) }}</h2>
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
                <th style="width: 120px">Unit Profit (taxed)</th>
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
                <td>{{ getTotalCost(recipe, getRecipeIndex(recipe)).toFixed(2) }}</td>
                <td>{{ getUnitPrice(recipe, getRecipeIndex(recipe)) }}</td>
                <td>
                  <n-input-number
                    v-model:value="recipe.sellingPrice"
                    :min="0"
                    :show-button="false"
                    :style="{ width: '100px' }"
                  />
                </td>
                <td>{{ getProfit(recipe, getRecipeIndex(recipe)) }}</td>
                <td>{{ getAdjustedCraftingTime(recipe) }}</td>
                <td>{{ getProfitPerHour(recipe, getRecipeIndex(recipe)) }}</td>
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
import {
  NCard, NTable, NInputNumber, NSelect, NCollapse, NCollapseItem
} from 'naive-ui';
import { materialCosts } from '../store';

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
  }
});

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

const calculateMaterialCost = (items) => {
  return items.reduce((sum, item) => {
    const priceKey = props.useLowestPrice ? 'effectivePrice' : 'marketPrice';
    const cost = materialCosts.materials[item.id]?.[priceKey] || 0;
    return sum + (item.quantity * cost) / 100;
  }, 0);
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

const getUnitPrice = (recipe, index) =>
  (getTotalCost(recipe, index) / recipe.quantity).toFixed(2);

const calculateTax = (sellingPrice) => Math.ceil(sellingPrice * 0.05);

const getProfit = (recipe, index) => {
  const tax = calculateTax(recipe.sellingPrice);
  return (recipe.sellingPrice - tax - parseFloat(getUnitPrice(recipe, index))).toFixed(2);
};

const getProfitPerHour = (recipe, index) => {
  const profitValue = parseFloat(getProfit(recipe, index));
  const timeInHours = parseFloat(getAdjustedCraftingTime(recipe)) / 60;
  return ((profitValue * recipe.quantity) / timeInHours).toFixed(2);
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

onMounted(initializeCategories);

watch(() => [
  props.recipes,
  props.craftingReductions,
  props.useLowestPrice,
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
</style>
