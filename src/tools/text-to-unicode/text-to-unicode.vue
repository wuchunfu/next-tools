<script setup lang="ts">
import { Languages, X } from 'lucide-vue-next';
import InputCopyable from '@/components/InputCopyable.vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel, FieldSet } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToolI18n } from '@/composable/useToolI18n';
import { convertTextToUnicode, convertUnicodeToText } from './text-to-unicode.service';

const { t } = useToolI18n()
const inputText = ref('')
const unicodeFromText = computed(() => inputText.value.trim() === '' ? '' : convertTextToUnicode(inputText.value))

const inputTextLength = computed(() => inputText.value.length)
const unicodeFromTextLength = computed(() => unicodeFromText.value.length)
const characterCount = computed(() => {
  return inputText.value.length
});
const unicodeEntityCount = computed(() => {
  const matches = unicodeFromText.value.match(/\\u[0-9a-fA-F]{4}/g)
  return matches ? matches.length : 0
});

const inputUnicode = ref('')
const textFromUnicode = computed(() => inputUnicode.value.trim() === '' ? '' : convertUnicodeToText(inputUnicode.value))

const inputUnicodeLength = computed(() => inputUnicode.value.trim().length)
const textFromUnicodeLength = computed(() => textFromUnicode.value.length)
const unicodeInputEntityCount = computed(() => {
  const matches = inputUnicode.value.match(/\\u[0-9a-fA-F]{4}/g)
  return matches ? matches.length : 0
});

function clearTextInput() {
  inputText.value = ''
}

function clearUnicodeInput() {
  inputUnicode.value = ''
}
</script>

<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <Card class="h-full gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Languages class="h-5 w-5 text-primary" />
            {{ t('tools.text-to-unicode.cardTextToUnicodeTitle', 'Text to Unicode') }}
          </CardTitle>
          <CardDescription>
            {{ t('tools.text-to-unicode.cardTextToUnicodeDescription', 'Convert text to Unicode escape sequences (\\u0031 format).') }}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent class="space-y-5">
        <FieldSet>
          <Field orientation="vertical" class="gap-3">
            <div class="flex items-center justify-between">
              <FieldLabel class="text-sm font-medium">
                {{ t('tools.text-to-unicode.enterTextToConvert') }}
              </FieldLabel>
              <div class="flex items-center gap-2">
                <Badge v-if="inputTextLength > 0" variant="outline" class="text-xs">
                  {{ t('tools.text-to-unicode.inputLength', 'Length') }}: {{ inputTextLength }}
                </Badge>
                <Badge v-if="characterCount > 0" variant="secondary" class="text-xs">
                  {{ t('tools.text-to-unicode.characters', 'Characters') }}: {{ characterCount }}
                </Badge>
              </div>
            </div>
            <Textarea
              v-model="inputText"
              :placeholder="t('tools.text-to-unicode.textPlaceholder')"
              rows="6"
              class="max-h-96 resize-y overflow-y-auto break-all"
              data-testid="text-to-unicode-input"
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
                {{ t('tools.text-to-unicode.unicodeFromText') }}
              </FieldLabel>
              <div class="flex items-center gap-2">
                <Badge v-if="unicodeFromTextLength > 0" variant="outline" class="text-xs">
                  {{ t('tools.text-to-unicode.outputLength', 'Length') }}: {{ unicodeFromTextLength }}
                </Badge>
                <Badge v-if="unicodeEntityCount > 0" variant="secondary" class="text-xs">
                  {{ t('tools.text-to-unicode.entities', 'Entities') }}: {{ unicodeEntityCount }}
                </Badge>
              </div>
            </div>
            <InputCopyable
              :value="unicodeFromText"
              :placeholder="t('tools.text-to-unicode.unicodePlaceholder')"
              :field-props="{ orientation: 'vertical' }"
              class="font-mono"
              readonly
              data-testid="text-to-unicode-output"
            />
          </Field>
        </FieldSet>
      </CardContent>
    </Card>

    <Card class="h-full gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Languages class="h-5 w-5 text-primary" />
            {{ t('tools.text-to-unicode.cardUnicodeToTextTitle', 'Unicode to Text') }}
          </CardTitle>
          <CardDescription>
            {{ t('tools.text-to-unicode.cardUnicodeToTextDescription', 'Convert Unicode escape sequences back to text.') }}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent class="space-y-5">
        <FieldSet>
          <Field orientation="vertical" class="gap-3">
            <div class="flex items-center justify-between">
              <FieldLabel class="text-sm font-medium">
                {{ t('tools.text-to-unicode.enterUnicodeToConvert') }}
              </FieldLabel>
              <div class="flex items-center gap-2">
                <Badge v-if="inputUnicodeLength > 0" variant="outline" class="text-xs">
                  {{ t('tools.text-to-unicode.inputLength', 'Length') }}: {{ inputUnicodeLength }}
                </Badge>
                <Badge v-if="unicodeInputEntityCount > 0" variant="secondary" class="text-xs">
                  {{ t('tools.text-to-unicode.entities', 'Entities') }}: {{ unicodeInputEntityCount }}
                </Badge>
              </div>
            </div>
            <Textarea
              v-model="inputUnicode"
              :placeholder="t('tools.text-to-unicode.unicodeInputPlaceholder')"
              rows="6"
              class="max-h-96 resize-y overflow-y-auto break-all font-mono"
              data-testid="unicode-to-text-input"
            />
            <div class="flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" @click="clearUnicodeInput">
                <X class="mr-2 h-4 w-4" />
                {{ t('common.clear', 'Clear') }}
              </Button>
            </div>
          </Field>

          <Separator />

          <Field orientation="vertical" class="gap-3">
            <div class="flex items-center justify-between">
              <FieldLabel class="text-sm font-medium">
                {{ t('tools.text-to-unicode.textFromUnicode') }}
              </FieldLabel>
              <Badge v-if="textFromUnicodeLength > 0" variant="outline" class="text-xs">
                {{ t('tools.text-to-unicode.outputLength', 'Length') }}: {{ textFromUnicodeLength }}
              </Badge>
            </div>
            <InputCopyable
              :value="textFromUnicode"
              :placeholder="t('tools.text-to-unicode.textOutputPlaceholder')"
              :field-props="{ orientation: 'vertical' }"
              readonly
              data-testid="unicode-to-text-output"
            />
          </Field>
        </FieldSet>
      </CardContent>
    </Card>
  </div>
</template>
