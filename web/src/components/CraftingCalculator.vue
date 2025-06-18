<template>
  <n-card>
    <div class="table-container">
      <n-table :bordered="false" :single-line="false" class="custom-table">
        <thead>
          <tr>
            <th>Recipe</th>
            <th>Cost per 100</th>
            <th>Crafting Cost</th>
            <th>Total Cost</th>
            <th>Selling Price</th>
            <th>Unit Price</th>
            <th>Unit Profit</th>
            <th>Craft Time</th>
            <th>Profit/Hour</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(recipe, index) in recipes" :key="index">
            <td>
              <n-popover trigger="hover">
                <template #trigger>
                  <n-button text> <!-- Use a text button for a less intrusive look -->
                    {{ recipe.name }} (x{{ recipe.quantity }})
                  </n-button>
                </template>
                <ul>
                  <li v-for="(item, itemIndex) in recipe.items" :key="itemIndex">
                    {{ item.name }} x{{ item.quantity }}
                  </li>
                </ul>
              </n-popover>
            </td>
            <td>
              <ul>
                <li v-for="(item, itemIndex) in recipe.items" :key="itemIndex">
                  <n-input-number
                    v-model:value="item.costPerItem"
                    :min="0"
                    :show-button="false"
                    :style="{ width: '100px' }"
                  />
                </li>
              </ul>
            </td>
            <td>{{ adjustedCraftingCost(recipe) }}</td>
            <td>{{ totalCost(recipe) }}</td>
            <td>
              <n-input-number
                v-model:value="recipe.sellingPrice"
                :min="0"
                :show-button="false"
                :style="{ width: '100px' }"
              />
            </td>
            <td>{{ unitPrice(recipe) }}</td>
            <td>{{ profit(recipe) }}</td>
            <td>{{ adjustedCraftingTime(recipe) }}</td>
            <td>{{ profitPerHour(recipe) }}</td>
          </tr>
        </tbody>
      </n-table>
    </div>
  </n-card>
</template>

<script setup>
import { NCard, NTable, NInputNumber, NPopover, NButton } from 'naive-ui';

// Define props
const props = defineProps({
  recipes: {
    type: Array,
    required: true,
  },
  craftingCostReductionPercent: {
    type: Number,
    default: 0, // Default to 0% if not provided
  },
  craftingTimeReductionPercent: {
    type: Number,
    default: 0, // Default to 0% if not provided
  },
});

// Adjust crafting cost based on reduction percent
const adjustedCraftingCost = (recipe) => {
  return recipe.craftingCost * (1 - props.craftingCostReductionPercent / 100);
};

// Adjust crafting time based on reduction percent
const adjustedCraftingTime = (recipe) => {
  return (recipe.craftingTime * (1 - props.craftingTimeReductionPercent / 100)).toFixed(2);
};

// Calculate the total cost for a recipe (including adjusted crafting cost)
const totalCost = (recipe) => {
  const itemsCost = recipe.items.reduce((sum, item) => sum + item.quantity * item.costPerItem / 100, 0);
  return itemsCost + adjustedCraftingCost(recipe);
};

// Calculate the unit price (total cost per crafted item)
const unitPrice = (recipe) => {
  return (totalCost(recipe) / recipe.quantity).toFixed(2);
};

// Calculate the tax (5% of selling price, rounded up)
const calculateTax = (sellingPrice) => {
  return Math.ceil(sellingPrice * 0.05);
};

// Calculate the profit (selling price - tax - unit price)
const profit = (recipe) => {
  const tax = calculateTax(recipe.sellingPrice);
  return (recipe.sellingPrice - tax - unitPrice(recipe)).toFixed(2);
};

// Calculate the profit per hour
const profitPerHour = (recipe) => {
  const profitValue = parseFloat(profit(recipe));
  const timeInHours = adjustedCraftingTime(recipe) / 60; // Convert adjusted minutes to hours
  return (profitValue / timeInHours).toFixed(2);
};
</script>

<style scoped>
/* Add your styles here */
ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
li {
  margin-bottom: 8px;
}

/* Container for the table with horizontal scrolling */
.table-container {
  overflow-x: auto;
  width: 100%;
}

/* Make table columns more compact */
.n-table.custom-table th,
.n-table.custom-table td {
  padding: 8px 12px;
  white-space: nowrap; /* Prevent text from wrapping */
}

/* Narrow the number input columns */
.n-input-number {
  width: 100px;
}
</style>