<template>
  <div>
    <n-card style="margin-bottom: 20px;">
      <n-collapse :default-expanded-names="['1']">
        <n-collapse-item name="1">
          <template #header>
            <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
              <span style="font-size: 1.2em; font-weight: bold;">Crafting Reductions</span>
              <div style="display: flex; align-items: center; gap: 10px;">
                <n-switch v-model:value="useLowestPrice" @click.stop>
                  <template #checked>
                    Lowest Price
                  </template>
                  <template #unchecked>
                    Current Price
                  </template>
                </n-switch>
                <n-tooltip trigger="hover" placement="bottom" style="max-width: 200px;">
                  <template #trigger>
                    <n-icon size="20" style="cursor: pointer;">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm-1-13h2v2h-2v-2zm0 4h2v6h-2v-6z"></path></svg>
                    </n-icon>
                  </template>
                  <div>
                    <b>Current Price</b>: Use "as-is" price taken from Material Prices.<br>
                    <b>Lowest Price</b>: Use cheaper of "as-is" price and "exchange" price from Material Prices.
                  </div>
                </n-tooltip>
              </div>
            </div>
          </template>
          <div class="scrollable-container">
            <div class="reduction-inputs">
              <div class="category-group">
                <h3>General</h3>
                <div class="input-group">
                  <span>Cost Reduction (%)</span>
                  <n-input-number v-model:value="craftingReductions.general.cost" :min="0" :max="30" :show-button="false" />
                </div>
                <div class="input-group">
                  <span>Time Reduction (%)</span>
                  <n-input-number
                    v-model:value="generalTimeForInput"
                    @focus="handleGeneralTimeFocus"
                    @blur="handleGeneralTimeBlur"
                    :min="0"
                    :max="30"
                    :show-button="false"
                  >
                    <template #suffix>
                      <div @mousedown.stop @click="toggleTimeBonus" style="display: flex; align-items: center; cursor: pointer; height: 100%;">
                        <img src="/icons/aura.webp" alt="Aura" :style="{ width: '24px', height: '24px', filter: timeReductionBonus ? 'none' : 'grayscale(100%)' }">
                      </div>
                    </template>
                  </n-input-number>
                </div>
                <div class="input-group">
                  <span style="display: flex; align-items: center; gap: 4px;">
                    Great Success (%)
                    <n-tooltip trigger="hover" placement="bottom" style="max-width: 200px;">
                      <template #trigger>
                        <n-icon size="20" style="cursor: pointer;">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm-1-13h2v2h-2v-2zm0 4h2v6h-2v-6z"></path></svg>
                        </n-icon>
                      </template>
                      <div>
                        Great Success Chance (GSC) is:<br>
                        <b>5 * (1 + additionalGSC / 100)</b><br>
                        Expected Yield (EY) is:<br>
                        <b>quantity * (1 + GSC / 100)</b><br>
                        Unit Price is calculated as:<br>
                        <b>totalCost / EY</b><br>
                        Net Profit (taxed) is:<br>
                        <b> [(price - tax) * EY] - totalCost </b>
                      </div>
                    </n-tooltip>
                  </span>
                  <n-input-number v-model:value="craftingReductions.general.greatSuccess" :min="0" :max="30" :show-button="false" :disabled="!enableGreatSuccess">
                    <template #suffix>
                      <div @click="enableGreatSuccess = !enableGreatSuccess" style="display: flex; align-items: center; cursor: pointer; height: 100%;">
                        <n-icon size="24">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" :style="{ color: enableGreatSuccess ? '#63e2b7' : 'grey' }">
                            <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="20" font-weight="bold" font-style="normal" fill="currentColor">x2</text>
                          </svg>
                        </n-icon>
                      </div>
                    </template>
                  </n-input-number>
                </div>
              </div>
              <div class="category-group">
                <h3>Battle Items</h3>
                <div class="input-group">
                  <span>Cost Reduction (%)</span>
                  <n-input-number v-model:value="craftingReductions.battle.cost" :min="0" :max="10" :show-button="false" />
                </div>
                <div class="input-group">
                  <span>Time Reduction (%)</span>
                  <n-input-number v-model:value="craftingReductions.battle.time" :min="0" :max="10" :show-button="false" />
                </div>
                <div class="input-group">
                  <span>Great Success (%)</span>
                  <n-input-number v-model:value="craftingReductions.battle.greatSuccess" :min="0" :max="10" :show-button="false" :disabled="!enableGreatSuccess" />
                </div>
              </div>
              <div class="category-group">
                <h3>Cooking</h3>
                <div class="input-group">
                  <span>Cost Reduction (%)</span>
                  <n-input-number v-model:value="craftingReductions.cooking.cost" :min="0" :max="10" :show-button="false" />
                </div>
                <div class="input-group">
                  <span>Time Reduction (%)</span>
                  <n-input-number v-model:value="craftingReductions.cooking.time" :min="0" :max="10" :show-button="false" />
                </div>
                <div class="input-group">
                  <span>Great Success (%)</span>
                  <n-input-number v-model:value="craftingReductions.cooking.greatSuccess" :min="0" :max="10" :show-button="false" :disabled="!enableGreatSuccess" />
                </div>
              </div>
              <div class="category-group">
                <h3>Special</h3>
                <div class="input-group">
                  <span>Cost Reduction (%)</span>
                  <n-input-number v-model:value="craftingReductions.special.cost" :min="0" :max="10" :show-button="false" />
                </div>
                <div class="input-group">
                  <span>Time Reduction (%)</span>
                  <n-input-number v-model:value="craftingReductions.special.time" :min="0" :max="10" :show-button="false" />
                </div>
                <div class="input-group">
                  <span>Great Success (%)</span>
                  <n-input-number v-model:value="craftingReductions.special.greatSuccess" :min="0" :max="10" :show-button="false" :disabled="!enableGreatSuccess" />
                </div>
              </div>
            </div>
          </div>
        </n-collapse-item>
      </n-collapse>
    </n-card>
    <CraftingCalculator
      :recipes="localRecipes"
      :materials="materialCosts.materials"
      :crafting-reductions="craftingReductions"
      :use-lowest-price="useLowestPrice"
      :enable-great-success="enableGreatSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { NInputNumber, NCard, NCollapse, NCollapseItem, NSwitch, NTooltip, NIcon, NButton } from 'naive-ui';
