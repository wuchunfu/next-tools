<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { FileText, RefreshCw } from 'lucide-vue-next'
import TextareaCopyable from '@/components/TextareaCopyable.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { computedRefreshable } from '@/composable/computedRefreshable'
import { useToolI18n } from '@/composable/useToolI18n'
import { randIntFromInterval } from '@/utils/random'
import { generateLoremIpsum } from './lorem-ipsum-generator.service'

const paragraphs = useStorage('lorem-ipsum:paragraphs', 1);
const sentences = useStorage<number[]>('lorem-ipsum:sentences', [3, 8]);
const words = useStorage<number[]>('lorem-ipsum:words', [8, 15]);
const startWithLoremIpsum = useStorage('lorem-ipsum:start-with-lorem', true);
const asHTML = useStorage('lorem-ipsum:as-html', false);

const { t } = useToolI18n();
const paragraphsArray = computed({
  get: () => [paragraphs.value],
  set: (val: number[]) => {
    if (Array.isArray(val) && typeof val[0] === 'number') {
      paragraphs.value = val[0];
    }
  },
});
const [loremIpsumText, refreshLoremIpsum] = computedRefreshable(() =>
  generateLoremIpsum({
    paragraphCount: paragraphs.value,
    asHTML: asHTML.value,
    sentencePerParagraph: randIntFromInterval(sentences.value[0] ?? 3, sentences.value[1] ?? 8),
    wordCount: randIntFromInterval(words.value[0] ?? 8, words.value[1] ?? 15),
    startWithLoremIpsum: startWithLoremIpsum.value,
  }),
);

</script>

<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <!-- Options Card -->
    <Card>
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <FileText class="h-5 w-5 text-primary" />
            {{ t('tools.lorem-ipsum-generator.optionsTitle') }}
          </CardTitle>
          <CardDescription>{{ t('tools.lorem-ipsum-generator.optionsDescription') }}</CardDescription>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <FieldGroup>
          <Field orientation="vertical">
            <FieldLabel class="w-44 text-right sm:text-right">
              {{ t('tools.lorem-ipsum-generator.paragraphs') }}
            </FieldLabel>
            <FieldContent class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">{{ t('tools.lorem-ipsum-generator.paragraphs') }}</span>
                <span class="text-lg font-semibold">{{ paragraphs }}</span>
              </div>
              <Slider v-model="paragraphsArray" :step="1" :min="1" :max="20" class="w-full" />
            </FieldContent>
          </Field>

          <Field orientation="vertical">
            <FieldLabel class="w-44 text-right sm:text-right">
              {{ t('tools.lorem-ipsum-generator.sentencesPerParagraph') }}
            </FieldLabel>
            <FieldContent class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">{{ t('tools.lorem-ipsum-generator.sentencesPerParagraph') }}</span>
                <span class="text-lg font-semibold">{{ sentences[0] }} - {{ sentences[1] }}</span>
              </div>
              <Slider v-model="sentences" range :step="1" :min="1" :max="50" class="w-full" />
            </FieldContent>
          </Field>

          <Field orientation="vertical">
            <FieldLabel class="w-44 text-right sm:text-right">
              {{ t('tools.lorem-ipsum-generator.wordsPerSentence') }}
            </FieldLabel>
            <FieldContent class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">{{ t('tools.lorem-ipsum-generator.wordsPerSentence') }}</span>
                <span class="text-lg font-semibold">{{ words[0] }} - {{ words[1] }}</span>
              </div>
              <Slider v-model="words" range :step="1" :min="1" :max="50" class="w-full" />
            </FieldContent>
          </Field>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div class="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50 w-full">
              <div class="flex flex-col gap-1">
                <span class="text-sm font-medium">{{ t('tools.lorem-ipsum-generator.startWithLoremIpsum') }}</span>
                <span class="text-xs text-muted-foreground" />
              </div>
              <Switch v-model="startWithLoremIpsum" />
            </div>

            <div class="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50 w-full">
              <div class="flex flex-col gap-1">
                <span class="text-sm font-medium">{{ t('tools.lorem-ipsum-generator.asHtml') }}</span>
                <span class="text-xs text-muted-foreground" />
              </div>
              <Switch v-model="asHTML" />
            </div>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>

    <!-- Results Card -->
    <Card>
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <FileText class="h-5 w-5 text-primary" />
            {{ t('tools.lorem-ipsum-generator.resultsTitle') }}
          </CardTitle>
          <CardDescription>{{ t('tools.lorem-ipsum-generator.resultsDescription') }}</CardDescription>
        </div>
      </CardHeader>
      <CardContent class="flex-1 flex flex-col gap-4">
        <TextareaCopyable :value="loremIpsumText" :language="asHTML ? 'html' : ''" class="h-95" />

        <div class="flex justify-end gap-3">
          <Button variant="outline" class="gap-2" @click="refreshLoremIpsum">
            <RefreshCw class="mr-2 h-4 w-4" />
            {{ t('tools.lorem-ipsum-generator.refresh') }}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
