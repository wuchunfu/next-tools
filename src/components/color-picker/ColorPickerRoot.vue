<script lang="ts" setup>
import type { ColorObject, Format } from './utils/types'
import { computed, watch } from 'vue'
import { useColor } from './composables/useColor';
import { useVModel } from './composables/useVModel';
import { provideColorPickerContext } from './provider';

type ModelValue = string | ColorObject | null

interface ColorPickerRootProps {
  class?: string
  disabled?: boolean
  defaultValue?: string
  modelValue: ModelValue
  format?: Format
}

const props = withDefaults(defineProps<ColorPickerRootProps>(), {
  disabled: false,
  defaultValue: '#B63DDAFF',
  format: 'hexa',
});

const emit = defineEmits<{
  (e: 'valueCommit', value: ModelValue): void
  (e: 'update:modelValue', value: ModelValue): void
}>();

const color = useColor();

const modelValue = useVModel<ModelValue>(props, emit, (value: ModelValue) => {
  if (
    value === null
    || (props.format === 'object' && typeof value !== 'object')
    || (props.format !== 'object' && typeof value === 'object')
  ) {
    color.hexa.value = props.defaultValue;
  }
  else {
    color.fromFormat(value as string | ColorObject, props.format as Format);
  }
});

watch(
  () => [color.hexa.value, color.hsv.value],
  () => (modelValue.value = color.toFormat(props.format as Format)),
);

const disabled = computed(() => props.disabled);
const isAlphaEnabled = computed(() => ['hexa', 'rgba', 'hsva', 'object'].includes(props.format!));

provideColorPickerContext({
  ...color,
  disabled,
  isAlphaEnabled,
  commitValue: () => {
    if (!props.disabled) {
      emit('valueCommit', color.toFormat(props.format as Format));
    }
  },
});
</script>

<template>
  <div class="flex flex-col gap-3" :class="[props.class]">
    <slot />
  </div>
</template>
