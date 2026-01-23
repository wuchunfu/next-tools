<script setup lang="ts">
import JSONBig from 'json-bigint';

import { Minus } from 'lucide-vue-next';
import TextareaCopyable from '@/components/TextareaCopyable.vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent, FieldGroup } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { useToolI18n } from '@/composable/useToolI18n'
import { useValidation } from '@/composable/validation'
import { withDefaultOnError } from '@/utils/defaults'

// Create a json-bigint instance that uses native BigInt
const JSONBigInt = JSONBig({ useNativeBigInt: true });

const inputElement = ref<HTMLElement>();

const { t } = useToolI18n();
const defaultValue = '{\n\t"hello": [\n\t\t"world"\n\t]\n}';
const rawJson = ref(defaultValue);
const minifiedJson = computed(() => withDefaultOnError(() => JSONBigInt.stringify(JSONBigInt.parse(rawJson.value), null, 0), ''));

const rawJsonValidation = useValidation({
  source: rawJson,
  rules: computed(() => [
    {
      validator: (v: string) => v === '' || JSONBigInt.parse(v),
      message: t('tools.json-minify.invalid', 'Invalid JSON'),
    },
  ]),
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card class="gap-2">
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Minus class="h-5 w-5 text-primary" />
            {{ t('tools.json-minify.cardInputTitle', 'Original JSON') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.json-minify.cardInputDescription',
                'Paste the JSON you want to compress. We will validate it and then generate a compact version.',
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
                :placeholder="t('tools.json-minify.inputPlaceholder', 'Paste your raw JSON here...')"
                rows="16"
                class="max-h-96 resize-y overflow-y-auto font-mono"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
                data-testid="json-input"
              />
              <Alert
                v-if="rawJsonValidation.status === 'error'"
                variant="destructive"
                class="border-destructive/40 bg-destructive/10"
                data-testid="error-message"
              >
                <AlertTitle class="text-sm">
                  {{ t('tools.json-minify.invalidJsonTitle', 'Invalid JSON') || t('tools.json-minify.invalid', 'Invalid JSON') }}
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
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Minus class="h-5 w-5 text-primary" />
            {{ t('tools.json-minify.cardOutputTitle', 'Compressed JSON') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.json-minify.cardOutputDescription',
                'This is the minified version of your JSON, without unnecessary whitespace.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldContent>
              <TextareaCopyable :value="minifiedJson" language="json" class="min-h-20" data-testid="json-output" />
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  </div>
</template>
