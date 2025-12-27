<script setup lang="ts">
import { SliderRoot, SliderThumb, SliderTrack } from 'reka-ui';
import { computed } from 'vue';
import { injectColorPickerContext } from './provider'

const props = defineProps<{ class?: string, orientation?: 'horizontal' | 'vertical' }>()
const rootContext = injectColorPickerContext()

const hueValue = computed({
  get: () => [rootContext.hsv.value.h],
  set: ([value]: number[]) => {
    rootContext.hsv.value = { ...rootContext.hsv.value, h: value as number }
  },
})

const trackBackground = computed(() => {
  const direction = props.orientation === 'vertical' ? 'to top' : 'to right'
  return `linear-gradient(${direction}, red, yellow, lime, cyan, blue, magenta, red)`
});
</script>

<template>
  <SliderRoot
    v-model="hueValue"
    :disabled="rootContext.disabled.value"
    :max="360"
    :orientation="props.orientation ?? 'horizontal'"
    class="relative flex items-center select-none" :class="[props.class]"
    @value-commit="rootContext.commitValue()"
  >
    <SliderTrack
      :style="{ background: trackBackground }"
      class="bg-transparent relative h-2 w-full overflow-hidden rounded-full"
    />
    <SliderThumb
      aria-label="Hue"
      :style="{ background: `hsl(${rootContext.hsv.value.h},100%,50%)` }"
      class="bg-white border border-border shadow-sm size-4 rounded-full"
    />
  </SliderRoot>
</template>
