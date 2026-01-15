<script setup lang="ts">
import { Binary, X } from 'lucide-vue-next';
import InputCopyable from '@/components/InputCopyable.vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel, FieldSet } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToolI18n } from '@/composable/useToolI18n';
import { useValidation } from '@/composable/validation';
import { isNotThrowing } from '@/utils/boolean';
import { withDefaultOnError } from '@/utils/defaults';
import { convertAsciiBinaryToText, convertTextToAsciiBinary } from './text-to-binary.models';

const { t } = useToolI18n()
const inputText = ref('')
const binaryFromText = computed(() => convertTextToAsciiBinary(inputText.value))

const inputTextLength = computed(() => inputText.value.length)
const binaryFromTextLength = computed(() => binaryFromText.value.length)
const binaryByteCount = computed(() => {
  const bytes = binaryFromText.value.split(' ').filter(b => b.length === 8)
  return bytes.length
});

const inputBinary = ref('')
const textFromBinary = computed(() => withDefaultOnError(() => convertAsciiBinaryToText(inputBinary.value), ''))
const inputBinaryValidation = useValidation({
  source: inputBinary,
  rules: computed(() => [
    {
      validator: (value: string) => isNotThrowing(() => convertAsciiBinaryToText(value)),
      message: t('tools.text-to-binary.invalidBinary', 'Invalid binary'),
    },
  ]),
})

const inputBinaryLength = computed(() => inputBinary.value.trim().length)
const textFromBinaryLength = computed(() => textFromBinary.value.length)
const binaryInputByteCount = computed(() => {
  const bytes = inputBinary.value.trim().split(/\s+/).filter(b => b.length === 8)
  return bytes.length
});

function clearTextInput() {
  inputText.value = ''
}

function clearBinaryInput() {
  inputBinary.value = ''
}
</script>

<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <Card class="h-full gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Binary class="h-5 w-5 text-primary" />
            {{ t('tools.text-to-binary.cardTextToBinaryTitle', 'Text to Binary') }}
          </CardTitle>
          <CardDescription>
            {{ t('tools.text-to-binary.cardTextToBinaryDescription', 'Convert text to its ASCII binary representation.') }}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent class="space-y-5">
        <FieldSet>
          <Field orientation="vertical" class="gap-3">
            <div class="flex items-center justify-between">
              <FieldLabel class="text-sm font-medium">
                {{ t('tools.text-to-binary.enterTextToConvert') }}
              </FieldLabel>
              <Badge v-if="inputTextLength > 0" variant="outline" class="text-xs">
                {{ t('tools.text-to-binary.inputLength', 'Length') }}: {{ inputTextLength }}
              </Badge>
            </div>
            <Textarea
              v-model="inputText"
              :placeholder="t('tools.text-to-binary.textPlaceholder')"
              rows="6"
              class="max-h-96 resize-y overflow-y-auto break-all font-mono"
              data-testid="text-to-binary-input"
            />
            <div class="flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" @click="clearTextInput">
                <X class="mr-2 h-4 w-4" />
                {{ t('common.clear', 'Clear') }}
              </Button>
            </div>
          </Field>

          <Separator />

          <Field orientation="vertical" class="gap-3">
            <div class="flex items-center justify-between">
              <FieldLabel class="text-sm font-medium">
                {{ t('tools.text-to-binary.binaryFromText') }}
              </FieldLabel>
              <div class="flex items-center gap-2">
                <Badge v-if="binaryFromTextLength > 0" variant="outline" class="text-xs">
                  {{ t('tools.text-to-binary.outputLength', 'Length') }}: {{ binaryFromTextLength }}
                </Badge>
                <Badge v-if="binaryByteCount > 0" variant="secondary" class="text-xs">
                  {{ t('tools.text-to-binary.bytes', 'Bytes') }}: {{ binaryByteCount }}
                </Badge>
              </div>
            </div>
            <InputCopyable
              :value="binaryFromText"
              :placeholder="t('tools.text-to-binary.binaryPlaceholder')"
              :field-props="{ orientation: 'vertical' }"
              class="font-mono"
              readonly
              data-testid="text-to-binary-output"
            />
          </Field>
        </FieldSet>
      </CardContent>
    </Card>

    <Card class="h-full gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Binary class="h-5 w-5 text-primary" />
            {{ t('tools.text-to-binary.cardBinaryToTextTitle', 'Binary to Text') }}
          </CardTitle>
          <CardDescription>
            {{ t('tools.text-to-binary.cardBinaryToTextDescription', 'Convert ASCII binary representation back to text.') }}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent class="space-y-5">
        <FieldSet>
          <Field orientation="vertical" class="gap-3">
            <div class="flex items-center justify-between">
              <FieldLabel class="text-sm font-medium">
                {{ t('tools.text-to-binary.enterBinaryToConvert') }}
              </FieldLabel>
              <div class="flex items-center gap-2">
                <Badge v-if="inputBinaryLength > 0" variant="outline" class="text-xs">
                  {{ t('tools.text-to-binary.inputLength', 'Length') }}: {{ inputBinaryLength }}
                </Badge>
                <Badge v-if="binaryInputByteCount > 0" variant="secondary" class="text-xs">
                  {{ t('tools.text-to-binary.bytes', 'Bytes') }}: {{ binaryInputByteCount }}
                </Badge>
              </div>
            </div>
            <Textarea
              v-model="inputBinary"
              :placeholder="t('tools.text-to-binary.binaryInputPlaceholder')"
              rows="6"
              class="max-h-96 resize-y overflow-y-auto break-all font-mono"
              :class="{ 'border-destructive ring-1 ring-destructive/60': inputBinaryValidation.status === 'error' }"
              data-testid="binary-to-text-input"
            />
            <p v-if="inputBinaryValidation.status === 'error'" class="text-xs text-destructive">
              {{ inputBinaryValidation.message }}
            </p>
            <div class="flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" @click="clearBinaryInput">
                <X class="mr-2 h-4 w-4" />
                {{ t('common.clear', 'Clear') }}
              </Button>
            </div>
          </Field>

          <Separator />

          <Field orientation="vertical" class="gap-3">
            <div class="flex items-center justify-between">
              <FieldLabel class="text-sm font-medium">
                {{ t('tools.text-to-binary.textFromBinary') }}
              </FieldLabel>
              <Badge v-if="textFromBinaryLength > 0" variant="outline" class="text-xs">
                {{ t('tools.text-to-binary.outputLength', 'Length') }}: {{ textFromBinaryLength }}
              </Badge>
            </div>
            <InputCopyable
              :value="textFromBinary"
              :placeholder="t('tools.text-to-binary.textOutputPlaceholder')"
              :field-props="{ orientation: 'vertical' }"
              readonly
              data-testid="binary-to-text-output"
            />
          </Field>
        </FieldSet>
      </CardContent>
    </Card>
  </div>
</template>
