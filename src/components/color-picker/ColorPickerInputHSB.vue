<script setup lang="ts">
import { computed } from 'vue'
import { injectColorPickerContext } from '@/components/color-picker/provider'
import { ButtonGroup } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';

const context = injectColorPickerContext()

const h = computed({
  get: () => Math.round(context.hsv.value?.h ?? 0),
  set: (value: number) => {
    context.hsv.value = { ...context.hsv.value, h: value }
    context.hsva.value = { ...context.hsva.value, h: value }
    context.commitValue()
  },
})

const s = computed({
  get: () => Math.round(context.hsv.value?.s ?? 0),
  set: (value: number) => {
    context.hsv.value = { ...context.hsv.value, s: value }
    context.hsva.value = { ...context.hsva.value, s: value }
    context.commitValue()
  },
})

const b = computed({
  get: () => Math.round(context.hsv.value?.v ?? 0),
  set: (value: number) => {
    context.hsv.value = { ...context.hsv.value, v: value }
    context.hsva.value = { ...context.hsva.value, v: value }
    context.commitValue()
  },
})

const alpha = computed(() => {
  return Math.round((context.rgba.value?.a ?? 1) * 100)
});

function updateValue(label: 'H' | 'S' | 'B', value: string) {
  const num = Number.parseFloat(value)
  if (!Number.isNaN(num)) {
    if (label === 'H') {
      const clamped = Math.max(0, Math.min(360, num))
      h.value = clamped
    }
    else if (label === 'S' || label === 'B') {
      const clamped = Math.max(0, Math.min(100, num))
      if (label === 'S') {
        s.value = clamped;
      }
      else { b.value = clamped }
    }
  }
}
</script>

<template>
  <ButtonGroup class="w-full rounded-lg overflow-hidden [&>div]:flex [&>div]:items-center [&>div]:gap-1 [&>div]:bg-background [&>div]:px-2 [&>div]:py-1 [&>div]:text-xs [&>div]:border [&>div]:border-border [&>div:not(:first-child)]:border-l-0 text-center shadow-xs">
    <div class="min-w-0 rounded-l-lg flex items-center flex-1">
      <span class="text-muted-foreground">H</span>
      <Input
        :model-value="h.toString()"
        type="number"
        min="0"
        max="360"
        class="h-7 w-full min-w-0 flex-1 border-0 bg-transparent! p-0 text-xs shadow-none focus-visible:ring-0 appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-center"
        @update:model-value="(v) => updateValue('H', String(v))"
      />
    </div>
    <div class="min-w-0 flex items-center flex-1">
      <span class="text-muted-foreground">S</span>
      <Input
        :model-value="s.toString()"
        type="number"
        min="0"
        max="100"
        class="h-7 w-full min-w-0 flex-1 border-0 bg-transparent! p-0 text-xs shadow-none focus-visible:ring-0 appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-center"
        @update:model-value="(v) => updateValue('S', String(v))"
      />
    </div>
    <div class="min-w-0 flex items-center flex-1">
      <span class="text-muted-foreground">B</span>
      <Input
        :model-value="b.toString()"
        type="number"
        min="0"
        max="100"
        class="h-7 w-full min-w-0 flex-1 border-0 bg-transparent! p-0 text-xs shadow-none focus-visible:ring-0 appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-center"
        @update:model-value="(v) => updateValue('B', String(v))"
      />
    </div>
    <div class="min-w-0 rounded-r-lg flex items-center flex-1">
      <Input
        :model-value="alpha.toString()"
        type="number"
        min="0"
        max="100"
        class="h-7 w-12 min-w-0 border-0 flex-1 bg-transparent! p-0 text-xs shadow-none focus-visible:ring-0 appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-center"
        @update:model-value="(v) => { const val = Number(v); if (!Number.isNaN(val)) { const clamped = Math.min(100, Math.max(0, val)); context.rgba.value = { ...context.rgba.value, a: clamped / 100 }; context.alpha.value = clamped; context.commitValue(); } }"
      />
      <span class="text-muted-foreground">%</span>
    </div>
  </ButtonGroup>
</template>
