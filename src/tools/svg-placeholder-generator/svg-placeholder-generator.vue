<script setup lang="ts">
import type { ColorObject } from '@/components/color-picker/utils/types';
import { useStorage } from '@vueuse/core';
import { Download, Palette, Settings2 } from 'lucide-vue-next';
import ColorPickerWithTabs from '@/components/ColorPickerWithTabs.vue';
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { Field, FieldContent, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useDownloadFileFromBase64 } from '@/composable/downloadBase64';
import { useToolI18n } from '@/composable/useToolI18n';
import { textToBase64 } from '@/utils/base64';
import { hexToColorObject } from '@/utils/color';

const { t } = useToolI18n()

const width = useStorage('svg-placeholder:width', 600)
const height = useStorage('svg-placeholder:height', 350)
const fontSize = useStorage('svg-placeholder:font-size', 26)
const bgColor = useStorage('svg-placeholder:bg-color', '#ccccccff')
const fgColor = useStorage('svg-placeholder:fg-color', '#333333ff')
const useExactSize = useStorage('svg-placeholder:use-exact-size', true)
const customText = useStorage('svg-placeholder:custom-text', '')

const bgColorOpen = ref(false)
const fgColorOpen = ref(false)

const bgColorObj = computed({
  get: () => hexToColorObject(bgColor.value),
  set: (val: ColorObject | null) => {
    if (val) { bgColor.value = val.hexa }
  },
})

const fgColorObj = computed({
  get: () => hexToColorObject(fgColor.value),
  set: (val: ColorObject | null) => {
    if (val) { fgColor.value = val.hexa }
  },
})

