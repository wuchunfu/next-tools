<script setup lang="ts">
import { computed } from 'vue'
import { injectColorPickerContext } from '@/components/color-picker/provider'
import { ButtonGroup } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';

const context = injectColorPickerContext()

const r = computed({
  get: () => context.rgb.value?.r ?? 0,
  set: (value: number) => {
    context.rgb.value = { ...context.rgb.value, r: value }
    context.rgba.value = { ...context.rgba.value, r: value }
    context.commitValue()
  },
})

const g = computed({
  get: () => context.rgb.value?.g ?? 0,
  set: (value: number) => {
    context.rgb.value = { ...context.rgb.value, g: value }
    context.rgba.value = { ...context.rgba.value, g: value }
    context.commitValue()
  },
})

const b = computed({
  get: () => context.rgb.value?.b ?? 0,
  set: (value: number) => {
    context.rgb.value = { ...context.rgb.value, b: value }
    context.rgba.value = { ...context.rgba.value, b: value }
    context.commitValue()
  },
})

const alpha = computed(() => {
  return Math.round((context.rgba.value?.a ?? 1) * 100)
});

function updateValue(label: 'R' | 'G' | 'B', value: string) {
  const num = Number.parseInt(value, 10)
  if (!Number.isNaN(num) && num >= 0 && num <= 255) {
    if (label === 'R') { r.value = num }
    else if (label === 'G') { g.value = num }
    else if (label === 'B') { b.value = num }
  }
}
</script>

<template>
  <ButtonGroup class="w-full rounded-lg overflow-hidden [&>div]:flex [&>div]:items-center [&>div]:gap-1 [&>div]:bg-background [&>div]:px-2 [&>div]:py-1 [&>div]:text-xs [&>div]:border [&>div]:border-border [&>div:not(:first-child)]:border-l-0 shadow-xs">
    <div class="min-w-0 rounded-l-lg flex items-center flex-1">
      <span class="text-muted-foreground">R</span>
      <Input
        :model-value="r.toString()"
        type="number"
        min="0"
        max="255"
        class="h-7 w-full min-w-0 flex-1 border-0 bg-transparent! p-0 text-xs shadow-none focus-visible:ring-0 appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-center"
        @update:model-value="(v) => updateValue('R', String(v))"
      />
    </div>
    <div class="min-w-0 flex items-center flex-1">
      <span class="text-muted-foreground">G</span>
      <Input
        :model-value="g.toString()"
        type="number"
        min="0"
        max="255"
        class="h-7 w-full min-w-0 flex-1 border-0 bg-transparent! p-0 text-xs shadow-none focus-visible:ring-0 appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-center"
        @update:model-value="(v) => updateValue('G', String(v))"
      />
    </div>
    <div class="min-w-0 flex items-center flex-1">
      <span class="text-muted-foreground">B</span>
      <Input
        :model-value="b.toString()"
        type="number"
        min="0"
        max="255"
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
        class="h-7 w-12 min-w-0 border-0 bg-transparent! p-0 text-xs shadow-none text-center focus-visible:ring-0 appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none flex-1"
        @update:model-value="(v) => { const val = Number(v); if (!Number.isNaN(val)) { const clamped = Math.min(100, Math.max(0, val)); context.rgba.value = { ...context.rgba.value, a: clamped / 100 }; context.alpha.value = clamped; context.commitValue(); } }"
      />
      <span class="text-muted-foreground">%</span>
    </div>
  </ButtonGroup>
</template>
