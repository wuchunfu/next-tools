<script setup lang="ts">
import type { CSSProperties } from 'vue';
import { computed, ref, watchEffect } from 'vue';
import { useThumb } from './composables/useThumb'
import { injectColorPickerContext } from './provider'
import { drawHslGradient, drawHsvGradient } from './utils/canvas'

interface CanvasProps {
  type?: 'HSV' | 'HSL'
  height?: number
  width?: number
  class?: string
}

const props = withDefaults(defineProps<CanvasProps>(), {
  type: 'HSV',
  height: 208,
  width: 208,
});

const rootContext = injectColorPickerContext();
const canvasRef = ref<HTMLCanvasElement | null>(null);

const style = computed<CSSProperties>(() => ({
  position: 'relative',
  height: `${props.height}px`,
  width: `${props.width}px`,
}));

watchEffect(() => {
  const ctx = canvasRef.value?.getContext('2d');
  if (ctx) {
    switch (props.type) {
      case 'HSL':
        drawHslGradient(ctx, rootContext.hsv.value.h);
        break
      case 'HSV':
      default:
        drawHsvGradient(ctx, rootContext.hsv.value.h);
        break
    }
  }
});

const formatType = computed<'HSV' | 'HSL'>(() => props.type);

const {
  thumbStyles,
  handleWheel,
  handleKeyDown,
  handlePointerDown,
} = useThumb(canvasRef, formatType);
</script>

<template>
  <div
    :style="style"
    class="relative rounded-lg border bg-background" :class="[props.class]"
    :data-disabled="rootContext.disabled.value ? '' : null"
    @contextmenu.prevent
    @keydown="handleKeyDown"
    @pointerdown="handlePointerDown"
    @wheel="handleWheel($event)"
  >
    <canvas
      ref="canvasRef"
      :height="props.height"
      :width="props.width"
      class="h-full w-full rounded-lg"
    />
    <span
      tabindex="0"
      :style="thumbStyles"
      class="border-background ring-ring/60 absolute size-3 rounded-full border ring-2"
    />
  </div>
</template>
