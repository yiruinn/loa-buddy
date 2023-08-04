<template>
  <div id="app">
    <h1>Special Honing</h1>
    <h2>Prices</h2>
    <div class="formgroup-inline">
      <div class="field">
        <label for="firstname3">Honor Shards (/500)</label>
        <InputText id="firstname3" style="width:200px" v-model="honorShardsPrice" placeholder="Enter value" />
      </div>
      <div class="field">
        <label for="firstname3">Guardian Stones (/10)</label>
        <InputText id="firstname3" style="width:200px" v-model="gstonesPrice" placeholder="Enter value" />
      </div>
      <div class="field">
        <label for="firstname3">Destruction Stones (/10)</label>
        <InputText id="firstname3" style="width:200px" v-model="dstonesPrice" placeholder="Enter value" />
      </div>
      <div class="field">
        <label for="firstname3">Fusion</label>
        <InputText id="firstname3" style="width:200px" v-model="fusionPrice" placeholder="Enter value" />
      </div>
      <div class="field">
        <label for="firstname3">Leapstones</label>
        <InputText id="firstname3" style="width:200px" v-model="leapsPrice" placeholder="Enter value" />
      </div>
    </div>
    <hr>
    <h2>Gold Efficiency Per Special (1490)</h2>
    <div class="formgrid grid">
      <div class="field col">
        <HoningTable :items="armorLevels" :calculateGoldCost="calculateGoldCost"
          :calculateGoldPerSpecial="calculateGoldPerSpecial" />
      </div>
      <div class="field col">
        <HoningTable :items="weaponLevels" :calculateGoldCost="calculateGoldCost"
          :calculateGoldPerSpecial="calculateGoldPerSpecial" />
      </div>
    </div>

  </div>
</template>
  
<script setup>
import { ref, computed } from 'vue';
import InputText from 'primevue/inputtext';

import HoningTable from '../components/HoningTable.vue';
import jsonData from '../data/honing_brel.json';

import '/node_modules/primeflex/primeflex.css'

const honorShardsPrice = ref();
const fusionPrice = ref();
const gstonesPrice = ref();
const dstonesPrice = ref();
const leapsPrice = ref();

const armorLevels = computed(() => jsonData.filter(item => item.level.includes('Armor')));
const weaponLevels = computed(() => jsonData.filter(item => item.level.includes('Weapon')));

const calculateGoldCost = (item) => {
  return (
    item.honor_shards * honorShardsPrice.value / 500 +
    item.fusion * fusionPrice.value +
    (item.gstones ?? 0) * gstonesPrice.value / 10 +
    (item.dstones ?? 0) * dstonesPrice.value / 10 +
    item.leaps * leapsPrice.value
  );
};

const calculateGoldPerSpecial = (item) => {
  return (calculateGoldCost(item) / item.special).toFixed(2);
};
</script>
  
<style scoped>
label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 5px;
}

h2 {
  margin-top: 20px;
}

hr {
  border: 1px solid #ddd;
  margin-top: 20px;
  margin-bottom: 20px;
}
</style>
  