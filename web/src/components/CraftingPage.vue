<template>
  <div>
    <n-card style="margin-bottom: 20px;">
      <n-collapse :default-expanded-names="['1']">
        <n-collapse-item name="1">
          <template #header>
            <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
              <span style="font-size: 1.2em; font-weight: bold;">Crafting Reductions</span>
              <n-switch v-model:value="useLowestPrice" @click.stop>
                <template #checked>
                  Use Lowest Price
                </template>
                <template #unchecked>
                  Use Market Price
                </template>
              </n-switch>
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
                  <n-input-number v-model:value="craftingReductions.general.time" :min="0" :max="30" :show-button="false" />
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
    />
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { NInputNumber, NCard, NCollapse, NCollapseItem, NSwitch } from 'naive-ui';
import CraftingCalculator from './CraftingCalculator.vue';
import { recipes, materialCosts } from '../store';

const useLowestPrice = ref(false);
const craftingReductions = reactive({
  general: { cost: 0, time: 0 },
  battle: { cost: 0, time: 0 },
  cooking: { cost: 0, time: 0 },
  special: { cost: 0, time: 0 },
});

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

watch(craftingReductions, (newValue) => {
  localStorage.setItem('craftingReductions', JSON.stringify(newValue));
});

onMounted(() => {
  const savedReductions = localStorage.getItem('craftingReductions');
  if (savedReductions) {
    Object.assign(craftingReductions, JSON.parse(savedReductions));
  }
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
