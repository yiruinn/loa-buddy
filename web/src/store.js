import { reactive } from 'vue';
import strongholdData from '@/data/stronghold.json';
import recipesData from '@/data/recipes.json';
import mariData from '@/data/mari.json';
import itemsData from '@/data/items.json';

export const materialCosts = reactive({
  lastUpdated: {},
  materials: {},
  region: 'naw'
});

export const marketTrackerControls = reactive({
  region: 'naw',
  selectedCategory: null,
  item: null,
  selectedRange: '7d',
});

export function saveMarketTrackerControls() {
  localStorage.setItem('marketTrackerControls', JSON.stringify(marketTrackerControls));
}

function initializeMarketTrackerControls() {
  const savedControls = localStorage.getItem('marketTrackerControls');
  if (savedControls) {
    const parsedControls = JSON.parse(savedControls);
    Object.assign(marketTrackerControls, parsedControls);
  }
}

export const marketDataCache = reactive({});

export function getCachedMarketData(key) {
  const cached = marketDataCache[key];
  if (!cached) {
    return null;
  }

  const isStale = (new Date().getTime() - new Date(cached.timestamp).getTime()) > (60 * 60 * 1000); // 1 hour
  if (isStale) {
    delete marketDataCache[key];
    return null;
  }
  return cached.data;
}

export function setCachedMarketData(key, data) {
  marketDataCache[key] = {
    timestamp: new Date().toISOString(),
    data: data
  };
}

export const recipes = reactive([]);
export const mari = reactive({});
export const stronghold = reactive([]);
export const materialsList = reactive([]);

export function saveMaterialCosts() {
  localStorage.setItem('materialCosts', JSON.stringify(materialCosts));
}

function getStrongholdExchanges() {
  return strongholdData;
}

export async function recalculateEffectiveCosts() {
    const strongholdExchanges = getStrongholdExchanges();
    const allMaterialIds = Object.keys(materialCosts.materials);

    const costs = {};
    allMaterialIds.forEach(id => {
        const mat = materialCosts.materials[id];
        if (mat) {
            costs[id] = {
                price: mat.marketPrice,
                path: [id]
            };
        }
    });

    for (let i = 0; i < allMaterialIds.length; i++) {
        let changed = false;
        for (const exchange of strongholdExchanges) {
            const inputId = exchange.input.id;
            const outputId = exchange.output.id;

            if (!costs[inputId] || !costs[outputId]) continue;

            const currentInputPrice = costs[inputId].price;
            if (currentInputPrice === Infinity || currentInputPrice === 0) continue;

            const costViaExchange = currentInputPrice * exchange.input.quantity / exchange.output.quantity;

            if (costViaExchange < costs[outputId].price) {
                costs[outputId].price = costViaExchange;
                costs[outputId].path = [...costs[inputId].path, outputId];
                changed = true;
            }
        }

        for (let j = strongholdExchanges.length - 1; j >= 0; j--) {
            const exchange = strongholdExchanges[j];
            const inputId = exchange.input.id;
            const outputId = exchange.output.id;

            if (!costs[inputId] || !costs[outputId]) continue;

            const currentInputPrice = costs[inputId].price;
            if (currentInputPrice === Infinity || currentInputPrice === 0) continue;

            const costViaExchange = currentInputPrice * exchange.input.quantity / exchange.output.quantity;

            if (costViaExchange < costs[outputId].price) {
                costs[outputId].price = costViaExchange;
                costs[outputId].path = [...costs[inputId].path, outputId];
                changed = true;
            }
        }
        if (!changed) break;
    }

    for (const id in costs) {
        materialCosts.materials[id].effectivePrice = costs[id].price;
        materialCosts.materials[id].path = costs[id].path;
        materialCosts.materials[id].source = costs[id].path.length > 1 ? 'exchange' : 'market';
    }

    saveMaterialCosts();
}


export async function updateAllPrices(region, materialsToUpdate, title) {
  materialCosts.region = region;
  const itemSlugs = materialsToUpdate.map(material => material.slug);
  const slugToId = materialsToUpdate.reduce((acc, material) => {
    acc[material.slug] = material.id;
    return acc;
  }, {});

  try {
    const response = await fetch(`https://marketdata-api.yrzhao1068589.workers.dev/v1/prices/latest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        region_slug: region,
        item_slugs: itemSlugs,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const prices = await response.json();

    prices.forEach(priceData => {
      const materialId = slugToId[priceData.item_slug];
      if (materialId && materialCosts.materials[materialId]) {
        materialCosts.materials[materialId].marketPrice = priceData.price;
      }
    });

    await recalculateEffectiveCosts();
    materialCosts.lastUpdated[title] = new Date().toISOString();
    saveMaterialCosts();
  } catch (error) {
    console.error("Failed to update prices:", error);
  }
}

async function initializeMaterials() {
    const savedCosts = localStorage.getItem('materialCosts');
    let loadedMaterials = {};

    if (savedCosts) {
        const parsedCosts = JSON.parse(savedCosts);
        loadedMaterials = parsedCosts.materials || {};
        materialCosts.lastUpdated = parsedCosts.lastUpdated || {};
        materialCosts.region = parsedCosts.region || 'naw';
    }

    const strongholdExchanges = getStrongholdExchanges();
    const allMaterialIds = new Set(Object.keys(loadedMaterials));
    strongholdExchanges.forEach(exchange => {
        allMaterialIds.add(exchange.input.id);
        allMaterialIds.add(exchange.output.id);
    });

    materialsList.forEach(m => allMaterialIds.add(m.id));

    const newMaterials = {};
    allMaterialIds.forEach(id => {
        const existing = loadedMaterials[id];
        newMaterials[id] = {
            marketPrice: existing?.marketPrice ?? Infinity,
            effectivePrice: existing?.effectivePrice ?? Infinity,
            source: existing?.source ?? 'market',
            path: existing?.path ?? [id]
        };
    });
    materialCosts.materials = newMaterials;

    if (!savedCosts) {
        updateAllPrices(materialCosts.region, materialsList, 'Trade Skill');
        // updateAllPrices(materialCosts.region, materialsList, 'Fusion Material Costs');
    } else {
        recalculateEffectiveCosts();
    }
}

function loadRecipes() {
  recipes.push(...recipesData);
}

function loadMari() {
  Object.assign(mari, mariData);
}

function loadStronghold() {
  stronghold.push(...strongholdData);
}

function loadMaterials() {
  const allItems = [];
  for (const category in itemsData) {
    for (const subCategory in itemsData[category]) {
      itemsData[category][subCategory].forEach(item => {
        allItems.push({ ...item, category: subCategory, mainCategory: category });
      });
    }
  }
  materialsList.push(...allItems);
}

let isInitialized = false;
export async function init() {
  if (isInitialized) return;
  isInitialized = true;

  initializeMarketTrackerControls();

  loadMaterials(); // Load materials first
  await Promise.all([
    initializeMaterials(),
    loadRecipes(),
    loadMari(),
    loadStronghold()
  ]);
}