const svgString = computed(() => {
  const w = width.value
  const h = height.value
  const text = customText.value.length > 0 ? customText.value : `${w}x${h}`
  const size = useExactSize.value ? ` width="${w}" height="${h}"` : ''
  const bg = bgColor.value.slice(0, 7)
  const fg = fgColor.value.slice(0, 7)

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"${size}>
  <rect width="${w}" height="${h}" fill="${bg}"></rect>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="${fontSize.value}px" fill="${fg}">${text}</text>   
</svg>
  `.trim()
});

const base64 = computed(() => `data:image/svg+xml;base64,${textToBase64(svgString.value)}`)

const { download } = useDownloadFileFromBase64({ source: base64, filename: 'placeholder.svg' })
</script>

<template>
  <div class="space-y-6">
    <Card>
      <CardContent class="space-y-6">
        <div class="grid gap-6 lg:grid-cols-3">
          <!-- Left: Settings -->
          <div class="space-y-6 lg:col-span-2">
            <!-- Dimensions -->
            <FieldSet class="gap-4">
              <div class="flex items-center gap-2 mb-3 text-sm font-medium">
                <Settings2 class="h-4 w-4 text-muted-foreground" />
                {{ t('tools.svg-placeholder-generator.dimensions', 'Dimensions') }}
              </div>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field orientation="vertical" class="gap-2">
                  <FieldLabel class="text-sm">
                    {{ t('tools.svg-placeholder-generator.width') }}
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      v-model.number="width"
                      type="number"
                      min="1"
                      :placeholder="t('tools.svg-placeholder-generator.widthPlaceholder')"
                      class="font-mono"
                    />
                  </FieldContent>
                </Field>
                <Field orientation="vertical" class="gap-2">
                  <FieldLabel class="text-sm">
                    {{ t('tools.svg-placeholder-generator.height') }}
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      v-model.number="height"
                      type="number"
                      min="1"
                      :placeholder="t('tools.svg-placeholder-generator.heightPlaceholder')"
                      class="font-mono"
                    />
                  </FieldContent>
                </Field>
              </div>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field orientation="vertical" class="gap-2">
                  <FieldLabel class="text-sm">
                    {{ t('tools.svg-placeholder-generator.fontSize') }}
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      v-model.number="fontSize"
                      type="number"
                      min="1"
                      :placeholder="t('tools.svg-placeholder-generator.fontSizePlaceholder')"
                      class="font-mono"
                    />
                  </FieldContent>
                </Field>
                <Field orientation="vertical" class="gap-2">
                  <FieldLabel class="text-sm">
                    {{ t('tools.svg-placeholder-generator.customText') }}
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      v-model="customText"
                      :placeholder="t('tools.svg-placeholder-generator.customPlaceholder', { width, height })"
                      class="font-mono"
                    />
                  </FieldContent>
                </Field>
              </div>
              <Field>
                <FieldLabel for="exact-size">
                  {{ t('tools.svg-placeholder-generator.useExact') }}
                </FieldLabel>
                <FieldContent>
                  <Switch id="exact-size" v-model="useExactSize" />
                </FieldContent>
              </Field>
            </FieldSet>

            <Separator />

            <!-- Color Settings -->
            <FieldSet class="gap-2">
              <div class="flex items-center gap-2 mb-3 text-sm font-medium">
                <Palette class="h-4 w-4 text-muted-foreground" />
                {{ t('tools.svg-placeholder-generator.colorSettings', 'Color Settings') }}
              </div>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field orientation="vertical" class="gap-2">
                  <FieldLabel class="text-sm">
                    {{ t('tools.svg-placeholder-generator.background') }}
                  </FieldLabel>
                  <FieldContent>
                    <div class="flex items-center gap-2">
                      <Popover v-model:open="bgColorOpen">
                        <PopoverTrigger as-child>
                          <Button variant="outline" class="h-8 w-14 p-1.5 shrink-0">
                            <div class="h-full w-full rounded-sm" :style="{ backgroundColor: bgColor }" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent class="w-72 p-3" align="start">
                          <ColorPickerWithTabs v-model="bgColorObj" />
                        </PopoverContent>
                      </Popover>
                      <Input
                        v-model="bgColor"
                        type="text"
                        class="flex-1 font-mono text-sm uppercase"
                        maxlength="9"
                      />
                    </div>
                  </FieldContent>
                </Field>
                <Field orientation="vertical" class="gap-2">
                  <FieldLabel class="text-sm">
                    {{ t('tools.svg-placeholder-generator.textColor') }}
                  </FieldLabel>
                  <FieldContent>
                    <div class="flex items-center gap-2">
                      <Popover v-model:open="fgColorOpen">
                        <PopoverTrigger as-child>
                          <Button variant="outline" class="h-8 w-14 p-1.5 shrink-0">
                            <div class="h-full w-full rounded-sm" :style="{ backgroundColor: fgColor }" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent class="w-72 p-3" align="start">
                          <ColorPickerWithTabs v-model="fgColorObj" />
                        </PopoverContent>
                      </Popover>
                      <Input
                        v-model="fgColor"
                        type="text"
                        class="flex-1 font-mono text-sm uppercase"
                        maxlength="9"
                      />
                    </div>
                  </FieldContent>
                </Field>
              </div>
            </FieldSet>
          </div>

          <!-- Right: Preview -->
          <div class="flex flex-col items-center gap-4">
            <div class="text-sm font-medium text-muted-foreground">
              {{ t('tools.svg-placeholder-generator.preview', 'Preview') }}
            </div>
            <div class="flex h-54 w-54 items-center justify-center rounded-xl border-2 border-dashed bg-muted/20 transition-all hover:border-primary/50 overflow-hidden">
              <img
                :src="base64"
                :alt="t('tools.svg-placeholder-generator.imageAlt')"
                class="max-h-full max-w-full object-contain"
              >
            </div>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button variant="default" size="sm" class="w-full max-w-64" @click="download()">
                  <Download class="mr-1.5 h-3.5 w-3.5" />
                  {{ t('tools.svg-placeholder-generator.downloadSvg') }}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{{ t('tools.svg-placeholder-generator.downloadSvgTooltip', 'Download as SVG file') }}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <Separator />

        <!-- Output -->
        <div class="space-y-4">
          <Field orientation="vertical" class="gap-2">
            <FieldLabel class="text-sm font-medium">
              {{ t('tools.svg-placeholder-generator.svgHtml') }}
            </FieldLabel>
            <FieldContent>
              <TextareaCopyable :value="svgString" language="xml" class="min-h-20" />
            </FieldContent>
          </Field>
          <Field orientation="vertical" class="gap-2">
            <FieldLabel class="text-sm font-medium">
              {{ t('tools.svg-placeholder-generator.svgBase64') }}
            </FieldLabel>
            <FieldContent>
              <TextareaCopyable :value="base64" class="min-h-20" />
            </FieldContent>
          </Field>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
