<script setup lang="ts">
import { SliderRoot, SliderThumb, SliderTrack } from 'reka-ui';
import { computed } from 'vue';
import { injectColorPickerContext } from './provider'

const props = defineProps<{ class?: string, orientation?: 'horizontal' | 'vertical' }>()
const rootContext = injectColorPickerContext()

const alphaValue = computed({
  get: () => [rootContext.alpha.value],
  set: ([value]: number[]) => {
    rootContext.alpha.value = value as number
  },
})

const trackStyle = computed(() => {
  const gradientDirection = props.orientation === 'vertical' ? 'to top' : 'to right'
  return {
    background: [
      `linear-gradient(${gradientDirection}, rgba(0, 0, 0, 0) 0%, ${rootContext.hex.value} 100%)`,
      'repeating-conic-gradient(#ddd 0% 25%, transparent 0% 50%) 50% / 8px 8px',
    ].join(','),
  }
});
</script>

<template>
  <SliderRoot
    v-model="alphaValue"
    :disabled="rootContext.disabled.value"
    :orientation="props.orientation ?? 'horizontal'"
    class="relative flex items-center select-none" :class="[props.class]"
    :min="0"
    :max="100"
    :step="1"
    @value-commit="rootContext.commitValue()"
  >
    <SliderTrack
      :style="trackStyle"
      class="relative h-2 w-full overflow-hidden rounded-full border"
    />
    <SliderThumb
      :style="{ backgroundColor: rootContext.hexa.value }"
      class="bg-white border border-border shadow-sm size-4 rounded-full"
      aria-label="Opacity"
    />
  </SliderRoot>
</template>
