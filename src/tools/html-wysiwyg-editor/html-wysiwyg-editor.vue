<script setup lang="ts">
import { asyncComputed, useStorage } from '@vueuse/core';
import { Code2, FileEdit, Trash2 } from 'lucide-vue-next';
import { format } from 'prettier';
import htmlParser from 'prettier/plugins/html';

import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToolI18n } from '@/composable/useToolI18n';
import Editor from './editor/editor.vue';

const { t } = useToolI18n()
const initialHtml = t('tools.html-wysiwyg-editor.initial')
const html = useStorage('html-wysiwyg-editor--html', initialHtml)
const editorShell = ref<HTMLElement | null>(null)

const formattedHtml = asyncComputed(() => format(html.value, { parser: 'html', plugins: [htmlParser] }), '')

const characters = computed(() => html.value.length)

function handleClear() {
  html.value = '';
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card class="flex flex-col">
      <CardHeader class="space-y-2">
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1">
            <CardTitle class="flex items-center gap-2">
              <FileEdit class="h-5 w-5 text-primary" />
              {{ t('tools.html-wysiwyg-editor.cardTitle', 'HTML WYSIWYG Editor') }}
            </CardTitle>
            <CardDescription>
              {{ t('tools.html-wysiwyg-editor.cardDescription', 'Write rich text and preview formatted HTML side by side.') }}
            </CardDescription>
          </div>
          <div class="flex items-center gap-2">
            <Badge variant="secondary">
              {{ t('tools.html-wysiwyg-editor.charactersLabel', 'Characters') }}: {{ characters }}
            </Badge>
            <Button variant="outline" size="sm" class="gap-2" :disabled="!html" @click="handleClear">
              <Trash2 class="h-4 w-4" />
              {{ t('common.clear', 'Clear') }}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent class="space-y-4">
        <div
          ref="editorShell"
          class="max-h-120 rounded-lg border shadow-sm overflow-auto"
        >
          <Editor v-model:html="html" />
        </div>
      </CardContent>
    </Card>

    <Card class="flex flex-col">
      <CardHeader class="space-y-2">
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1">
            <CardTitle class="flex items-center gap-2">
              <Code2 class="h-5 w-5 text-primary" />
              {{ t('tools.html-wysiwyg-editor.formattedTitle', 'Formatted HTML') }}
            </CardTitle>
            <CardDescription>
              {{ t('tools.html-wysiwyg-editor.formattedDescription', 'Prettier-formatted markup ready to copy.') }}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <TextareaCopyable
          :value="formattedHtml"
          language="html"
          class="min-h-20"
        />
      </CardContent>
    </Card>
  </div>
</template>
