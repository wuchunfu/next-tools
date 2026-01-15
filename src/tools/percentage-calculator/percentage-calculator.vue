<script setup lang="ts">
import { Percent, X } from 'lucide-vue-next';

import InputCopyable from '@/components/InputCopyable.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useToolI18n } from '@/composable/useToolI18n'

const { t } = useToolI18n();

// Calculation 1: What is X% of Y?
const percentageX = ref('');
const percentageY = ref('');
const percentageResult = computed(() => {
  const x = Number.parseFloat(percentageX.value);
  const y = Number.parseFloat(percentageY.value);
  if (Number.isNaN(x) || Number.isNaN(y)) {
    return '';
  }
  const result = (x / 100) * y;
  return (!Number.isFinite(result) || Number.isNaN(result)) ? '' : result.toFixed(2);
})

// Calculation 2: X is what percent of Y?
const numberX = ref('');
const numberY = ref('');
const numberResult = computed(() => {
  const x = Number.parseFloat(numberX.value);
  const y = Number.parseFloat(numberY.value);
  if (Number.isNaN(x) || Number.isNaN(y) || y === 0) {
    return '';
  }
  const result = (100 * x) / y;
  return (!Number.isFinite(result) || Number.isNaN(result)) ? '' : result.toFixed(2);
})

// Calculation 3: Percentage increase/decrease
const numberFrom = ref('');
const numberTo = ref('');
const percentageIncreaseDecrease = computed(() => {
  const from = Number.parseFloat(numberFrom.value);
  const to = Number.parseFloat(numberTo.value);
  if (Number.isNaN(from) || Number.isNaN(to) || from === 0) {
    return '';
  }
  const result = ((to - from) / from) * 100;
  return (!Number.isFinite(result) || Number.isNaN(result)) ? '' : result.toFixed(2);
})

function clearCalculation1() {
  percentageX.value = '';
  percentageY.value = '';
}

function clearCalculation2() {
  numberX.value = '';
  numberY.value = '';
}

function clearCalculation3() {
  numberFrom.value = '';
  numberTo.value = '';
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Calculation 1: What is X% of Y? -->
    <Card class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Percent class="h-5 w-5 text-primary" />
            {{ t('tools.percentage-calculator.card1Title', 'What is X% of Y?') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.percentage-calculator.card1Description',
                'Calculate the percentage of a value. Enter the percentage (X) and the base value (Y) to get the result.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup class="space-y-4 gap-2">
          <div class="grid gap-4 md:grid-cols-3 md:items-end">
            <Field>
              <FieldLabel>
                {{ t('tools.percentage-calculator.percentage', 'Percentage') }} (%)
              </FieldLabel>
              <FieldContent>
                <Input
                  v-model="percentageX"
                  type="number"
                  step="any"
                  :placeholder="t('tools.percentage-calculator.placeholderX', 'X')"
                  data-testid="percentageX"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                {{ t('tools.percentage-calculator.of', 'of') }}
              </FieldLabel>
              <FieldContent>
                <Input
                  v-model="percentageY"
                  type="number"
                  step="any"
                  :placeholder="t('tools.percentage-calculator.placeholderY', 'Y')"
                  data-testid="percentageY"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                {{ t('tools.percentage-calculator.result', 'Result') }}
              </FieldLabel>
              <FieldContent>
                <InputCopyable
                  :value="percentageResult"
                  readonly
                  :placeholder="t('tools.percentage-calculator.result', 'Result')"
                  data-testid="percentageResult"
                  :field-props="{ class: 'w-full' }"
                />
              </FieldContent>
            </Field>
          </div>

          <div class="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              :disabled="!percentageX && !percentageY"
              @click="clearCalculation1"
            >
              <X class="mr-2 h-4 w-4" />
              {{ t('common.clear', 'Clear') }}
            </Button>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>

    <!-- Calculation 2: X is what percent of Y? -->
    <Card class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Percent class="h-5 w-5 text-primary" />
            {{ t('tools.percentage-calculator.card2Title', 'X is what percent of Y?') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.percentage-calculator.card2Description',
                'Find what percentage one value is of another. Enter the value (X) and the total (Y) to calculate the percentage.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup class="space-y-4 gap-2">
          <div class="grid gap-4 md:grid-cols-3 md:items-end">
            <Field>
              <FieldLabel>
                {{ t('tools.percentage-calculator.value', 'Value') }}
              </FieldLabel>
              <FieldContent>
                <Input
                  v-model="numberX"
                  type="number"
                  step="any"
                  :placeholder="t('tools.percentage-calculator.placeholderX', 'X')"
                  data-testid="numberX"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                {{ t('tools.percentage-calculator.isWhatPercentOf', 'is what percent of') }}
              </FieldLabel>
              <FieldContent>
                <Input
                  v-model="numberY"
                  type="number"
                  step="any"
                  :placeholder="t('tools.percentage-calculator.placeholderY', 'Y')"
                  data-testid="numberY"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                {{ t('tools.percentage-calculator.result', 'Result') }} (%)
              </FieldLabel>
              <FieldContent>
                <InputCopyable
                  :value="numberResult"
                  readonly
                  :placeholder="t('tools.percentage-calculator.result', 'Result')"
                  data-testid="numberResult"
                  :field-props="{ class: 'w-full' }"
                />
              </FieldContent>
            </Field>
          </div>

          <div class="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              :disabled="!numberX && !numberY"
              @click="clearCalculation2"
            >
              <X class="mr-2 h-4 w-4" />
              {{ t('common.clear', 'Clear') }}
            </Button>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>

    <!-- Calculation 3: Percentage increase/decrease -->
    <Card class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Percent class="h-5 w-5 text-primary" />
            {{ t('tools.percentage-calculator.card3Title', 'Percentage increase/decrease') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.percentage-calculator.card3Description',
                'Calculate the percentage change between two values. Enter the initial value (From) and the final value (To) to get the percentage change.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup class="space-y-4 gap-2">
          <div class="grid gap-4 md:grid-cols-3 md:items-end">
            <Field>
              <FieldLabel>
                {{ t('tools.percentage-calculator.from', 'From') }}
              </FieldLabel>
              <FieldContent>
                <Input
                  v-model="numberFrom"
                  type="number"
                  step="any"
                  :placeholder="t('tools.percentage-calculator.from', 'From')"
                  data-testid="numberFrom"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                {{ t('tools.percentage-calculator.to', 'To') }}
              </FieldLabel>
              <FieldContent>
                <Input
                  v-model="numberTo"
                  type="number"
                  step="any"
                  :placeholder="t('tools.percentage-calculator.to', 'To')"
                  data-testid="numberTo"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                {{ t('tools.percentage-calculator.result', 'Result') }} (%)
              </FieldLabel>
              <FieldContent>
                <InputCopyable
                  :value="percentageIncreaseDecrease"
                  readonly
                  :placeholder="t('tools.percentage-calculator.result', 'Result')"
                  data-testid="percentageIncreaseDecrease"
                  :field-props="{ class: 'w-full' }"
                />
              </FieldContent>
            </Field>
          </div>

          <div class="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              :disabled="!numberFrom && !numberTo"
              @click="clearCalculation3"
            >
              <X class="mr-2 h-4 w-4" />
              {{ t('common.clear', 'Clear') }}
            </Button>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  </div>
</template>
