<template>
  <n-card title="Welcome to LOA Buddy!">
    <p>LOA Buddy is a companion app for Lost Ark, designed to help you make informed decisions and maximize your progress in-game.</p>

    <n-h3>Getting Started</n-h3>
    <n-grid :x-gap="12" :y-gap="12" :cols="2">
      <n-gi>
        <router-link to="/materials" custom v-slot="{ navigate }">
          <n-card class="tool-card" hoverable clickable @click="navigate" style="cursor: pointer; height: 100%;">
            <n-thing title="Material Prices" content-style="margin-top: 10px;">
              <template #description>
                Input material prices for calculations.
              </template>
              Input market prices manually or pull them from the API. The tool indicates the cheapest source for materials - green for market and yellow for stronghold exchange. Hovering over the yellow indicator shows the exchanges needed to arrive at the lowest price.
            </n-thing>
          </n-card>
        </router-link>
      </n-gi>
      <n-gi>
        <router-link to="/crafting" custom v-slot="{ navigate }">
          <n-card class="tool-card" hoverable clickable @click="navigate" style="cursor: pointer; height: 100%;">
            <n-thing title="Crafting Calculator" content-style="margin-top: 10px;">
              <template #description>
                Discover the best items to craft for profit.
              </template>
              Calculates profit per hour for stronghold crafting while factoring in stronghold reduction levels for cost and time. Toggle between using market prices or the lowest material cost available via exchange. The cheapest crafting option is automatically selected, but you can explore the cost for all options.
            </n-thing>
          </n-card>
        </router-link>
      </n-gi>
      <n-gi>
        <router-link to="/mari" custom v-slot="{ navigate }">
          <n-card class="tool-card" hoverable clickable @click="navigate" style="cursor: pointer; height: 100%;">
            <n-thing title="Mari's Shop Calculator" content-style="margin-top: 10px;">
              <template #description>
                Calculate the gold value of Mari's Shop deals.
              </template>
              Calculates the gold value of Mari's deals. The most cost-effective bundle for each item displayed, but it can be expanded to view all available deals.
            </n-thing>
          </n-card>
        </router-link>
      </n-gi>
      <n-gi>
        <router-link to="/stronghold" custom v-slot="{ navigate }">
          <n-card class="tool-card" hoverable clickable @click="navigate" style="cursor: pointer; height: 100%;">
            <n-thing title="Stronghold Arbitrage" content-style="margin-top: 10px;">
              <template #description>
                Find arbitrage opportunities via stronghold exchange.
              </template>
              Identifies opportunities to profit from market inefficiencies by using the stronghold to exchange one material for another. The tool shows the full exchange path and profit to be gained from executing it.
            </n-thing>
          </n-card>
        </router-link>
      </n-gi>
    </n-grid>

    <div style="text-align: center; margin-top: 20px;">
      <p>Feedback? Bugs? Feature Requests? <a href="https://discord.gg/m7BfkP5AF8" target="_blank">Join the Discord!</a></p>
    </div>
  </n-card>
</template>

<script setup>
import { NCard, NThing, NH3, NGrid, NGi } from 'naive-ui';
</script>

<style scoped>
.tool-card {
  transition: transform 0.2s ease-in-out;
}
.tool-card:hover {
  transform: scale(1.03);
}
</style>

