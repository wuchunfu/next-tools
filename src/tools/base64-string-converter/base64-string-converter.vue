<script setup lang="ts">
import InputCopyable from '@/components/InputCopyable.vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-vue-next'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useToolI18n } from '@/composable/useToolI18n'
import { base64ToText, isValidBase64, textToBase64 } from '@/utils/base64'
import { withDefaultOnError } from '@/utils/defaults'

const encodeUrlSafe = useStorage('base64-string-converter--encode-url-safe', false);
const decodeUrlSafe = useStorage('base64-string-converter--decode-url-safe', false);

const { t } = useToolI18n();
const textInput = ref('');
const base64Output = computed(() => textToBase64(textInput.value, { makeUrlSafe: encodeUrlSafe.value }));

const base64Input = ref('');
const textOutput = computed(() =>
  withDefaultOnError(() => base64ToText(base64Input.value.trim(), { makeUrlSafe: decodeUrlSafe.value }), ''),
);
const base64Error = computed(() =>
  base64Input.value.trim() && !isValidBase64(base64Input.value.trim(), { makeUrlSafe: decodeUrlSafe.value })
    ? t('tools.base64-string-converter.invalidBase64')
    : '',
);

const textInputLength = computed(() => textInput.value.length);
const base64InputLength = computed(() => base64Input.value.trim().length);
const base64OutputLength = computed(() => base64Output.value.length);
const textOutputLength = computed(() => textOutput.value.length);

function clearEncode() {
  textInput.value = '';
}

function clearDecode() {
  base64Input.value = '';
}
</script>

<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <Card class="h-full gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <FileText class="h-5 w-5 text-primary" />
            {{ t('tools.base64-string-converter.cardEncodeTitle', 'String to Base64') }}
          </CardTitle>
          <CardDescription>
            {{ t('tools.base64-string-converter.cardEncodeDescription', 'Encode any text string into Base64 format.') }}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent class="space-y-5">
        <FieldSet>
          <Field orientation="vertical" class="gap-3">
            <div class="flex items-center justify-between">
              <FieldLabel class="text-sm font-medium">
                {{ t('tools.base64-string-converter.stringToEncode') }}
              </FieldLabel>
              <Badge v-if="textInputLength > 0" variant="outline" class="text-xs">
                {{ t('tools.base64-string-converter.inputLength', 'Length') }}: {{ textInputLength }}
              </Badge>
            </div>
            <FieldContent>
              <Textarea
                v-model="textInput"
                :placeholder="t('tools.base64-string-converter.putYourStringHere')"
                rows="6"
                class="max-h-96 resize-y overflow-y-auto break-all font-mono"
              />
            </FieldContent>
            <div class="flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" @click="clearEncode">
                {{ t('common.clear', 'Clear') }}
              </Button>
            </div>
          </Field>

          <Separator />

          <Field orientation="vertical" class="gap-3">
            <div class="flex items-center justify-between">
              <FieldLabel class="text-sm font-medium">
                {{ t('tools.base64-string-converter.encodeUrlSafe') }}
              </FieldLabel>
              <Switch v-model="encodeUrlSafe" />
            </div>
            <FieldDescription>
              {{ t('tools.base64-string-converter.encodeUrlSafeDescription', 'Use URL-safe Base64 encoding (replaces + with - and / with _)') }}
            </FieldDescription>
          </Field>
        </FieldSet>

        <Separator />

        <FieldGroup>
          <InputCopyable
            :label="t('tools.base64-string-converter.base64OfString')"
            :value="base64Output"
            :placeholder="t('tools.base64-string-converter.base64EncodingPlaceholder')"
            :field-props="{ orientation: 'vertical' }"
            readonly
          />
          <div v-if="base64OutputLength > 0" class="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" class="text-xs">
              {{ t('tools.base64-string-converter.outputLength', 'Output length') }}: {{ base64OutputLength }}
            </Badge>
            <Badge v-if="encodeUrlSafe" variant="outline" class="text-xs">
              {{ t('tools.base64-string-converter.urlSafe', 'URL Safe') }}
            </Badge>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card class="h-full gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <FileText class="h-5 w-5 text-primary" />
            {{ t('tools.base64-string-converter.cardDecodeTitle', 'Base64 to String') }}
          </CardTitle>
          <CardDescription>
            {{ t('tools.base64-string-converter.cardDecodeDescription', 'Decode Base64 strings back to their original text.') }}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent class="space-y-5">
        <FieldSet>
          <Field orientation="vertical" class="gap-3">
            <div class="flex items-center justify-between">
              <FieldLabel class="text-sm font-medium">
                {{ t('tools.base64-string-converter.base64StringToDecode') }}
              </FieldLabel>
              <Badge v-if="base64InputLength > 0" variant="outline" class="text-xs">
                {{ t('tools.base64-string-converter.inputLength', 'Length') }}: {{ base64InputLength }}
              </Badge>
            </div>
            <Textarea
              v-model="base64Input"
              :placeholder="t('tools.base64-string-converter.yourBase64String')"
              rows="6"
              class="max-h-96 resize-y overflow-y-auto break-all font-mono"
              :class="{ 'border-destructive ring-1 ring-destructive/60': base64Error }"
            />
            <p v-if="base64Error" class="text-xs text-destructive">
              {{ base64Error }}
            </p>
            <div class="flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" @click="clearDecode">
                {{ t('common.clear', 'Clear') }}
              </Button>
            </div>
          </Field>

          <Separator />

          <Field orientation="vertical" class="gap-3">
            <div class="flex items-center justify-between">
              <FieldLabel class="text-sm font-medium">
                {{ t('tools.base64-string-converter.decodeUrlSafe') }}
              </FieldLabel>
              <Switch v-model="decodeUrlSafe" />
            </div>
            <FieldDescription>
              {{ t('tools.base64-string-converter.decodeUrlSafeDescription', 'Decode URL-safe Base64 strings (handles - and _ characters)') }}
            </FieldDescription>
          </Field>
        </FieldSet>

        <Alert v-if="base64Error" variant="destructive">
          <AlertTitle>{{ t('tools.base64-string-converter.invalidBase64') }}</AlertTitle>
          <AlertDescription class="text-sm">
            {{ t('tools.base64-string-converter.invalidBase64Description', 'The input is not a valid Base64 string. Please check your input.') }}
          </AlertDescription>
        </Alert>

        <Separator v-if="base64Error" />

        <FieldGroup>
          <InputCopyable
            :label="t('tools.base64-string-converter.decodedString')"
            :value="textOutput"
            :placeholder="t('tools.base64-string-converter.decodedStringPlaceholder')"
            :field-props="{ orientation: 'vertical' }"
            readonly
          />
          <div v-if="textOutputLength > 0" class="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" class="text-xs">
              {{ t('tools.base64-string-converter.outputLength', 'Output length') }}: {{ textOutputLength }}
            </Badge>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  </div>
</template>
