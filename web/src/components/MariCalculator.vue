<template>
  <n-card>
    <div class="exchange-rate-input">
      <n-h3>Exchange Rate:</n-h3>
      <div class="input-group">
        <n-input-number v-model:value="exchangeRate" :min="0" :step="100" :show-button="false" />
        <span class="suffix-text">gold per 95 blue crystals</span>
      </div>
    </div>
    <n-tabs type="segment" default-value="t2_honing">
      <n-tab-pane
        v-for="(items, category) in processedMariShopData"
        :key="category"
        :name="category"
        :tab="formatCategoryName(category)"
      >
        <div class="table-container">
          <n-table :bordered="false" :single-line="false" class="custom-table">
            <colgroup>
              <col style="width: 45%" />
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
                <th>Blue Crystal Cost</th>
                <th>Total Gold Cost</th>
                <th>Unit Gold Cost</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="item in items" :key="item.item_name">
                <tr v-if="item.cheapestDeal">
                  <td style="display: flex; align-items: center">
                    <n-button
                      text
                      size="tiny"
                      @click="toggleRow(item.item_name)"
                      style="margin-right: 8px"
                      :disabled="item.deals.length <= 1"
                    >
                      {{ expandedRows.has(item.item_name) ? '-' : '+' }}
                    </n-button>
                    <span
                      >{{ item.item_name }} [{{ item.cheapestDeal.quantity }}]</span
                    >
                  </td>
                  <td>{{ item.cheapestDeal.blue_crystal_cost }}</td>
                  <td>{{ item.cheapestDeal.goldCost.toFixed(0) }}</td>
                  <td>{{ item.cheapestDeal.unitGoldCost.toFixed(2) }}</td>
                </tr>
                <tr v-if="expandedRows.has(item.item_name) && item.deals.length > 1">
                  <td :colspan="4" style="padding: 0; border: 0">
                    <n-table
                      :bordered="false"
                      :single-line="false"
                      style="background-color: transparent"
                    >
                      <colgroup>
                        <col style="width: 45%" />
                        <col style="width: 20%" />
                        <col style="width: 20%" />
                        <col style="width: 15%" />
                      </colgroup>
                      <tbody>
                        <tr
                          v-for="deal in item.dealsWithCost.filter(
                            (d) => d !== item.cheapestDeal
                          )"
                          :key="deal.quantity"
                        >
                          <td style="display: flex; align-items: center">
                            <span style="padding-left: 36px"
                              >{{ item.item_name }} [{{ deal.quantity }}]</span
                            >
                          </td>
                          <td>{{ deal.blue_crystal_cost }}</td>
                          <td>{{ deal.goldCost.toFixed(0) }}</td>
                          <td>{{ deal.unitGoldCost.toFixed(2) }}</td>
                        </tr>
                      </tbody>
                    </n-table>
                  </td>
                </tr>
              </template>
            </tbody>
          </n-table>
        </div>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { NCard, NH3, NInputNumber, NTabs, NTabPane, NTable, NButton } from 'naive-ui';
import { mari } from '../store';

const exchangeRate = ref(0);
const sortOrder = ref('none'); // 'none', 'asc', 'desc'
const expandedRows = ref(new Set());


const calculateGoldCost = (blueCrystalCost) => {
  if (!exchangeRate.value) return 0;
  return (blueCrystalCost / 95) * exchangeRate.value;
};

const processedMariShopData = computed(() => {
  const data = mari;
  const processed = {};
  const categoryOrder = ['t2_honing', 't3_honing', 't4_honing', 'life_skill', 'etc'];

  for (const category of categoryOrder) {
    if (!data[category]) continue;

    let items = data[category];

    if (sortOrder.value !== 'none') {
      items = [...items].sort((a, b) => {
        const nameA = a.item_name.toUpperCase();
        const nameB = b.item_name.toUpperCase();
        if (nameA < nameB) return sortOrder.value === 'asc' ? -1 : 1;
        if (nameA > nameB) return sortOrder.value === 'asc' ? 1 : -1;
        return 0;
      });
    }

    processed[category] = items.map((item) => {
      if (!item.deals || item.deals.length === 0) {
        return { ...item, cheapestDeal: null, dealsWithCost: [] };
      }

      const dealsWithCost = item.deals.map((deal) => {
        const goldCost = calculateGoldCost(deal.blue_crystal_cost);
        const unitGoldCost = goldCost / deal.quantity;
        return { ...deal, goldCost, unitGoldCost };
      });

      const cheapestDeal = dealsWithCost.reduce((cheapest, current) => {
        return current.unitGoldCost < cheapest.unitGoldCost ? current : cheapest;
      });

      return {
        ...item,
        dealsWithCost,
        cheapestDeal,
      };
    });
  }
  return processed;
});

onMounted(() => {
  const savedExchangeRate = localStorage.getItem('exchangeRate');
  if (savedExchangeRate) {
    exchangeRate.value = JSON.parse(savedExchangeRate);
  }
});

watch(exchangeRate, (newValue) => {
  localStorage.setItem('exchangeRate', JSON.stringify(newValue));
});

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

const toggleRow = (itemName) => {
  if (expandedRows.value.has(itemName)) {
    expandedRows.value.delete(itemName);
  } else {
    expandedRows.value.add(itemName);
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

.table-container {
  overflow-x: auto;
  width: 100%;
}

.custom-table th,
.custom-table td {
  white-space: nowrap;
}
</style>