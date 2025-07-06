<template>
  <n-card>
    <div class="exchange-rate-input">
      <n-h3>Exchange Rate:</n-h3>
      <div class="input-group">
        <n-input-number v-model:value="exchangeRate" :min="0" :step="100" :show-button="false" />
        <span class="suffix-text">gold per 95 blue crystals</span>
      </div>
    </div>
    <n-tabs type="segment" default-value="t4_honing">
      <n-tab-pane
        v-for="(items, category) in sortedMariShopData"
        :key="category"
        :name="category"
        :tab="formatCategoryName(category)"
      >
        <n-table :bordered="false" :single-line="false" style="table-layout: fixed; width: 100%">
          <colgroup>
            <col style="width: 30%" />
            <col style="width: 15%" />
            <col style="width: 20%" />
            <col style="width: 20%" />
            <col style="width: 15%" />
          </colgroup>
          <thead>
            <tr>
              <th @click="toggleSort" style="cursor: pointer">
                Item
                <span v-if="sortOrder === 'asc'">▲</span>
                <span v-if="sortOrder === 'desc'">▼</span>
              </th>
              <th>Quantity</th>
              <th>Blue Crystal Cost</th>
              <th>Total Gold Cost</th>
              <th>Unit Gold Cost</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="item in items" :key="item.item_name">
              <tr v-for="(deal, index) in item.deals" :key="index">
                <td v-if="index === 0" :rowspan="item.deals.length">{{ item.item_name }}</td>
                <td>{{ deal.quantity }}</td>
                <td>{{ deal.blue_crystal_cost }}</td>
                <td>{{ calculateGoldCost(deal.blue_crystal_cost) }}</td>
                <td>{{ (calculateGoldCost(deal.blue_crystal_cost) / deal.quantity).toFixed(2) }}</td>
              </tr>
            </template>
          </tbody>
        </n-table>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { NCard, NH3, NInputNumber, NTabs, NTabPane, NTable, NButton } from 'naive-ui';
import mariData from '../../public/data/mari.json';

const exchangeRate = ref(7000);
const mariShopData = ref({});
const sortOrder = ref('none'); // 'none', 'asc', 'desc'

const sortedMariShopData = computed(() => {
  if (sortOrder.value === 'none') {
    return mariShopData.value;
  }

  const sortedData = {};
  for (const category in mariShopData.value) {
    sortedData[category] = [...mariShopData.value[category]].sort((a, b) => {
      const nameA = a.item_name.toUpperCase();
      const nameB = b.item_name.toUpperCase();
      if (nameA < nameB) {
        return sortOrder.value === 'asc' ? -1 : 1;
      }
      if (nameA > nameB) {
        return sortOrder.value === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
  return sortedData;
});

onMounted(() => {
  mariShopData.value = mariData;
});

const calculateGoldCost = (blueCrystalCost) => {
  if (!exchangeRate.value) return 0;
  return Math.round((blueCrystalCost / 95) * exchangeRate.value);
};

const formatCategoryName = (name) => {
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const toggleSort = () => {
  if (sortOrder.value === 'asc') {
    sortOrder.value = 'desc';
  } else {
    sortOrder.value = 'asc';
  }
};
</script>

<style scoped>
.exchange-rate-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background-color: #2c2c2f;
  padding: 15px;
  border-radius: 8px;
}

.exchange-rate-input .n-h3 {
  margin: 0;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.suffix-text {
  margin-left: 5px;
}
</style>