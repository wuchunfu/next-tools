<script setup lang="ts">
import { FileText, Radio, X } from 'lucide-vue-next'
import TextareaCopyable from '@/components/TextareaCopyable.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent, FieldGroup } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { useToolI18n } from '@/composable/useToolI18n'
import { textToNatoAlphabet } from './text-to-nato-alphabet.service'

const { t } = useToolI18n();
const inputElement = ref<HTMLElement>();
const input = ref('');
const natoText = computed(() => textToNatoAlphabet({ text: input.value }));

const inputLength = computed(() => input.value.length);
const outputLength = computed(() => natoText.value.length);
const characterCount = computed(() => {
  const letters = input.value.match(/[a-z]/gi)
  return letters ? letters.length : 0;
})

function clearInput() {
  input.value = '';
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card class="gap-2">
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Radio class="h-5 w-5 text-primary" />
            {{ t('tools.text-to-nato-alphabet.cardInputTitle', 'Text input') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.text-to-nato-alphabet.cardInputDescription',
                'Type or paste your text below. We will convert letters to the NATO phonetic alphabet.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldContent class="space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <Badge v-if="inputLength > 0" variant="outline" class="text-xs">
                  {{ t('tools.text-to-nato-alphabet.inputLength', 'Length') }}: {{ inputLength }}
                </Badge>
                <Badge v-if="characterCount > 0" variant="secondary" class="text-xs">
                  {{ t('tools.text-to-nato-alphabet.letters', 'Letters') }}: {{ characterCount }}
                </Badge>
              </div>
              <Textarea
                id="nato-input"
                ref="inputElement"
                v-model="input"
                :placeholder="t('tools.text-to-nato-alphabet.inputPlaceholder', 'Enter your text here...')"
                rows="6"
                class="max-h-96 resize-y overflow-y-auto break-all font-mono"
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

    <Card v-if="natoText" class="gap-2">
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <FileText class="h-5 w-5 text-primary" />
            {{ t('tools.text-to-nato-alphabet.cardOutputTitle', 'NATO output') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.text-to-nato-alphabet.cardOutputDescription',
                'Review and copy the converted NATO phonetic alphabet string.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldContent class="space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <Badge v-if="outputLength > 0" variant="outline" class="text-xs">
                  {{ t('tools.text-to-nato-alphabet.outputLength', 'Output length') }}: {{ outputLength }}
                </Badge>
              </div>
              <TextareaCopyable :value="natoText" class="font-mono text-sm break-all min-h-20" />
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  </div>
</template>
