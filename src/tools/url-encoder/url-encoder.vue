<script setup lang="ts">
import { Link, ArrowUpDown } from 'lucide-vue-next'
import InputCopyable from '@/components/InputCopyable.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent, FieldLabel, FieldSet } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useToolI18n } from '@/composable/useToolI18n'
import { useValidation } from '@/composable/validation'
import { isNotThrowing } from '@/utils/boolean'
import { withDefaultOnError } from '@/utils/defaults'

const { t } = useToolI18n();

const encodeInput = ref('');
const encodeOutput = computed(() => withDefaultOnError(() => encodeURIComponent(encodeInput.value), ''));

const encodedValidation = useValidation({
  source: encodeInput,
  rules: computed(() => [
    {
      validator: (value: string) => !value.trim() || isNotThrowing(() => encodeURIComponent(value)),
      message: t('tools.url-encoder.impossibleToParse', 'Impossible to parse'),
    },
  ]),
});


const decodeInput = ref('');
const decodeOutput = computed(() => withDefaultOnError(() => decodeURIComponent(decodeInput.value), ''));

const decodeValidation = useValidation({
  source: decodeInput,
  rules: computed(() => [
    {
      validator: (value: string) => !value.trim() || isNotThrowing(() => decodeURIComponent(value)),
      message: t('tools.url-encoder.impossibleToParse', 'Impossible to parse'),
    },
  ]),
});


function clearEncode() {
  encodeInput.value = '';
}

function clearDecode() {
  decodeInput.value = '';
}
</script>

<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <!-- Encode -->
    <Card class="flex flex-col">
      <CardHeader class="pb-3">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <ArrowUpDown class="h-5 w-5 text-primary" />
            {{ t('tools.url-encoder.cardEncodeTitle', 'URL Encode') }}
          </CardTitle>
          <CardDescription>
            {{ t('tools.url-encoder.cardEncodeDescription', 'Encode text to URL-encoded format (also known as "percent-encoded").') }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent class="flex flex-1 flex-col gap-6">
        <FieldSet>
          <Field orientation="vertical" class="gap-3">
            <FieldLabel class="text-sm font-medium">
              {{ t('tools.url-encoder.inputLabel', 'Your string') }}
            </FieldLabel>
            <FieldContent class="space-y-1">
              <Textarea
                v-model="encodeInput"
                :placeholder="t('tools.url-encoder.inputPlaceholder', 'Enter the string to encode...')"
                rows="6"
                class="w-full min-w-0 max-h-96 resize-y overflow-y-auto"
                :class="{ 'border-destructive': encodedValidation.status === 'error' }"
              />
              <p v-if="encodedValidation.status === 'error'" class="text-xs text-destructive">
                {{ encodedValidation.message }}
              </p>
            </FieldContent>
            <div class="flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" @click="clearEncode">
                <X class="mr-2 h-4 w-4" />
                {{ t('common.clear', 'Clear') }}
              </Button>
            </div>
          </Field>
        </FieldSet>

        <Separator />

        <Field orientation="vertical">
          <FieldLabel>{{ t('tools.url-encoder.outputLabel', 'Encoded string') }}</FieldLabel>
          <FieldContent>
            <InputCopyable
              :value="encodeOutput"
              :placeholder="t('tools.url-encoder.outputPlaceholder', 'Encoded string will appear here...')"
              :field-props="{ orientation: 'vertical' }"
              readonly
            />
          </FieldContent>
        </Field>
      </CardContent>
    </Card>

    <!-- Decode -->
    <Card class="flex flex-col">
      <CardHeader class="pb-3">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Link class="h-5 w-5 text-primary" />
            {{ t('tools.url-encoder.cardDecodeTitle', 'URL Decode') }}
          </CardTitle>
          <CardDescription>
            {{ t('tools.url-encoder.cardDecodeDescription', 'Decode URL-encoded strings back to their original text.') }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent class="flex flex-1 flex-col gap-6">
        <FieldSet>
          <Field orientation="vertical" class="gap-3">
            <FieldLabel class="text-sm font-medium">
              {{ t('tools.url-encoder.decodeInputLabel', 'Your encoded string') }}
            </FieldLabel>
            <FieldContent class="space-y-1">
              <Textarea
                v-model="decodeInput"
                :placeholder="t('tools.url-encoder.decodeInputPlaceholder', 'Enter the URL-encoded string to decode...')"
                rows="6"
                class="w-full min-w-0 max-h-96 resize-y overflow-y-auto font-mono"
                :class="{ 'border-destructive': decodeValidation.status === 'error' }"
              />
              <p v-if="decodeValidation.status === 'error'" class="text-xs text-destructive">
                {{ decodeValidation.message }}
              </p>
            </FieldContent>
            <div class="flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" @click="clearDecode">
                <X class="mr-2 h-4 w-4" />
                {{ t('common.clear', 'Clear') }}
              </Button>
            </div>
          </Field>
        </FieldSet>

        <Separator />

        <Field orientation="vertical">
          <FieldLabel>{{ t('tools.url-encoder.decodeOutputLabel', 'Decoded string') }}</FieldLabel>
          <FieldContent>
            <InputCopyable
              :value="decodeOutput"
              :placeholder="t('tools.url-encoder.decodeOutputPlaceholder', 'Decoded string will appear here...')"
              :field-props="{ orientation: 'vertical' }"
              readonly
            />
          </FieldContent>
        </Field>
      </CardContent>
    </Card>
  </div>
</template>
