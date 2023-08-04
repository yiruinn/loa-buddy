<template>
  <div>
    <h2> Mari's Shop </h2>
    <InputText id="exchangeRate" v-model="exchangeRate" :useGrouping="false" placeholder="Enter exchange rate"
      @input="calculatePrices" />

    <hr>

    <DataTable :value="items" tableStyle="min-width: 50rem">
      <Column field="name" sortable header="Name"></Column>
      <Column field="category" sortable header="Category"></Column>
      <Column field="quantity" header="Quantity"></Column>
      <Column field="unit" header="Unit"></Column>
      <Column :field="calculateItemPrice" header="Price"></Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import items from '../data/mari.json';

const exchangeRate = ref(); // Set the default exchange rate to 0

function calculateItemPrice(item) {
  // Calculate item price only when exchange rate is provided
  if (exchangeRate.value !== 0) {
    return (((exchangeRate.value / 95) * item.cost / item.quantity) * item.unit).toFixed(2);
  }
  return null; // Return null for the item price when exchange rate is not provided
}

function calculatePrices() {
  // Recalculate item prices when exchange rate changes
  items.forEach(item => {
    item.price = calculateItemPrice(item);
  });
}
</script>

<style scoped>
h2 {
  margin-top: 20px;
}

hr {
  border: 1px solid #ddd;
  margin-top: 20px;
  margin-bottom: 20px;
}
</style>