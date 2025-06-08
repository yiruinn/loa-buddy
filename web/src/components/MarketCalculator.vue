<script setup>
import { ref } from 'vue'
import { 
  NCard, 
  NInputNumber, 
  NSpace, 
  NText,
  NButton,
  NStatistic,
  NAlert
} from 'naive-ui'

// Define materials with quantities
const materials = ref([
  { name: 'Material 1', cost: 0, quantity: 1 },
  { name: 'Material 2', cost: 0, quantity: 1 },
  { name: 'Material 3', cost: 0, quantity: 1 },
])

const craftingFee = ref(0)
const marketPrice = ref(0)
const quantity = ref(1)
const marketTax = ref(10) // Default market tax percentage

// Add/remove materials
const addMaterial = () => {
  materials.value.push({ name: `Material ${materials.value.length + 1}`, cost: 0, quantity: 1 })
}

const removeMaterial = (index) => {
  materials.value.splice(index, 1)
}

// Calculate total material cost
const totalMaterialCost = () => {
  return materials.value.reduce((sum, material) => sum + (material.cost || 0) * (material.quantity || 1), 0)
}

// Calculate total cost (materials + crafting fee)
const totalCost = () => {
  return totalMaterialCost() + (craftingFee.value || 0)
}

// Calculate revenue after market tax
const netRevenue = () => {
  const grossRevenue = (marketPrice.value || 0) * (quantity.value || 1)
  const taxAmount = grossRevenue * ((marketTax.value || 0) / 100)
  return grossRevenue - taxAmount
}

// Calculate profit
const calculateProfit = () => {
  return netRevenue() - totalCost()
}

// Reset inputs
const resetInputs = () => {
  materials.value = [
    { name: 'Material 1', cost: 0, quantity: 1 },
    { name: 'Material 2', cost: 0, quantity: 1 },
    { name: 'Material 3', cost: 0, quantity: 1 },
  ]
  craftingFee.value = 0
  marketPrice.value = 0
  quantity.value = 1
  marketTax.value = 10
}
</script>

<template>
  <n-card title="Crafting Calculator" style="height: 100%">
    <n-space vertical size="large">
      <!-- Material Costs -->
      <div>
        <h3 style="color: var(--n-text-color)">Material Costs</h3>
        <n-space vertical>
          <n-space v-for="(material, index) in materials" :key="index">
            <n-input-number
              v-model:value="material.cost"
              :placeholder="material.name"
              :min="0"
              clearable
            />
            <n-input-number
              v-model:value="material.quantity"
              placeholder="Quantity"
              :min="1"
              clearable
            />
            <n-button @click="removeMaterial(index)" type="error" size="small">
              Remove
            </n-button>
          </n-space>
          <n-button @click="addMaterial" type="primary" size="small">
            Add Material
          </n-button>
        </n-space>
      </div>

      <!-- Crafting Details -->
      <div>
        <h3 style="color: var(--n-text-color)">Crafting Details</h3>
        <n-space>
          <n-input-number
            v-model:value="craftingFee"
            placeholder="Crafting Fee"
            :min="0"
            clearable
          />
          <n-input-number
            v-model:value="marketPrice"
            placeholder="Market Price"
            :min="0"
            clearable
          />
          <n-input-number
            v-model:value="quantity"
            placeholder="Quantity"
            :min="1"
            clearable
          />
          <n-input-number
            v-model:value="marketTax"
            placeholder="Market Tax (%)"
            :min="0"
            :max="100"
            clearable
          />
        </n-space>
      </div>

      <!-- Profit Analysis -->
      <n-card title="Profit Analysis">
        <n-space vertical>
          <n-statistic label="Total Material Cost" :value="totalMaterialCost()" />
          <n-statistic label="Total Cost (with fee)" :value="totalCost()" />
          <n-statistic label="Gross Revenue" :value="marketPrice * quantity" />
          <n-statistic label="Market Tax" :value="marketPrice * quantity * (marketTax / 100)" />
          <n-statistic label="Net Revenue" :value="netRevenue()" />
          <n-statistic 
            :label="calculateProfit() > 0 ? 'Profit' : 'Loss'" 
            :value="calculateProfit()" 
            :type="calculateProfit() > 0 ? 'success' : 'error'"
          />
        </n-space>
      </n-card>

      <!-- Reset Button -->
      <n-button @click="resetInputs" type="warning" size="small">
        Reset
      </n-button>
    </n-space>
  </n-card>
</template>