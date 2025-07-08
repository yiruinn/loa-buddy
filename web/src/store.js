import { reactive } from 'vue';

export const materialCosts = reactive({
  lastUpdated: null,
  materials: {},
  region: 'naw'
});

export function saveMaterialCosts() {
  localStorage.setItem('materialCosts', JSON.stringify(materialCosts));
}

export function updateAllPrices(region) {
  materialCosts.region = region;
  fetch('/data/materials.json')
    .then(response => response.json())
    .then(data => {
      const promises = data.materials.map(material => {
        const slug = material.id.replace(/_/g, '-');
        return fetch(`https://marketdata-api.yrzhao1068589.workers.dev/v1/prices/${region}/${slug}`)
          .then(response => response.json())
          .then(priceData => {
            materialCosts.materials[material.id] = priceData.price;
          });
      });
      Promise.all(promises).then(() => {
        materialCosts.lastUpdated = new Date().toISOString();
        saveMaterialCosts();
      });
    });
}

// Load initial data
const savedCosts = localStorage.getItem('materialCosts');
if (savedCosts) {
  const parsedCosts = JSON.parse(savedCosts);
  materialCosts.materials = parsedCosts.materials;
  materialCosts.lastUpdated = parsedCosts.lastUpdated;
  materialCosts.region = parsedCosts.region || 'naw';
} else {
  fetch('/data/materials.json')
    .then(response => response.json())
    .then(data => {
      data.materials.forEach(material => {
        materialCosts.materials[material.id] = 0;
      });
    });
}
