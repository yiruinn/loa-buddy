<template>
    <div class="card">
        <TabMenu :model="items" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import TabMenu from 'primevue/tabmenu'

const items = ref([
    {
        label: 'Home',
        icon: 'pi pi-fw pi-home',
        to: '/'
    },
    {
        label: 'Mari',
        to: '/mari'
    },
    {
        label: 'Special Honing',
        to: '/honing'
    },
    {
        label: 'Engravings',
        to: '/engravings'
    },
    {
        label: 'Settings',
        to: '/settings'
    },
]);

</script>
