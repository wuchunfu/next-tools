<script lang="ts" setup>
import type { ColorObject } from '@/components/color-picker/utils/types'
import { Pipette } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import ColorPickerCanvas from '@/components/color-picker/ColorPickerCanvas.vue'
import ColorPickerEyeDropper from '@/components/color-picker/ColorPickerEyeDropper.vue'
import ColorPickerInputHex from '@/components/color-picker/ColorPickerInputHex.vue'
import ColorPickerInputHSB from '@/components/color-picker/ColorPickerInputHSB.vue'
import ColorPickerInputHSL from '@/components/color-picker/ColorPickerInputHSL.vue'
import ColorPickerInputRGB from '@/components/color-picker/ColorPickerInputRGB.vue'
import ColorPickerRoot from '@/components/color-picker/ColorPickerRoot.vue'
import ColorPickerSliderAlpha from '@/components/color-picker/ColorPickerSliderAlpha.vue'
import ColorPickerSliderHue from '@/components/color-picker/ColorPickerSliderHue.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const props = defineProps<{
  modelValue: ColorObject | null
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: ColorObject | null): void
}>();

const color = computed({
  get: () => props.modelValue,
  set: (value: ColorObject | null) => {
    emit('update:modelValue', value);
  },
});

const format = ref<string>('hex');

const canvasType = computed<'HSL' | 'HSV'>(() => {
  return format.value === 'hsl' ? 'HSL' : 'HSV';
})
</script>

<template>
  <ColorPickerRoot
    v-model="color"
    format="object"
  >
    <ColorPickerCanvas class="mx-auto" :type="canvasType" />
    <div class="flex items-center gap-3">
      <ColorPickerEyeDropper>
        <Pipette class="h-6 w-6" />
      </ColorPickerEyeDropper>
      <div class="flex flex-col flex-1 gap-2">
        <ColorPickerSliderHue />
        <ColorPickerSliderAlpha />
      </div>
    </div>
    <div class="flex items-center gap-2">
      <Tabs
        v-model="format"
        default-value="hex"
        class="w-full"
      >
        <TabsList class="w-full grid grid-cols-4">
          <TabsTrigger value="hex">
            Hex
          </TabsTrigger>
          <TabsTrigger value="rgb">
            RGB
          </TabsTrigger>
          <TabsTrigger value="hsl">
            HSL
          </TabsTrigger>
          <TabsTrigger value="hsb">
            HSB
          </TabsTrigger>
        </TabsList>
        <TabsContent class="mt-2" value="hex">
          <ColorPickerInputHex />
        </TabsContent>
        <TabsContent class="mt-2" value="rgb">
          <ColorPickerInputRGB />
        </TabsContent>
        <TabsContent class="mt-2" value="hsl">
          <ColorPickerInputHSL />
        </TabsContent>
        <TabsContent class="mt-2" value="hsb">
          <ColorPickerInputHSB />
        </TabsContent>
      </Tabs>
    </div>
  </ColorPickerRoot>
</template>
