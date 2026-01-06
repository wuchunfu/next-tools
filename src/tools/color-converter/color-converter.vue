<script setup lang="ts">
import type { Colord } from 'colord'
import type { ColorObject } from '@/components/color-picker/utils/types';
import { syncRef, useStorage } from '@vueuse/core';
import { colord, extend } from 'colord';
import cmykPlugin from 'colord/plugins/cmyk';
import hwbPlugin from 'colord/plugins/hwb';
import lchPlugin from 'colord/plugins/lch';
import namesPlugin from 'colord/plugins/names';
import { forEach } from 'lodash-es';
import { Palette, Pipette } from 'lucide-vue-next';
import ColorPickerWithTabs from '@/components/ColorPickerWithTabs.vue';
import InputCopyable from '@/components/InputCopyable.vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldSet } from '@/components/ui/field';
import { useToolI18n } from '@/composable/useToolI18n';
import { hexToColorObject } from '@/utils/color';
import { buildColorFormat } from './color-converter.models';

extend([cmykPlugin, hwbPlugin, namesPlugin, lchPlugin])

const { t } = useToolI18n()

const pickerColor = ref<ColorObject | null>(null)

function colorObjectToColord(colorObj: ColorObject | null): Colord | undefined {
  if (!colorObj) { return undefined }
  const rgba = colorObj.rgba
  return colord({ r: rgba.r, g: rgba.g, b: rgba.b, a: rgba.a })
}

// Persisted color (hex)
const storedHex = useStorage('color-converter:hex', '#1ea54c')
// Initialize picker color from storage
pickerColor.value = hexToColorObject(storedHex.value)
syncRef<ColorObject | null, string>(
  pickerColor,
  storedHex,
  {
    transform: {
      // pickerColor -> storedHex
      ltr: (left) => {
        if (!left) { return '' }
        return left.hexa // 直接使用完整的8位hex值
      },
      // storedHex -> pickerColor
      rtl: (right) => {
        try {
          const c = colord(right)
          return c.isValid() ? hexToColorObject(right) : null
        }
        catch {
          return null
        }
      },
    },
    deep: true,
  },
)

const formats = {
  hex: buildColorFormat({
    label: 'tools.color-converter.hex',
    format: (v: Colord) => v.toHex(),
  }),
  rgb: buildColorFormat({
    label: 'tools.color-converter.rgb',
    format: (v: Colord) => v.toRgbString(),
  }),
  hsl: buildColorFormat({
    label: 'tools.color-converter.hsl',
    format: (v: Colord) => v.toHslString(),
  }),
  hwb: buildColorFormat({
    label: 'tools.color-converter.hwb',
    format: (v: Colord) => v.toHwbString(),
  }),
  lch: buildColorFormat({
    label: 'tools.color-converter.lch',
    format: (v: Colord) => v.toLchString(),
  }),
  cmyk: buildColorFormat({
    label: 'tools.color-converter.cmyk',
    format: (v: Colord) => v.toCmykString(),
  }),
  name: buildColorFormat({
    label: 'tools.color-converter.name',
    format: (v: Colord) => v.toName({ closest: true }) ?? t('tools.color-converter.unknown'),
  }),
}

function updateColorValue(value: Colord | undefined, omitLabel?: string) {
  if (value === undefined) {
    return
  }

  if (!value.isValid()) {
    return
  }

  forEach(formats, ({ value: valueRef, format }, key) => {
    if (key !== omitLabel) {
      valueRef.value = format(value)
    }
  })
}

watch(pickerColor, (newColor) => {
  if (newColor) {
    const color = colorObjectToColord(newColor)
    if (color && color.isValid()) {
      updateColorValue(color)
    }
  }
}, { immediate: true })

// Note: formats are driven from pickerColor only. Editing formats will not override pickerColor.
</script>

<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <Card class="lg:col-span-1 overflow-hidden">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Palette class="h-5 w-5 text-primary" />
            {{ t('tools.color-converter.cardPickerTitle', 'Color Picker') }}
          </CardTitle>
          <CardDescription>
            {{ t('tools.color-converter.cardPickerDescription', 'Select a color using the color picker.') }}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent class="space-y-5">
        <FieldSet>
          <Field orientation="vertical" class="gap-3">
            <FieldContent>
              <ColorPickerWithTabs v-model="pickerColor" />
            </FieldContent>
          </Field>
        </FieldSet>
      </CardContent>
    </Card>

    <Card class="lg:col-span-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Pipette class="h-5 w-5 text-primary" />
            {{ t('tools.color-converter.cardFormatsTitle', 'Color Formats') }}
          </CardTitle>
          <CardDescription>
            {{ t('tools.color-converter.cardFormatsDescription', 'Convert between different color formats. Edit any field to update all formats.') }}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent class="space-y-5">
        <FieldSet>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <template v-for="({ label, validation, type }, key) in formats" :key="key">
              <div v-if="type === 'text'" class="space-y-2">
                <InputCopyable
                  readonly
                  :value="formats[key].value.value"
                  :label="t(label as string)"
                  :field-props="{ orientation: 'vertical' }"
                  @update:value="(v: string) => updateColorValue(formats[key].parse(v), key)"
                />
                <p v-if="validation.status === 'error'" class="text-xs text-destructive">
                  {{ validation.message }}
                </p>
              </div>
            </template>
          </div>
        </FieldSet>
      </CardContent>
    </Card>
  </div>
</template>
