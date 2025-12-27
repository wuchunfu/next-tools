<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

import { Card, CardContent } from '@/components/ui/card'
import { useToolI18n } from '@/composable/useToolI18n'
import { markdownBodyClasses } from '@/utils/markdown';

const { locale } = useToolI18n();

const localeToFile: Record<string, string> = {
  en: 'en',
  de: 'de',
  es: 'es',
  fr: 'fr',
  no: 'no',
  pt: 'pt',
  ru: 'ru',
  uk: 'uk',
  zh: 'zh',
  vi: 'vi',
};

const memoComponent = computed(() => {
  const lang = (locale.value?.split('-')[0] ?? 'en') as string;
  const target = (localeToFile[lang] ?? 'en') as string;
  return defineAsyncComponent(async () => {
    try {
      return (await import(`./memo/regex-memo.content.${target}.md`)).default;
    }
    catch (e) {
      console.warn('Fallback to English regex memo content', e);
      return (await import('./memo/regex-memo.content.en.md')).default;
    }
  });
})
</script>

<template>
  <div class="space-y-4">
    <Card class="py-0">
      <CardContent :class="markdownBodyClasses">
        <component :is="memoComponent" :key="locale" />
      </CardContent>
    </Card>
  </div>
</template>
