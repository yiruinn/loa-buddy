<template>
  <n-card>
    <div class="table-container">
      <n-table :bordered="false" :single-line="false" class="custom-table">
        <thead>
          <tr>
            <th>Recipe</th>
            <th>Gold</th>
            <th>Total Cost</th>
            <th>Selling Price</th>
            <th>Unit Price</th>
            <th>Unit Profit</th>
            <th>Craft Time</th>
            <th>Profit/Hour</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(recipe, index) in recipes" :key="recipe.name">
            <td>
              <n-select
                :value="selectedCategories[index]"
                :options="getSortedMaterialOptions(recipe)"
                @update:value="category => updateMaterial(index, category)"
                placeholder="Select Material"
                class="material-select"
                :render-tag="({ option }) => `${recipe.name} (${option.value})`"
              />
            </td>
            <td>{{ getAdjustedCraftingCost(recipe).toFixed(2) }}</td>
            <td>{{ getTotalCost(recipe, index).toFixed(2) }}</td>
            <td>
              <n-input-number
                v-model:value="recipe.sellingPrice"
                :min="0"
                :show-button="false"
                :style="{ width: '100px' }"
              />
            </td>
            <td>{{ getUnitPrice(recipe, index) }}</td>
            <td>{{ getProfit(recipe, index) }}</td>
            <td>{{ getAdjustedCraftingTime(recipe) }}</td>
            <td>{{ getProfitPerHour(recipe, index) }}</td>
          </tr>
        </tbody>
      </n-table>
    </div>
  </n-card>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import {
  NCard, NTable, NInputNumber, NSelect
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
});

const selectedCategories = ref([]);

const getAdjustedCraftingCost = (recipe) => {
  const categoryReduction = props.craftingReductions[recipe.type]?.cost || 0;
  const totalReduction = props.craftingReductions.general.cost + categoryReduction;
  return recipe.craftingCost * (1 - totalReduction / 100);
};

const getAdjustedCraftingTime = (recipe) => {
  const categoryReduction = props.craftingReductions[recipe.type]?.time || 0;
  const totalReduction = props.craftingReductions.general.time + categoryReduction;
  return (recipe.craftingTime * (1 - totalReduction / 100)).toFixed(2);
};

const calculateMaterialCost = (items) => {
  return items.reduce((sum, item) => {
    const cost = materialCosts.materials[item.id] || 0;
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
  return (profitValue / timeInHours).toFixed(2);
};

const initializeCategories = () => {
  selectedCategories.value = props.recipes.map(recipe => {
    const sortedOptions = getSortedMaterialOptions(recipe);
    return sortedOptions.length > 0 ? sortedOptions[0].value : null;
  });
};

onMounted(initializeCategories);
watch(() => [props.recipes, props.craftingReductions], initializeCategories, { deep: true });

</script>

<style scoped>
.material-select {
  width: 300px;
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
