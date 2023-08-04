<template>
  <Menu />
  <router-view/>
  
</template>

<script setup>
  import Menu from './components/Menu.vue'
</script>

<style>
  #app {
    max-width: 800px;
    margin: 0 auto;
  }
</style>