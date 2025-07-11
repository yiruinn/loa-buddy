<template>
  <n-card>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <h2 style="margin: 0;">Stronghold Arbitrage</h2>
      <div style="display: flex; align-items: center; gap: 16px;">
        <n-switch v-model:value="showOnlyProfitable">
          <template #checked>
            Profitable Exchanges
          </template>
          <template #unchecked>
            All Exchanges
          </template>
        </n-switch>
      </div>
    </div>
    <div class="table-container">
      <n-table :bordered="false" :single-line="false" class="custom-table">
        <thead>
          <tr>
            <th>Exchange Path</th>
            <th>Input Cost</th>
            <th>Output Value</th>
            <th>Profit (Taxed)</th>
            <th>Profit %</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="exchange in filteredExchanges" :key="exchange.pathString">
            <td>
              <div class="exchange-path">
                <template v-for="(item, index) in exchange.path" :key="item.id">
                  <div class="exchange-item">
                    <img :src="getIconUrl(item.id)" :alt="item.name" class="material-icon" />
                    <span>{{ item.name }}</span>
                  </div>
                  <n-icon v-if="index < exchange.path.length - 1" class="arrow-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16.01 11H4v2h12.01v3L20 12l-3.99-4z" fill="currentColor"></path></svg>
                  </n-icon>
                </template>
              </div>
            </td>
            <td>{{ exchange.inputCost.toFixed(2) }}g</td>
            <td>{{ exchange.outputValue.toFixed(2) }}g</td>
            <td :class="{ 'profit': exchange.profit > 0, 'loss': exchange.profit < 0 }">
              {{ exchange.profit.toFixed(2) }}g
            </td>
            <td :class="{ 'profit': exchange.profit > 0, 'loss': exchange.profit < 0 }">
              {{ exchange.percentProfit.toFixed(2) }}%
            </td>
          </tr>
        </tbody>
      </n-table>
    </div>
  </n-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { NCard, NTable, NSwitch, NIcon } from 'naive-ui';
import { materialCosts, materialsList, stronghold } from '../store';

const showOnlyProfitable = ref(true);

const getIconUrl = (id) => `/icons/${id}.webp`;

const getMaterialName = (id) => {
  const material = materialsList.find(m => m.id === id);
  if (material) {
    return material.name;
  }
  // Fallback for items not in the main list (e.g., powders)
  return id
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};



const calculatedExchanges = computed(() => {
    const exchanges = [];
    const taxRate = 0.05;

    if (stronghold.length === 0 || Object.keys(materialCosts.materials).length === 0) {
        return [];
    }

    for (const exchange of stronghold) {
        const inputMat = materialCosts.materials[exchange.input.id];
        const outputMat = materialCosts.materials[exchange.output.id];

        if (!inputMat || !outputMat) continue;
        
        const outputMarketPrice = outputMat.marketPrice;
        if (outputMarketPrice === Infinity || outputMarketPrice === 0) continue;

        const inputEffectivePrice = inputMat.effectivePrice;
        if (inputEffectivePrice === Infinity || inputEffectivePrice === 0) continue;

        // Calculate the cost of inputs required to produce 100 units of the output material.
        // Prices are already for 100 units, so we scale based on the exchange ratio.
        const totalInputCost = (inputEffectivePrice * exchange.input.quantity) / exchange.output.quantity;
        
        // The market value of 100 units of the output material.
        const totalOutputValue = outputMarketPrice;

        const tax = Math.ceil(totalOutputValue * taxRate);
        const totalProfit = totalOutputValue - tax - totalInputCost;
        
        const fullPath = [...(inputMat.path || [exchange.input.id]), exchange.output.id];
        const percentProfit = totalInputCost > 0 ? (totalProfit / totalInputCost) * 100 : Infinity;

        exchanges.push({
            pathString: fullPath.join(' -> '),
            path: fullPath.map(id => ({ id, name: getMaterialName(id) })),
            inputCost: totalInputCost,
            outputValue: totalOutputValue,
            profit: totalProfit,
            percentProfit: percentProfit,
        });
    }

    return exchanges.sort((a, b) => b.percentProfit - a.percentProfit);
});


const filteredExchanges = computed(() => {
    if (showOnlyProfitable.value) {
        return calculatedExchanges.value.filter(e => e.profit > 0);
    }
    return calculatedExchanges.value;
});

</script>

<style scoped>
.table-container {
  overflow-x: auto;
  width: 100%;
}

.custom-table th,
.custom-table td {
  padding: 8px 12px;
  white-space: nowrap;
}

.profit {
  color: #63e2b7;
}

.loss {
  color: #e88080;
}

.exchange-path {
    display: flex;
    align-items: center;
    gap: 8px;
}

.exchange-item {
    display: flex;
    align-items: center;
    gap: 4px;
}

.material-icon {
    width: 24px;
    height: 24px;
}

.arrow-icon {
    font-size: 24px;
}
</style>
