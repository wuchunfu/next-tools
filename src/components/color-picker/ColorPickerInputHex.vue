<script setup lang="ts">
import { computed } from 'vue';
import { injectColorPickerContext } from '@/components/color-picker/provider';
import { ButtonGroup } from '@/components/ui/button-group'
import { Input } from '@/components/ui/input'

const context = injectColorPickerContext();

const hexValue = computed({
  get: () => context.hex.value ?? '',
  set: (value: string) => {
    const hex = value.startsWith('#') ? value : `#${value}`;
    if (/^#[0-9A-F]{3,6}$/i.test(hex) || /^#[0-9A-F]{4,8}$/i.test(hex)) {
      const r = Number.parseInt(hex.slice(1, 3), 16);
      const g = Number.parseInt(hex.slice(3, 5), 16);
      const b = Number.parseInt(hex.slice(5, 7), 16);
      const a = hex.length > 7 ? Number.parseInt(hex.slice(7, 9), 16) / 255 : 1;

      context.rgb.value = { r, g, b };
      context.rgba.value = { r, g, b, a };
      context.hex.value = hex.length === 7 ? hex : hex.slice(0, 7);
      context.hexa.value = hex;
      context.commitValue();
    }
  },
});

const alpha = computed(() => {
  return Math.round((context.rgba.value?.a ?? 1) * 100);
})
</script>

<template>
  <ButtonGroup class="w-full rounded-lg overflow-hidden [&>div]:flex [&>div]:items-center [&>div]:gap-1 [&>div]:bg-background [&>div]:px-2 [&>div]:py-1 [&>div]:text-xs [&>div]:border [&>div]:border-border [&>div:not(:first-child)]:border-l-0 shadow-xs">
    <div class="min-w-0 rounded-l-lg flex items-center flex-1">
      <span class="text-muted-foreground">#</span>
      <Input
        :model-value="hexValue.replace('#', '')"
        class="h-7 w-full min-w-0 flex-1 border-0 bg-transparent! p-0 text-xs shadow-none focus-visible:ring-0 text-center"
        @update:model-value="(v) => hexValue = v as string"
      />
    </div>
    <div class="min-w-0 rounded-r-lg flex items-center">
      <Input
        :model-value="alpha.toString()"
        type="number"
        min="0"
        max="100"
        class="h-7 w-12 min-w-0 border-0 bg-transparent! p-0 text-xs shadow-none text-center focus-visible:ring-0 appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        @update:model-value="(v) => { const val = Number(v); if (!Number.isNaN(val)) { const clamped = Math.min(100, Math.max(0, val)); context.rgba.value = { ...context.rgba.value, a: clamped / 100 }; context.alpha.value = clamped; context.commitValue(); } }"
      />
      <span class="text-muted-foreground">%</span>
    </div>
  </ButtonGroup>
</template>
