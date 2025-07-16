<template>
  <MaterialCosts
    title="Trade Skill"
    :layout="tradeSkillLayout"
  />
  <div style="margin-top: 20px;"></div>
  <MaterialCosts
    title="Honing Materials"
    :layout="fusionMaterialLayout"
  />
  <div style="margin-top: 20px;"></div>
  <MaterialCosts
    title="Combat Supplies"
    :layout="combatSuppliesLayout"
  />
  <div style="margin-top: 20px;"></div>
  <MaterialCosts
    title="Cooking"
    :layout="cookingLayout"
  />
</template>

<script setup>
import MaterialCosts from './MaterialCosts.vue';

const tradeSkillLayout = [
  [
    { category: 'Hunting', items: ['thick_raw_meat', 'treated_meat', 'oreha_thick_meat', 'abidos_thick_raw_meat'] },
    { category: 'Fishing', items: ['fish', 'redflesh_fish', 'oreha_solar_carp', 'abidos_solar_carp'] },
    { category: 'Excavating', items: ['ancient_relic', 'rare_relic', 'oreha_relic', 'abidos_relic'] },
  ],
  [
    { category: 'Foraging', items: ['wild_flower', 'shy_wild_flower', 'bright_wild_flower', 'abidos_wild_flower'] },
    { category: 'Logging', items: ['timber', 'tender_timber', 'sturdy_timber', 'abidos_timber'] },
    { category: 'Mining', items: ['iron_ore', 'heavy_iron_ore', 'strong_iron_ore', 'abidos_iron_ore'] },
  ]
];

const fusionMaterialLayout = [
  [
    {
      category: 'Fusion Materials',
      items: ['oreha_fusion_material', 'superior_oreha_fusion_material', 'prime_oreha_fusion_material', 'abidos_fusion_material'],
      columns: 2
    }
  ]
];

const combatSuppliesLayout = [
  [
    { category: 'Recovery', items: ['elemental_hp_potion'] },
    { category: 'Offense', items: ['dark_grenade'] },
    { category: 'Utility', items: ['sacred_charm'] },
  ]
];

const cookingLayout = [
  [
    { category: 'Feasts', items: ['masters_chewy_grilled', 'masters_herb_steak'] }
  ]
];
</script>
