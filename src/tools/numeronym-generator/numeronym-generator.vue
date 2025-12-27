<script setup lang="ts">
import { FileText } from 'lucide-vue-next'
import InputCopyable from '@/components/InputCopyable.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToolI18n } from '@/composable/useToolI18n'
import { generateNumeronym } from './numeronym-generator.service'

const word = ref('');
const { t } = useToolI18n();

const numeronym = computed(() => generateNumeronym(word.value));

function clearInput() {
  word.value = '';
}
</script>

<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <Card>
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <FileText class="h-5 w-5 text-primary" />
            {{ t('tools.numeronym-generator.cardInputTitle') }}
          </CardTitle>
          <CardDescription>
            {{ t('tools.numeronym-generator.cardInputDescription') }}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <div class="flex items-center gap-2">
          <Input v-model="word" class="flex-1" :placeholder="t('tools.numeronym-generator.placeholder')" />
          <Button variant="outline" @click="clearInput">
            {{ t('common.clear', 'Clear') }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <FileText class="h-5 w-5 text-primary" />
            {{ t('tools.numeronym-generator.cardResultsTitle') }}
          </CardTitle>
          <CardDescription>
            {{ t('tools.numeronym-generator.cardResultsDescription') }}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <InputCopyable :value="numeronym" :placeholder="t('tools.numeronym-generator.outputPlaceholder')" readonly />
      </CardContent>
    </Card>
  </div>
</template>
