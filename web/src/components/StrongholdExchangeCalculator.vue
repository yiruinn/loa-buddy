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
          <tr v-for="exchange in filteredExchanges" :key="exchange.path">
            <td>
              <div class="exchange-path">
                <template v-for="(item, index) in exchange.items" :key="item.id">
                  <div class="exchange-item">
                    <img :src="getIconUrl(item.id)" :alt="item.name" class="material-icon" />
                    <span>{{ item.name }}</span>
                  </div>
                  <n-icon v-if="index < exchange.items.length - 1" class="arrow-icon">
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
import { ref, computed, onMounted, watch } from 'vue';
import { NCard, NTable, NInputNumber, NSwitch, NIcon } from 'naive-ui';
import { materialCosts } from '../store';

const strongholdExchanges = ref([]);
const materials = ref([]);
const showOnlyProfitable = ref(true);

const getIconUrl = (id) => {
    return `/icons/${id}.webp`;
}

const allMaterials = computed(() => {
    const powderNames = {
        'gathering_powder': 'Gathering Powder',
        'logging_powder': 'Logging Powder',
        'mining_powder': 'Mining Powder',
        'hunting_powder': 'Hunting Powder',
        'fishing_powder': 'Fishing Powder',
        'excavating_powder': 'Excavating Powder',
    };
    const powders = Object.entries(powderNames).map(([id, name]) => ({ id, name }));
    return [...materials.value, ...powders];
});

const getMaterialName = (id) => {
    return allMaterials.value.find(m => m.id === id)?.name || id;
}

const calculatedExchanges = computed(() => {
  const exchanges = [];
  const taxRate = 0.05;

  // One-step exchanges
  for (const exchange of strongholdExchanges.value) {
    if (exchange.output.id.endsWith('_powder')) {
        continue;
    }
    const scalingFactor = 100 / exchange.output.quantity;
    const inputCost = (materialCosts.materials[exchange.input.id] || 0) / 100 * exchange.input.quantity * scalingFactor;
    const outputPricePer100 = materialCosts.materials[exchange.output.id] || 0;
    
    if (inputCost > 0) {
        const taxPer100 = Math.ceil(outputPricePer100 * taxRate);
        const profit = outputPricePer100 - taxPer100 - inputCost;
        exchanges.push({
            path: `${exchange.input.id} -> ${exchange.output.id}`,
            items: [
                { id: exchange.input.id, name: getMaterialName(exchange.input.id) },
                { id: exchange.output.id, name: getMaterialName(exchange.output.id) }
            ],
            inputCost,
            outputValue: outputPricePer100,
            profit,
            percentProfit: profit / inputCost * 100,
        });
    }
  }

  // Two-step exchanges (via powder)
  const toPowderExchanges = strongholdExchanges.value.filter(e => e.output.id.endsWith('_powder'));
  const fromPowderExchanges = strongholdExchanges.value.filter(e => e.input.id.endsWith('_powder'));

  for (const toPowder of toPowderExchanges) {
    for (const fromPowder of fromPowderExchanges) {
      if (toPowder.output.id === fromPowder.input.id) {
        if (toPowder.input.id === fromPowder.output.id) {
            continue;
        }
        
        const inputPricePer1 = (materialCosts.materials[toPowder.input.id] || 0) / 100;
        const finalOutputPricePer100 = materialCosts.materials[fromPowder.output.id] || 0;

        if (inputPricePer1 > 0 && finalOutputPricePer100 > 0) {
            const scalingFactor = 100 / fromPowder.output.quantity;
            const powderNeeded = fromPowder.input.quantity * scalingFactor;
            const initialInputNeeded = toPowder.input.quantity * (powderNeeded / toPowder.output.quantity);
            
            const initialInputCost = inputPricePer1 * initialInputNeeded;
            
            const taxPer100 = Math.ceil(finalOutputPricePer100 * taxRate);
            const profit = finalOutputPricePer100 - taxPer100 - initialInputCost;

            exchanges.push({
                path: `${toPowder.input.id} -> ${toPowder.output.id} -> ${fromPowder.output.id}`,
                items: [
                    { id: toPowder.input.id, name: getMaterialName(toPowder.input.id) },
                    { id: toPowder.output.id, name: getMaterialName(toPowder.output.id) },
                    { id: fromPowder.output.id, name: getMaterialName(fromPowder.output.id) }
                ],
                inputCost: initialInputCost,
                outputValue: finalOutputPricePer100,
                profit,
                percentProfit: profit / initialInputCost * 100,
            });
        }
      }
    }
  }

  return exchanges.sort((a, b) => b.percentProfit - a.percentProfit);
});

const filteredExchanges = computed(() => {
    if (showOnlyProfitable.value) {
        return calculatedExchanges.value.filter(e => e.profit > 0);
    }
    return calculatedExchanges.value;
});

onMounted(async () => {
  const strongholdResponse = await fetch('/data/stronghold.json');
  strongholdExchanges.value = await strongholdResponse.json();
  const materialsResponse = await fetch('/data/materials.json');
  materials.value = (await materialsResponse.json()).materials;
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
