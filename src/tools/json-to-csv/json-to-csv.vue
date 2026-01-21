<script setup lang="ts">
import JSONBig from 'json-bigint'

import { FileSpreadsheet } from 'lucide-vue-next'
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { useToolI18n } from '@/composable/useToolI18n';
import { useValidation } from '@/composable/validation';
import { withDefaultOnError } from '@/utils/defaults';
import { convertArrayToCsv } from './json-to-csv.service';

// Create a json-bigint instance that uses native BigInt
const JSONBigInt = JSONBig({ useNativeBigInt: true });

const inputElement = ref<HTMLElement>()

const { t } = useToolI18n()
const defaultValue = '[\n  { "name": "John", "age": 30, "city": "New York" },\n  { "name": "Jane", "age": 25, "city": "London" }\n]'
const rawJson = ref(defaultValue)
const csvOutput = computed(() => {
  if (!rawJson.value.trim()) { return '' }
  return withDefaultOnError(() => {
    const parsed = JSONBigInt.parse(rawJson.value)
    if (!Array.isArray(parsed)) {
      return ''
    }
    return convertArrayToCsv({ array: parsed })
  }, '')
});

const rawJsonValidation = useValidation({
  source: rawJson,
  rules: computed(() => [
    {
      validator: (v: string) => {
        if (v === '') { return true }
        try {
          const parsed = JSONBigInt.parse(v)
          return Array.isArray(parsed)
        }
        catch {
          return false
        }
      },
      message: t('tools.json-to-csv.invalid', 'Invalid JSON'),
    },
  ]),
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <FileSpreadsheet class="h-5 w-5 text-primary" />
            {{ t('tools.json-to-csv.cardInputTitle', 'JSON array input') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.json-to-csv.cardInputDescription',
                'Paste a valid JSON array below. Each object will become a row in the CSV output.',
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
                id="json-input"
                ref="inputElement"
                v-model="rawJson"
                :placeholder="t('tools.json-to-csv.inputPlaceholder', 'Paste your JSON array here...')"
                rows="16"
                class="max-h-96 resize-y overflow-y-auto font-mono"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
              />
              <Alert
                v-if="rawJsonValidation.status === 'error'"
                variant="destructive"
                class="border-destructive/40 bg-destructive/10"
              >
                <AlertTitle class="text-sm">
                  {{ t('tools.json-to-csv.invalidJsonTitle', 'Invalid JSON') || t('tools.json-to-csv.invalid', 'Invalid JSON') }}
                </AlertTitle>
                <AlertDescription class="text-xs">
                  {{ rawJsonValidation.message }}
                </AlertDescription>
              </Alert>
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card v-if="rawJsonValidation.status !== 'error'" class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <FileSpreadsheet class="h-5 w-5 text-primary" />
            {{ t('tools.json-to-csv.cardOutputTitle', 'CSV output') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.json-to-csv.cardOutputDescription',
                'Review and copy the generated CSV representation of your JSON array.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldContent>
              <TextareaCopyable :value="csvOutput" language="csv" class="min-h-20" />
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  </div>
</template>