import CraftingCalculator from './CraftingCalculator.vue';
import { recipes, materialCosts } from '../store';

const useLowestPrice = ref(false);
const enableGreatSuccess = ref(false);
const timeReductionBonus = ref(false);

const craftingReductions = reactive({
  general: { cost: 0, time: 0, greatSuccess: 0 },
  battle: { cost: 0, time: 0, greatSuccess: 0 },
  cooking: { cost: 0, time: 0, greatSuccess: 0 },
  special: { cost: 0, time: 0, greatSuccess: 0 },
});

const rawGeneralTime = ref(0);
const generalTimeForInput = ref(0);

const handleGeneralTimeFocus = () => {
  generalTimeForInput.value = rawGeneralTime.value;
};

const handleGeneralTimeBlur = () => {
  rawGeneralTime.value = generalTimeForInput.value;
  let finalValue = rawGeneralTime.value || 0;
  if (timeReductionBonus.value) {
    finalValue += 10;
  }
  generalTimeForInput.value = Math.min(30, finalValue);
  craftingReductions.general.time = generalTimeForInput.value;
};

const toggleTimeBonus = () => {
  timeReductionBonus.value = !timeReductionBonus.value;
  let finalValue = rawGeneralTime.value || 0;
  if (timeReductionBonus.value) {
    finalValue += 10;
  }
  generalTimeForInput.value = Math.min(30, finalValue);
  craftingReductions.general.time = generalTimeForInput.value;
};

const localRecipes = ref([]);

const loadSellingPrices = (recipeData) => {
  const savedPrices = JSON.parse(localStorage.getItem('sellingPrices') || '{}');
  return recipeData.map(recipe => ({
    ...recipe,
    sellingPrice: savedPrices[recipe.name] || 0,
  }));
};

const saveSellingPrices = () => {
  const pricesToSave = {};
  localRecipes.value.forEach(recipe => {
    if (recipe.sellingPrice !== null && recipe.sellingPrice !== undefined) {
      pricesToSave[recipe.name] = recipe.sellingPrice;
    }
  });
  localStorage.setItem('sellingPrices', JSON.stringify(pricesToSave));
};

watch(recipes, (newRecipes) => {
  if (newRecipes && newRecipes.length > 0) {
    localRecipes.value = loadSellingPrices(newRecipes);
  }
}, { immediate: true, deep: true });

watch(localRecipes, saveSellingPrices, { deep: true });

watch(useLowestPrice, (newValue) => {
  localStorage.setItem('useLowestPrice', JSON.stringify(newValue));
});

watch(enableGreatSuccess, (newValue) => {
  localStorage.setItem('enableGreatSuccess', JSON.stringify(newValue));
});

watch(timeReductionBonus, (newValue) => {
  localStorage.setItem('timeReductionBonus', JSON.stringify(newValue));
});

watch(craftingReductions, (newValue) => {
  localStorage.setItem('craftingReductions', JSON.stringify(newValue));
});

onMounted(() => {
  const savedReductions = localStorage.getItem('craftingReductions');
  if (savedReductions) {
    const parsedReductions = JSON.parse(savedReductions);
    for (const category in craftingReductions) {
      if (parsedReductions[category]) {
        Object.assign(craftingReductions[category], parsedReductions[category]);
      }
    }
  }
  const savedEnable = localStorage.getItem('enableGreatSuccess');
  if (savedEnable !== null) {
    enableGreatSuccess.value = JSON.parse(savedEnable);
  }
  const savedUseLowestPrice = localStorage.getItem('useLowestPrice');
  if (savedUseLowestPrice !== null) {
    useLowestPrice.value = JSON.parse(savedUseLowestPrice);
  }
  const savedTimeReductionBonus = localStorage.getItem('timeReductionBonus');
  if (savedTimeReductionBonus !== null) {
    timeReductionBonus.value = JSON.parse(savedTimeReductionBonus);
  }

  const storedTime = craftingReductions.general.time || 0;
  generalTimeForInput.value = storedTime;
  let baseTime = storedTime;
  if (timeReductionBonus.value) {
    baseTime = Math.max(0, storedTime - 10);
  }
  rawGeneralTime.value = baseTime;
});
</script>

<style scoped>
.scrollable-container {
  overflow-x: auto;
}

.reduction-inputs {
  display: flex;
  gap: 20px;
  min-width: 900px;
}

.category-group {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid #444;
  padding: 10px;
  border-radius: 4px;
}
.input-group {
  display: flex;
  align-items: center;
  gap: 4px;
}
.input-group span {
  flex-basis: 60%;
  white-space: nowrap;
}
.input-group .n-input-number {
  flex-basis: 40%;
}
.category-group h3 {
  margin: 0;
  font-size: 1.1em;
}
</style>
