<script setup lang="ts">
import InputCopyable from '@/components/InputCopyable.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useToolI18n } from '@/composable/useToolI18n'
import { useValidation } from '@/composable/validation'
import {
  arabicToRoman,
  isValidRomanNumber,
  MAX_ARABIC_TO_ROMAN,
  MIN_ARABIC_TO_ROMAN,
  romanToArabic,
} from './roman-numeral-converter.service'

const { t } = useToolI18n();

const inputNumeral = ref(42);
const outputRoman = computed(() => {
  if (inputNumeral.value < MIN_ARABIC_TO_ROMAN || inputNumeral.value > MAX_ARABIC_TO_ROMAN) {
    return '';
  }
  return arabicToRoman(inputNumeral.value);
})

const validationNumeral = useValidation({
  source: inputNumeral,
  rules: computed(() => ([
    {
      validator: (value: number) => value >= MIN_ARABIC_TO_ROMAN && value <= MAX_ARABIC_TO_ROMAN,
      message: t('tools.roman-numeral-converter.invalidRange', {
        min: MIN_ARABIC_TO_ROMAN.toLocaleString(),
        max: MAX_ARABIC_TO_ROMAN.toLocaleString(),
      }),
    },
  ])),
})

const inputRoman = ref('XLII');
const outputNumeral = computed(() => {
  if (!isValidRomanNumber(inputRoman.value)) {
    return '';
  }
  return romanToArabic(inputRoman.value);
})

const validationRoman = useValidation({
  source: inputRoman,
  rules: computed(() => [
    {
      validator: (value: string) => isValidRomanNumber(value),
      message: t('tools.roman-numeral-converter.invalidRoman', 'Invalid Roman numeral'),
    },
  ]),
});
</script>

<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <Card class="h-full gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle>{{ t('tools.roman-numeral-converter.cardArabicTitle', 'Arabic to Roman') }}</CardTitle>
          <CardDescription>
            {{ t('tools.roman-numeral-converter.cardArabicDescription', 'Convert Arabic numbers to classic Roman numerals.') }}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent class="space-y-5">
        <FieldGroup>
          <Field orientation="vertical" class="gap-3">
            <div class="flex items-center justify-between">
              <FieldLabel class="text-sm font-medium">
                {{ t('tools.roman-numeral-converter.inputArabicLabel', 'Arabic number') }}
              </FieldLabel>
              <Badge variant="outline" class="text-xs">
                {{ MIN_ARABIC_TO_ROMAN }} - {{ MAX_ARABIC_TO_ROMAN }}
              </Badge>
            </div>
            <FieldDescription>
              {{ t('tools.roman-numeral-converter.inputArabicPlaceholder', 'Enter an integer within the supported range.') }}
            </FieldDescription>
            <Input
              id="arabic-input"
              v-model.number="inputNumeral"
              type="number"
              :min="MIN_ARABIC_TO_ROMAN"
              :max="MAX_ARABIC_TO_ROMAN"
              class="max-w-xs"
              :class="{ 'border-destructive ring-1 ring-destructive/60': validationNumeral.status === 'error' }"
              :aria-invalid="validationNumeral.status === 'error'"
            />
            <p v-if="validationNumeral.status === 'error'" class="text-xs text-destructive">
              {{ validationNumeral.message }}
            </p>
            <div class="flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" @click="inputNumeral = MIN_ARABIC_TO_ROMAN">
                {{ t('tools.roman-numeral-converter.reset', 'Reset') }}
              </Button>
            </div>
          </Field>

          <Separator />

          <FieldGroup>
            <InputCopyable
              :label="t('tools.roman-numeral-converter.outputRomanLabel', 'Roman numeral')"
              :value="outputRoman"
              :placeholder="t('tools.roman-numeral-converter.outputRomanPlaceholder', 'Converted value will appear here')"
              :field-props="{ orientation: 'vertical' }"
              readonly
            />
            <div v-if="outputRoman" class="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" class="text-xs">
                {{ t('tools.roman-numeral-converter.length', 'Length') }}: {{ outputRoman.length }}
              </Badge>
            </div>
          </FieldGroup>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card class="h-full gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle>{{ t('tools.roman-numeral-converter.cardRomanTitle', 'Roman to Arabic') }}</CardTitle>
          <CardDescription>
            {{ t('tools.roman-numeral-converter.cardRomanDescription', 'Validate and convert Roman numerals back to Arabic numbers.') }}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent class="space-y-5">
        <FieldGroup>
          <Field orientation="vertical" class="gap-3">
            <div class="flex items-center justify-between">
              <FieldLabel class="text-sm font-medium">
                {{ t('tools.roman-numeral-converter.inputRomanLabel', 'Roman numeral') }}
              </FieldLabel>
              <Badge variant="outline" class="text-xs uppercase">
                I V X L C D M
              </Badge>
            </div>
            <FieldDescription>
              {{ t('tools.roman-numeral-converter.inputRomanPlaceholder', 'Type a valid Roman numeral (e.g., MMXXIV).') }}
            </FieldDescription>
            <Input
              id="roman-input"
              v-model="inputRoman"
              class="max-w-xs uppercase font-mono"
              :class="{ 'border-destructive ring-1 ring-destructive/60': !validationRoman.isValid && inputRoman }"
              :aria-invalid="!validationRoman.isValid"
            />
            <p v-if="!validationRoman.isValid && inputRoman" class="text-xs text-destructive">
              {{ validationRoman.message }}
            </p>
            <div class="flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" @click="inputRoman = 'I'">
                {{ t('tools.roman-numeral-converter.reset', 'Reset') }}
              </Button>
            </div>
          </Field>

          <Separator />

          <FieldGroup>
            <InputCopyable
              :label="t('tools.roman-numeral-converter.outputArabicLabel', 'Arabic number')"
              :value="outputNumeral ? String(outputNumeral) : ''"
              :placeholder="t('tools.roman-numeral-converter.outputArabicPlaceholder', 'Converted value will appear here')"
              :field-props="{ orientation: 'vertical' }"
              readonly
            />
            <div v-if="outputNumeral" class="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" class="text-xs">
                {{ t('tools.roman-numeral-converter.value', 'Value') }}: {{ outputNumeral.toLocaleString() }}
              </Badge>
            </div>
          </FieldGroup>
        </FieldGroup>
      </CardContent>
    </Card>
  </div>
</template>
