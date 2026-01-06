<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { Monitor, Smartphone } from 'lucide-vue-next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToolI18n } from '@/composable/useToolI18n'

const { width, height } = useWindowSize();
const { t } = useToolI18n();

const sections = computed(() => [
  {
    name: t('tools.device-information.screen'),
    icon: Monitor,
    information: [
      {
        label: t('tools.device-information.screenSize'),
        value: computed(() => `${window.screen.availWidth} x ${window.screen.availHeight}`),
      },
      {
        label: t('tools.device-information.orientation'),
        value: computed(() => window.screen.orientation.type),
      },
      {
        label: t('tools.device-information.orientationAngle'),
        value: computed(() => `${window.screen.orientation.angle}°`),
      },
      {
        label: t('tools.device-information.colorDepth'),
        value: computed(() => `${window.screen.colorDepth} bits`),
      },
      {
        label: t('tools.device-information.pixelRatio'),
        value: computed(() => `${window.devicePixelRatio} dppx`),
      },
      {
        label: t('tools.device-information.windowSize'),
        value: computed(() => `${width.value} x ${height.value}`),
      },
    ],
  },
  {
    name: t('tools.device-information.device'),
    icon: Smartphone,
    information: [
      {
        label: t('tools.device-information.vendor'),
        value: computed(() => navigator.vendor),
      },
      {
        label: t('tools.device-information.languages'),
        value: computed(() => navigator.languages.join(', ')),
      },
      {
        label: t('tools.device-information.platform'),
        value: computed(() => navigator.platform),
      },
      {
        label: t('tools.device-information.userAgent'),
        value: computed(() => navigator.userAgent),
      },
    ],
  },
]);
</script>

<template>
  <div class="space-y-4">
    <Card v-for="{ name, icon: IconComponent, information } in sections" :key="name" class="shadow-sm">
      <CardHeader class="pb-3">
        <CardTitle class="flex items-center gap-2 text-lg">
          <component :is="IconComponent" class="h-5 w-5 text-primary" />
          {{ name }}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div
            v-for="{ label, value: { value } } in information"
            :key="label"
            class="rounded-md border bg-muted/30 px-4 py-3"
          >
            <div class="text-sm text-muted-foreground">
              {{ label }}
            </div>
            <div class="mt-1 text-base font-medium break-words">
              <span v-if="value">{{ value }}</span>
              <span v-else class="text-muted-foreground">unknown</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
