<!-- <template>
    <div>
        <BuildCard :build="buildData[0]" />
    </div>
</template>
  
<script setup>
import BuildCard from '../components/EngravingCard.vue'; // Adjust the path as needed
import buildData from '../data/engravings.json'

</script> -->
  

<template>
    <div>
        <h1>Build Search</h1>

        <h2>Engravings</h2>
        <div class="formgrid grid">
            <div class="field col">
                <Dropdown id="engraving1" editable v-model="engraving1" :options="allEngravings"
                    placeholder="Select Engraving" class="w-full" @change="filterBuilds" />
            </div>
            <div class="field col">
                <Dropdown id="engraving2" editable v-model="engraving2" :options="allEngravings"
                    placeholder="Select Engraving" class="w-full" @change="filterBuilds" />
            </div>
            <div class="field col">
                <Button @click="resetFilters">Reset</button>
            </div>
        </div>

        <hr>

        <h2>Builds (Two match only)</h2>
        <div v-if="filteredBuilds.length > 0">
            <EngravingCard v-for="build in filteredBuilds" :build="build" />
        </div>
        <div v-else>
            <p>No matching builds.</p>
        </div>
    </div>
</template>
  
<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';

import EngravingCard from '../components/EngravingCard.vue';
import builds from '../data/builds.json'
import allEngravings from '../data/engravings.json'

import '/node_modules/primeflex/primeflex.css'


const engraving1 = ref('');
const engraving2 = ref('');
const filteredBuilds = ref([]);

const filterBuilds = () => {
    filteredBuilds.value = []

    // // Apply the engraving filters
    for (let build of builds) {
        const engraving1Found = build.engravings.find(e => e.name === engraving1.value);
        const engraving2Found = build.engravings.find(e => e.name === engraving2.value);

        if (engraving1Found && engraving2Found && engraving1Found.priority !== engraving2Found.priority) {
            let buildCopy = { ...build }
            buildCopy.engravings.forEach(engraving => {
                if (engraving.name === engraving1.value || engraving.name === engraving2.value) {
                    engraving.highlighted = true;
                } else {
                    engraving.highlighted = false;
                }
            });
            filteredBuilds.value.push(buildCopy)
        }
    }
};

const resetFilters = () => {
    // Reset selected engravings and display all builds
    engraving1.value = '';
    engraving2.value = '';
    filteredBuilds.value = [];
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
  
  
  