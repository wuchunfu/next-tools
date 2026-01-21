<script setup lang="ts">
import { computedAsync } from '@vueuse/core';
import { Eye, FileCode, Printer, X } from 'lucide-vue-next';
import markdownit from 'markdown-it';
import { format } from 'prettier';
import htmlParser from 'prettier/plugins/html';
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToolI18n } from '@/composable/useToolI18n';
import { withDefaultOnError } from '@/utils/defaults';
import { markdownBodyClasses } from '@/utils/markdown';

const inputElement = ref<HTMLElement>()

const { t } = useToolI18n()

const inputMarkdown = ref('')
const formatHtml = ref(true)

const outputHtml = computed(() => {
  if (!inputMarkdown.value.trim()) { return '' }
  const md = markdownit()
  return md.render(inputMarkdown.value)
});

const formattedHtmlOutput = computedAsync(async () => {
  if (!outputHtml.value) { return '' }
  if (!formatHtml.value) { return outputHtml.value }
  return withDefaultOnError(
    async () => await format(outputHtml.value, { parser: 'html', plugins: [htmlParser] }),
    outputHtml.value,
  )
}, '')

function clearInput() {
  inputMarkdown.value = ''
}

function getPrintStyles() {
  return `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 600;
      line-height: 1.25;
    }
    h1 {
      font-size: 2em;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 0.3em;
    }
    h2 {
      font-size: 1.5em;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 0.3em;
    }
    h3 {
      font-size: 1.25em;
    }
    h4 {
      font-size: 1em;
    }
    h5 {
      font-size: 0.875em;
    }
    h6 {
      font-size: 0.85em;
      color: #6b7280;
    }
    p {
      margin-bottom: 1em;
      line-height: 1.6;
    }
    code {
      background-color: #f3f4f6;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
      font-size: 0.9em;
    }
    pre {
      background-color: #f3f4f6;
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
      margin-bottom: 1em;
    }
    pre code {
      background-color: transparent;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #e5e7eb;
      padding-left: 16px;
      margin-left: 0;
      color: #6b7280;
      font-style: italic;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background-color: #f3f4f6;
      font-weight: 600;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
    }
    a {
      color: #0066cc;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    ul, ol {
      margin-bottom: 1em;
      padding-left: 2em;
    }
    li {
      margin-bottom: 0.5em;
    }
    hr {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 2em 0;
    }
  `
}

function printHtml() {
  const w = window.open()
  if (w === null) {
    return
  }
  w.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${t('tools.markdown-to-html.printTitle', 'Markdown to HTML')}</title>
        <style>
          ${getPrintStyles()}
        </style>
      </head>
      <body>
        ${outputHtml.value}
      </body>
    </html>
  `)
  w.document.close()
  setTimeout(() => {
    w.print()
  }, 250)
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <FileCode class="h-5 w-5 text-primary" />
            {{ t('tools.markdown-to-html.cardInputTitle', 'Markdown input') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.markdown-to-html.cardInputDescription',
                'Paste or write your Markdown below. We will convert it to HTML and provide a live preview.',
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
                id="markdown-input"
                ref="inputElement"
                v-model="inputMarkdown"
                :placeholder="t('tools.markdown-to-html.inputPlaceholder', 'Your Markdown content...')"
                rows="16"
                class="max-h-96 resize-y overflow-y-auto font-mono"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
              />
              <div class="flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" @click="clearInput">
                  <X class="mr-2 h-4 w-4" />
                  {{ t('common.clear', 'Clear') }}
                </Button>
              </div>
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card class="gap-2">
      <CardHeader class="pb-4">
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-1">
            <CardTitle class="flex items-center gap-2">
              <Eye class="h-5 w-5 text-primary" />
              {{ t('tools.markdown-to-html.cardOutputTitle', 'HTML output') }}
            </CardTitle>
            <CardDescription>
              {{
                t(
                  'tools.markdown-to-html.cardOutputDescription',
                  'Switch between a rendered preview and the generated HTML source code.',
                )
              }}
            </CardDescription>
          </div>
          <div class="shrink-0">
            <Tooltip>
              <TooltipTrigger as-child>
                <Button size="sm" variant="outline" @click="printHtml">
                  <Printer class="mr-2 h-4 w-4" />
                  {{ t('tools.markdown-to-html.printAsPdf', 'Print as PDF') }}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {{ t('tools.markdown-to-html.printTooltip', 'Print HTML as PDF') }}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldContent>
              <Tabs default-value="preview" class="w-full">
                <TabsList class="grid w-full grid-cols-2">
                  <TabsTrigger value="preview" class="flex items-center gap-2">
                    <Eye class="h-4 w-4" />
                    {{ t('tools.markdown-to-html.preview', 'Preview') }}
                  </TabsTrigger>
                  <TabsTrigger value="html" class="flex items-center gap-2">
                    <FileCode class="h-4 w-4" />
                    {{ t('tools.markdown-to-html.htmlCode', 'HTML Code') }}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="preview" class="mt-4">
                  <div class="relative min-w-0 w-full border rounded-md overflow-auto p-4 min-h-100 max-h-150">
                    <div v-if="outputHtml" :class="markdownBodyClasses" v-html="outputHtml" />
                    <div v-else class="flex items-center justify-center h-100 text-muted-foreground">
                      {{ t('tools.markdown-to-html.previewPlaceholder', 'Preview will appear here...') }}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="html" class="mt-4">
                  <div class="space-y-3">
                    <div class="flex items-center justify-end">
                      <div class="flex items-center gap-2">
                        <label for="format-html" class="text-sm font-medium cursor-pointer">
                          {{ t('tools.markdown-to-html.formatHtml', 'Format HTML') }}
                        </label>
                        <Switch id="format-html" v-model="formatHtml" />
                      </div>
                    </div>
                    <TextareaCopyable
                      :value="formattedHtmlOutput"
                      language="html"
                      class="min-h-20"
                      copy-placement="top-right"
                      :copy-message="t('common.copyToClipboard', 'Copy to clipboard')"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  </div>
</template>

