<template>
    <Card style="width: 20em; text-align: center">
        <template #title>
            <p> {{ build.name }} </p>
        </template>
        <template #subtitle>
            <p>Primary Stat: {{ build.primary_stat }}</p>
            <p>Secondary Stat: {{ build.secondary_stats.join(', ') }}</p>
        </template>
        <template #content>
            <p v-for="group in groupedEngravings" :key="group[0].priority"
                :class="{ highlighted: group.some(e => e.highlighted) }">
                {{ group.map(engraving => engraving.name).join(', ') }}
            </p>
        </template>
    </Card>
</template>
  
<script setup>
import { ref, computed } from 'vue';
import Card from 'primevue/card';

const props = defineProps({
    build: Object
});

const groupedEngravings = computed(() => {
    const grouped = {};
    for (const engraving of props.build.engravings) {
        if (!grouped[engraving.priority]) {
            grouped[engraving.priority] = [];
        }
        grouped[engraving.priority].push(engraving);
    }
    return Object.values(grouped);
});
</script>
  

<style scoped>
.highlighted {
    background-color: yellow;
    /* or any other highlight style you prefer */
}
</style>