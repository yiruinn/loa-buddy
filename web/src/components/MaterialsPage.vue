<template>
  <MaterialCosts :materials="materials" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import MaterialCosts from './MaterialCosts.vue';

const materials = ref([]);

onMounted(async () => {
  try {
    const materialsResponse = await fetch('/data/materials.json');
    const materialsData = await materialsResponse.json();
    materials.value = materialsData.materials;
  } catch (error) {
    console.error('Failed to load data:', error);
  }
});
</script>