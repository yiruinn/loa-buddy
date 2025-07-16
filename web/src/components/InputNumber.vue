<template>
  <n-input-number
    :value="displayValue"
    @update:value="handleUpdate"
    @blur="handleBlur"
    v-bind="$attrs"
  >
    <template v-for="(_, slot) in $slots" #[slot]="slotProps">
      <slot :name="slot" v-bind="slotProps || {}"></slot>
    </template>
  </n-input-number>
</template>

<script setup>
import { ref, watch } from 'vue';
import { NInputNumber } from 'naive-ui';

const props = defineProps({
  value: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['update:value']);

const displayValue = ref(props.value);

watch(() => props.value, (newValue) => {
  displayValue.value = newValue;
});

const handleUpdate = (newValue) => {
  displayValue.value = newValue;
  emit('update:value', newValue);
};

const handleBlur = () => {
  if (displayValue.value === null) {
    emit('update:value', 0);
  }
};
</script>