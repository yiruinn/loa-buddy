<template>
    <div class="table-container">
        <DataTable :value="items">
            <Column field="level" header="Level"></Column>
            <Column :field="calculateGoldCost" header="Total Cost"></Column>
            <Column :field="calculateGoldPerSpecial" header="Cost Per"></Column>
        </DataTable>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const props = defineProps({
    items: Object,
    calculateGoldCost: Function,
    calculateGoldPerSpecial: Function,
})

</script>
