<template>
  <div>
    <h1>Market Tracker</h1>
    <n-form @submit.prevent="fetchData">
      <n-form-item label="Server">
        <n-input v-model:value="server" />
      </n-form-item>
      <n-form-item label="Item">
        <n-input v-model:value="item" />
      </n-form-item>
      <n-form-item label="Start Date">
        <n-date-picker v-model:value="startDate" type="date" />
      </n-form-item>
      <n-form-item label="End Date">
        <n-date-picker v-model:value="endDate" type="date" />
      </n-form-item>
      <n-button type="primary" @click="fetchData">Fetch Data</n-button>
    </n-form>
    <div style="height: 400px">
      <Line v-if="chartData" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { NForm, NFormItem, NInput, NDatePicker, NButton } from 'naive-ui';
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
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

const server = ref('naw');
const item = ref('fish');
const startDate = ref(new Date('2025-07-01').getTime());
const endDate = ref(new Date('2025-07-10').getTime());

const chartData = ref(null);
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: 'rgba(255, 255, 255, 0.85)'
      }
    }
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
  }
});

async function fetchData() {
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  const startDateString = start.toISOString().split('T')[0];
  const endDateString = end.toISOString().split('T')[0];
  const url = `https://marketdata-api.yrzhao1068589.workers.dev/v1/prices/historical/${server.value}/${item.value}?start_date=${startDateString}&end_date=${endDateString}`;

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
          backgroundColor: 'rgba(231, 76, 60, 0.5)',
          pointRadius: minPricePointRadius,
          spanGaps: true,
        },
        {
          label: 'Max Price',
          data: maxPrices,
          borderColor: '#27ae60',
          backgroundColor: 'rgba(39, 174, 96, 0.5)',
          pointRadius: maxPricePointRadius,
          spanGaps: true,
        },
        {
          label: 'Avg Price',
          data: avgPrices,
          borderColor: '#2980b9',
          backgroundColor: 'rgba(52, 152, 219, 0.5)',
          pointRadius: avgPricePointRadius,
          spanGaps: true,
        },
      ],
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    chartData.value = null;
  }
}
</script>
