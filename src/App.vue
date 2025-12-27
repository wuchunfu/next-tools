<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { RouterView, useRoute } from 'vue-router'

import { Toaster } from '@/components/ui/sonner'
import { layouts } from './layouts'
import { useStyleStore } from './stores/style.store'

const route = useRoute()
const layout = computed(() => route?.meta?.layout ?? layouts.base)
const styleStore = useStyleStore()

const customPrimaryHsl = useStorage<string | null>('custom-primary-hsl', null)
const themeClass = computed(() => (styleStore.isDarkTheme ? 'dark' : ''))
const themeVars = computed(() => (customPrimaryHsl.value
  ? {
      '--primary': customPrimaryHsl.value,
      '--sidebar-primary': customPrimaryHsl.value,
      '--sidebar-ring': customPrimaryHsl.value,
      '--ring': customPrimaryHsl.value,
    }
  : {}))

const { locale } = useI18n()
const { language } = useNavigatorLanguage()

syncRef(
  useStorage('locale', language.value?.split?.('-')?.[0] ?? 'en'),
  locale,
  {
    transform: {
      ltr: (value: string) => value,
      rtl: (value: string) => value,
    },
  },
)
</script>

<template>
  <div class="min-h-screen bg-background text-foreground" :class="[themeClass]" :style="themeVars">
    <component :is="layout">
      <RouterView />
    </component>

    <Toaster />
  </div>
</template>
