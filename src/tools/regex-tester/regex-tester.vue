<script setup lang="ts">
import type { ShadowRootExpose } from 'vue-shadow-dom';
import { ShadowRoot } from 'vue-shadow-dom';
import { render } from '@regexper/render';
import { useStorage } from '@vueuse/core';
import { Code2, FileText, Network, Sparkles, X } from 'lucide-vue-next';
import RandExp from 'randexp';
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToolI18n } from '@/composable/useToolI18n';
import { useValidation } from '@/composable/validation';
import { cn } from '@/lib/utils';
import { tableCellClasses, tableContainerClasses, tableHeadClasses, tableHeaderClasses } from '@/utils/table';
import { matchRegex } from './regex-tester.service';

const regex = useStorage('regex-tester:regex', '')
const text = ref('')
const global = useStorage('regex-tester:global', true)
const ignoreCase = useStorage('regex-tester:ignoreCase', false)
const multiline = useStorage('regex-tester:multiline', false)
const dotAll = useStorage('regex-tester:dotAll', true)
const unicode = useStorage('regex-tester:unicode', true)
const unicodeSets = useStorage('regex-tester:unicodeSets', false)
const visualizerSVG = ref<ShadowRootExpose>()
const inputElement = ref<HTMLElement>()
const { t } = useToolI18n()

const regexValidation = useValidation({
  source: regex,
  rules: computed(() => [
    {
      message: t('tools.regex-tester.invalidRegex', 'Invalid regex'),
      validator: (value: string) => !value || new RegExp(value),
      getErrorMessage: () => '',
    },
  ]),
})

const results = computed(() => {
  let flags = 'd'
  if (global.value) {
    flags += 'g'
  }
  if (ignoreCase.value) {
    flags += 'i'
  }
  if (multiline.value) {
    flags += 'm'
  }
  if (dotAll.value) {
    flags += 's'
  }
  if (unicode.value) {
    flags += 'u'
  }
  else if (unicodeSets.value) {
    flags += 'v'
  }

  try {
    return matchRegex(regex.value, text.value, flags)
  }
  catch {
    return []
  }
})

