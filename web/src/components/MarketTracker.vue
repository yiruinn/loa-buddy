<template>
  <div class="market-tracker-container">
    <div class="controls">
      <h1>Market Tracker</h1>
      <n-form>
        <n-form-item>
          <n-radio-group v-model:value="selectedRange" name="radiogroup" class="time-range-group">
            <n-radio-button
              v-for="range in timeRanges"
              :key="range.value"
              :value="range.value"
              :label="range.label"
              class="time-range-button"
            />
          </n-radio-group>
        </n-form-item>
        <n-form-item label="Region">
          <n-select
            v-model:value="region"
            :options="regionOptions"
          />
        </n-form-item>
        <n-form-item label="Category">
          <n-select
            v-model:value="selectedCategory"
            :options="categoryOptions"
            @update:value="onCategoryChange"
          />
        </n-form-item>
        <n-form-item label="Item">
          <n-select
            v-model:value="item"
            filterable
            :options="itemOptions"
          />
        </n-form-item>
      </n-form>
    </div>
    <div class="chart-container">
      <Line v-if="chartData" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { NForm, NFormItem, NSelect, NRadioGroup, NRadioButton } from 'naive-ui';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler
);

const region = ref('naw');
const item = ref(null);
const allItems = ref({});
const selectedCategory = ref(null);
const selectedRange = ref('7d');

const timeRanges = [
  { label: '7d', value: '7d' },
  { label: '14d', value: '14d' },
  { label: '30d', value: '30d' },
];

const regionOptions = [
  { label: 'North America West', value: 'naw' },
  { label: 'North America East', value: 'nae' },
  { label: 'Europe Central', value: 'euc' },
];

const categoryOptions = computed(() => {
  return Object.keys(allItems.value)
    .sort((a, b) => a.localeCompare(b))
    .map(category => ({
      label: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: category
    }));
});

const itemOptions = computed(() => {
  if (!selectedCategory.value || !allItems.value[selectedCategory.value]) {
    return [];
  }
  const subCategories = allItems.value[selectedCategory.value];
  const options = [];
  const sortedSubCategoryKeys = Object.keys(subCategories).sort((a, b) => a.localeCompare(b));

  for (const subCategoryKey of sortedSubCategoryKeys) {
    const subCategoryName = subCategoryKey.charAt(0).toUpperCase() + subCategoryKey.slice(1);
    const items = [...subCategories[subCategoryKey]].sort((a, b) => a.name.localeCompare(b.name));

    if (subCategoryKey === 'all') {
      options.push(...items.map(i => ({ label: i.name, value: i.slug })));
    } else {
      options.push({
        type: 'group',
        label: subCategoryName,
        key: subCategoryKey,
        children: items.map(i => ({ label: i.name, value: i.slug }))
      });
    }
  }
  return options;
});

function onCategoryChange(newCategory) {
  if (newCategory && allItems.value[newCategory]) {
    const subCategories = allItems.value[newCategory];
    const sortedSubCategoryKeys = Object.keys(subCategories).sort((a, b) => a.localeCompare(b));
    const firstSubCategoryKey = sortedSubCategoryKeys[0];
    if (firstSubCategoryKey && subCategories[firstSubCategoryKey].length > 0) {
      item.value = subCategories[firstSubCategoryKey][0].slug;
    } else {
      item.value = null;
    }
  } else {
    item.value = null;
  }
}

onMounted(async () => {
  const response = await fetch('/data/items.json');
  allItems.value = await response.json();
  if (Object.keys(allItems.value).length > 0) {
    const sortedCategories = Object.keys(allItems.value).sort((a, b) => a.localeCompare(b));
    selectedCategory.value = sortedCategories[0];
    onCategoryChange(selectedCategory.value);
  }
});

watch([region, item, selectedRange], () => {
  fetchData();
});

const chartData = ref(null);
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: 'rgba(255, 255, 255, 0.85)'
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
  scales: {
    x: {
      ticks: {
        color: 'rgba(255, 255, 255, 0.85)'
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.2)'
      }
    },
    y: {
      ticks: {
        color: 'rgba(255, 255, 255, 0.85)'
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.2)'
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
});

function createGradient(context, color1, color2) {
  const chart = context.chart;
  const {ctx, chartArea} = chart;
  if (!chartArea) {
    return null;
  }
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
}

async function fetchData() {
  if (!item.value) return;

  const end = new Date();
  const start = new Date();
  const days = parseInt(selectedRange.value.replace('d', ''));
  start.setDate(end.getDate() - days);

  const startDateString = start.toISOString().split('T')[0];
  const endDateString = end.toISOString().split('T')[0];
  const url = `https://marketdata-api.yrzhao1068589.workers.dev/v1/prices/historical/${region.value}/${item.value}?start_date=${startDateString}&end_date=${endDateString}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const dataMap = new Map(data.map(d => [d.day, d]));

    const labels = [];
    const minPrices = [];
    const maxPrices = [];
    const avgPrices = [];
    
    const minPricePointRadius = [];
    const maxPricePointRadius = [];
    const avgPricePointRadius = [];

    let lastKnown = { min_price: null, max_price: null, avg_price: null };

    for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
      const dayString = day.toISOString().split('T')[0];
      labels.push(dayString);

      if (dataMap.has(dayString)) {
        const pointData = dataMap.get(dayString);
        minPrices.push(pointData.min_price);
        maxPrices.push(pointData.max_price);
        avgPrices.push(pointData.avg_price);
        
        minPricePointRadius.push(3);
        maxPricePointRadius.push(3);
        avgPricePointRadius.push(3);

        lastKnown = pointData;
      } else {
        minPrices.push(lastKnown.min_price);
        maxPrices.push(lastKnown.max_price);
        avgPrices.push(lastKnown.avg_price);

        minPricePointRadius.push(0);
        maxPricePointRadius.push(0);
        avgPricePointRadius.push(0);
      }
    }
    
    chartData.value = {
      labels,
      datasets: [
        {
          label: 'Min Price',
          data: minPrices,
          borderColor: '#c0392b',
          backgroundColor: (context) => createGradient(context, 'rgba(231, 76, 60, 0.1)', 'rgba(231, 76, 60, 0.5)'),
          pointRadius: minPricePointRadius,
          spanGaps: true,
          fill: true,
          tension: 0.3,
        },
        {
          label: 'Max Price',
          data: maxPrices,
          borderColor: '#27ae60',
          backgroundColor: (context) => createGradient(context, 'rgba(39, 174, 96, 0.1)', 'rgba(39, 174, 96, 0.5)'),
          pointRadius: maxPricePointRadius,
          spanGaps: true,
          fill: true,
          tension: 0.3,
        },
        {
          label: 'Avg Price',
          data: avgPrices,
          borderColor: '#2980b9',
          backgroundColor: (context) => createGradient(context, 'rgba(52, 152, 219, 0.1)', 'rgba(52, 152, 219, 0.5)'),
          pointRadius: avgPricePointRadius,
          spanGaps: true,
          fill: true,
          tension: 0.3,
        },
      ],
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    chartData.value = null;
  }
}
</script>
<style scoped>
.market-tracker-container {
  display: flex;
  gap: 20px;
}
.controls {
  width: 300px;
}
.chart-container {
  flex: 1;
  height: 600px;
}
.time-range-group {
  width: 100%;
  display: flex;
}
.time-range-button {
  flex: 1;
  text-align: center;
}
</style>
