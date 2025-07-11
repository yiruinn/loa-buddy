import { reactive } from 'vue';

export const materialCosts = reactive({
  lastUpdated: null,
  materials: {},
  region: 'naw'
});

export const recipes = reactive([]);
export const mari = reactive({});
export const stronghold = reactive([]);
export const materialsList = reactive([]);

export function saveMaterialCosts() {
  localStorage.setItem('materialCosts', JSON.stringify(materialCosts));
}

async function getStrongholdExchanges() {
  const response = await fetch('/data/stronghold.json');
  return await response.json();
}

export async function recalculateEffectiveCosts() {
    const strongholdExchanges = await getStrongholdExchanges();
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


export function updateAllPrices(region) {
  materialCosts.region = region;
  fetch('/data/materials.json')
    .then(response => response.json())
    .then(data => {
      const marketPrices = {};
      const promises = data.materials.map(material => {
        const slug = material.id.replace(/_/g, '-');
        return fetch(`https://marketdata-api.yrzhao1068589.workers.dev/v1/prices/${region}/${slug}`)
          .then(response => response.json())
          .then(priceData => {
            marketPrices[material.id] = priceData.price;
          });
      });
      Promise.all(promises).then(async () => {
        for (const id in marketPrices) {
            if (materialCosts.materials[id]) {
                materialCosts.materials[id].marketPrice = marketPrices[id];
            }
        }
        await recalculateEffectiveCosts();
        materialCosts.lastUpdated = new Date().toISOString();
        saveMaterialCosts();
      });
    });
}

async function initializeMaterials() {
    const savedCosts = localStorage.getItem('materialCosts');
    let loadedMaterials = {};

    if (savedCosts) {
        const parsedCosts = JSON.parse(savedCosts);
        loadedMaterials = parsedCosts.materials || {};
        materialCosts.lastUpdated = parsedCosts.lastUpdated;
        materialCosts.region = parsedCosts.region || 'naw';
    }

    const strongholdExchanges = await getStrongholdExchanges();
    const allMaterialIds = new Set(Object.keys(loadedMaterials));
    strongholdExchanges.forEach(exchange => {
        allMaterialIds.add(exchange.input.id);
        allMaterialIds.add(exchange.output.id);
    });

    const materialsResponse = await fetch('/data/materials.json');
    const materialsData = await materialsResponse.json();
    materialsData.materials.forEach(m => allMaterialIds.add(m.id));

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
        updateAllPrices(materialCosts.region);
    } else {
        recalculateEffectiveCosts();
    }
}

async function loadRecipes() {
  const response = await fetch('/data/recipes.json');
  const data = await response.json();
  recipes.push(...data);
}

async function loadMari() {
  const response = await fetch('/data/mari.json');
  const data = await response.json();
  Object.assign(mari, data);
}

async function loadStronghold() {
  const response = await fetch('/data/stronghold.json');
  const data = await response.json();
  stronghold.push(...data);
}

async function loadMaterials() {
  const response = await fetch('/data/materials.json');
  const data = await response.json();
  materialsList.push(...data.materials);
}

let isInitialized = false;
export async function init() {
  if (isInitialized) return;
  isInitialized = true;

  await Promise.all([
    initializeMaterials(),
    loadRecipes(),
    loadMari(),
    loadStronghold(),
    loadMaterials()
  ]);
}