const sample = computed(() => {
  if (!regex.value) { return '' }
  try {
    const randexp = new RandExp(new RegExp(regex.value.replace(/\(\?<[^>]*>/g, '(?:')))
    return randexp.gen()
  }
  catch {
    return ''
  }
})

function clearInput() {
  text.value = ''
}

watchEffect(
  async () => {
    const regexValue = regex.value
    // shadow root is required:
    // @regexper/render append a <defs><style> that broke svg transparency of icons in the whole site
    const visualizer = visualizerSVG.value?.shadow_root
    if (visualizer) {
      while (visualizer.lastChild) {
        visualizer.removeChild(visualizer.lastChild)
      }
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      try {
        await render(regexValue, svg)
      }
      catch {
      }
      visualizer.appendChild(svg)
    }
  },
)
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Code2 class="h-5 w-5 text-primary" />
            {{ t('tools.regex-tester.cardRegexTitle', 'Regular expression') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.regex-tester.cardRegexDescription',
                'Enter your regular expression pattern and configure matching flags.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldContent class="space-y-2">
              <Textarea
                id="regex-input"
                v-model="regex"
                :placeholder="t('tools.regex-tester.regexPlaceholder', 'Put the regex to test')"
                rows="3"
                class="max-h-48 resize-y overflow-y-auto font-mono"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
              />
              <div class="flex items-center gap-2">
                <Button variant="ghost" size="sm" as-child>
                  <router-link target="_blank" to="/regex-memo" class="text-xs">
                    {{ t('tools.regex-tester.cheatsheet', 'See Regular Expression Cheatsheet') }}
                  </router-link>
                </Button>
              </div>
              <Alert
                v-if="regexValidation.status === 'error'"
                variant="destructive"
                class="border-destructive/40 bg-destructive/10"
              >
                <AlertTitle class="text-sm">
                  {{ t('tools.regex-tester.invalidRegexTitle', 'Invalid regex') }}
                </AlertTitle>
                <AlertDescription class="text-xs">
                  {{ regexValidation.message }}
                </AlertDescription>
              </Alert>
            </FieldContent>
          </Field>
        </FieldGroup>

        <div class="mt-6 space-y-4">
          <div class="space-y-2">
            <p class="text-sm font-medium">
              {{ t('tools.regex-tester.cardFlagsTitle', 'Matching flags') }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{
                t(
                  'tools.regex-tester.cardFlagsDescription',
                  'Configure how the regular expression should match text.',
                )
              }}
            </p>
          </div>
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div class="flex items-center justify-between rounded-lg border p-3">
              <div class="space-y-0.5">
                <p class="text-sm font-medium">
                  {{ t('tools.regex-tester.global', 'Global search.') }} (<code class="text-xs">g</code>)
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ t('tools.regex-tester.globalTitle', 'Global search') }}
                </p>
              </div>
              <Switch v-model="global" />
            </div>

            <div class="flex items-center justify-between rounded-lg border p-3">
              <div class="space-y-0.5">
                <p class="text-sm font-medium">
                  {{ t('tools.regex-tester.ignoreCase', 'Case-insensitive search.') }} (<code class="text-xs">i</code>)
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ t('tools.regex-tester.ignoreTitle', 'Case-insensitive search') }}
                </p>
              </div>
              <Switch v-model="ignoreCase" />
            </div>

            <div class="flex items-center justify-between rounded-lg border p-3">
              <div class="space-y-0.5">
                <p class="text-sm font-medium">
                  {{ t('tools.regex-tester.multiline', 'Multiline') }} (<code class="text-xs">m</code>)
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ t('tools.regex-tester.multilineTitle', 'Allows ^ and $ to match next to newline characters.') }}
                </p>
              </div>
              <Switch v-model="multiline" />
            </div>

            <div class="flex items-center justify-between rounded-lg border p-3">
              <div class="space-y-0.5">
                <p class="text-sm font-medium">
                  {{ t('tools.regex-tester.dotAll', 'Singleline') }} (<code class="text-xs">s</code>)
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ t('tools.regex-tester.dotAllTitle', 'Allows . to match newline characters.') }}
                </p>
              </div>
              <Switch v-model="dotAll" />
            </div>

            <div class="flex items-center justify-between rounded-lg border p-3">
              <div class="space-y-0.5">
                <p class="text-sm font-medium">
                  {{ t('tools.regex-tester.unicode', 'Unicode') }} (<code class="text-xs">u</code>)
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ t('tools.regex-tester.unicodeTitle', 'Unicode; treat a pattern as a sequence of Unicode code points.') }}
                </p>
              </div>
              <Switch v-model="unicode" />
            </div>

            <div class="flex items-center justify-between rounded-lg border p-3">
              <div class="space-y-0.5">
                <p class="text-sm font-medium">
                  {{ t('tools.regex-tester.unicodeSets', 'Unicode Sets') }} (<code class="text-xs">v</code>)
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ t('tools.regex-tester.unicodeSetsTitle', 'An upgrade to the u mode with more Unicode features.') }}
                </p>
              </div>
              <Switch v-model="unicodeSets" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <FileText class="h-5 w-5 text-primary" />
            {{ t('tools.regex-tester.cardTextTitle', 'Text matching') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.regex-tester.cardTextDescription',
                'Enter the text to match and view the results below.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldContent class="space-y-2">
              <Textarea
                id="text-input"
                ref="inputElement"
                v-model="text"
                :placeholder="t('tools.regex-tester.textPlaceholder', 'Put the text to match')"
                rows="8"
                class="max-h-96 resize-y overflow-y-auto font-mono break-all"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
              />
              <div class="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" :disabled="text.length === 0" @click="clearInput">
                  <X class="mr-2 h-4 w-4" />
                  {{ t('common.clear', 'Clear') }}
                </Button>
              </div>
            </FieldContent>
          </Field>
        </FieldGroup>

        <div v-if="regex && text" class="mt-6 space-y-4">
          <div class="space-y-2">
            <p class="text-sm font-medium">
              {{ t('tools.regex-tester.cardMatchesTitle', 'Match results') }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{
                t(
                  'tools.regex-tester.cardMatchesDescription',
                  'View all matches found in the test text with their captures and groups.',
                )
              }}
            </p>
          </div>
          <template v-if="results?.length > 0">
            <Table :container-class="cn(tableContainerClasses, 'max-h-96')">
              <TableHeader :class="cn(tableHeaderClasses)">
                <TableRow>
                  <TableHead :class="tableHeadClasses">
                    {{ t('tools.regex-tester.index', 'Index in text') }}
                  </TableHead>
                  <TableHead :class="tableHeadClasses">
                    {{ t('tools.regex-tester.value', 'Value') }}
                  </TableHead>
                  <TableHead :class="tableHeadClasses">
                    {{ t('tools.regex-tester.captures', 'Captures') }}
                  </TableHead>
                  <TableHead :class="tableHeadClasses">
                    {{ t('tools.regex-tester.groups', 'Groups') }}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="match of results" :key="match.index">
                  <TableCell :class="cn(tableCellClasses, 'font-mono')">
                    {{ match.index }}
                  </TableCell>
                  <TableCell :class="cn(tableCellClasses, 'font-mono break-all')">
                    {{ match.value }}
                  </TableCell>
                  <TableCell :class="tableCellClasses">
                    <ul class="list-disc list-inside space-y-1 text-xs">
                      <li v-for="capture in match.captures" :key="capture.name" class="font-mono">
                        "{{ capture.name }}" = {{ capture.value }} [{{ capture.start }} - {{ capture.end }}]
                      </li>
                      <li v-if="match.captures.length === 0" class="text-muted-foreground">
                        —
                      </li>
                    </ul>
                  </TableCell>
                  <TableCell :class="tableCellClasses">
                    <ul class="list-disc list-inside space-y-1 text-xs">
                      <li v-for="group in match.groups" :key="group.name" class="font-mono">
                        "{{ group.name }}" = {{ group.value }} [{{ group.start }} - {{ group.end }}]
                      </li>
                      <li v-if="match.groups.length === 0" class="text-muted-foreground">
                        —
                      </li>
                    </ul>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </template>
          <Alert v-else variant="destructive" class="border-destructive/40 bg-destructive/10">
            <AlertTitle class="text-sm">
              {{ t('tools.regex-tester.noMatch', 'No match') }}
            </AlertTitle>
            <AlertDescription class="text-xs">
              {{ t('tools.regex-tester.noMatchDescription', 'The regular expression did not find any matches in the test text.') }}
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>

    <Card v-if="regex && sample" class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Sparkles class="h-5 w-5 text-primary" />
            {{ t('tools.regex-tester.cardSampleTitle', 'Sample matching text') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.regex-tester.cardSampleDescription',
                'A randomly generated text that matches your regular expression pattern.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldContent>
              <TextareaCopyable
                :value="sample"
                class="font-mono break-all min-h-20"
              />
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card v-if="regex" class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Network class="h-5 w-5 text-primary" />
            {{ t('tools.regex-tester.cardDiagramTitle', 'Regex diagram') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.regex-tester.cardDiagramDescription',
                'Visual representation of your regular expression pattern.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto rounded-lg border p-4">
          <ShadowRoot ref="visualizerSVG" />
        </div>
      </CardContent>
    </Card>
  </div>
</template>
