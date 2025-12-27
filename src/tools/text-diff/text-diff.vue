<script setup lang="ts">
import { FileText } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToolI18n } from '@/composable/useToolI18n'
import DiffEditor from './diff-editor.vue';

const { t } = useToolI18n();
</script>

<template>
  <Card>
    <CardHeader class="pb-4">
      <div class="space-y-1">
        <CardTitle class="flex items-center gap-2">
          <FileText class="h-5 w-5 text-primary" />
          {{ t('tools.text-diff.cardTitle') }}
        </CardTitle>
        <CardDescription>
          {{ t('tools.text-diff.cardDescription') }}
        </CardDescription>
      </div>
    </CardHeader>

    <CardContent class="p-0">
      <DiffEditor />
    </CardContent>
  </Card>
</template>
