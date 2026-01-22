<script setup lang="ts">
import { Calculator } from 'lucide-vue-next'
import { useStorage } from '@vueuse/core'
import { format } from 'date-fns'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent, FieldLabel, FieldSet, FieldTitle } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToolI18n } from '@/composable/useToolI18n'
import DateTimePicker from '@/components/DateTimePicker.vue'
import {
  calculateDateArithmetic,
  calculateDateDifference,
  convertTimeUnits,
  formatDateDifference
} from './date-calculator.service'
import type {OperationType, TimeUnit} from './date-calculator.service';

const { t } = useToolI18n()

// Tab state
const activeTab = ref('arithmetic')

// Date Arithmetic state - support multiple units
const baseDate = useStorage<Date>('date-calculator:base-date', new Date(), localStorage, {
  serializer: {
    read: (v: string) => new Date(v),
    write: (v: Date) => v.toISOString(),
  },
})
const arithmeticOperation = useStorage<OperationType>('date-calculator:arithmetic-operation', 'add')

// Multiple time unit inputs
const arithmeticYears = useStorage('date-calculator:arithmetic-years', 0)
const arithmeticMonths = useStorage('date-calculator:arithmetic-months', 0)
const arithmeticWeeks = useStorage('date-calculator:arithmetic-weeks', 0)
const arithmeticDays = useStorage('date-calculator:arithmetic-days', 0)
const arithmeticHours = useStorage('date-calculator:arithmetic-hours', 0)
const arithmeticMinutes = useStorage('date-calculator:arithmetic-minutes', 0)
const arithmeticSeconds = useStorage('date-calculator:arithmetic-seconds', 0)

// Date Difference state
const startDate = useStorage<Date>('date-calculator:start-date', new Date(), localStorage, {
  serializer: {
    read: (v: string) => new Date(v),
    write: (v: Date) => v.toISOString(),
  },
})
const endDate = useStorage<Date>('date-calculator:end-date', new Date(), localStorage, {
  serializer: {
    read: (v: string) => new Date(v),
    write: (v: Date) => v.toISOString(),
  },
})

// Unit Conversion state
const conversionAmount = useStorage('date-calculator:conversion-amount', 2)
const conversionFromUnit = useStorage<TimeUnit>('date-calculator:conversion-from-unit', 'days')
const conversionToUnit = useStorage<TimeUnit>('date-calculator:conversion-to-unit', 'hours')

// Time unit options
const timeUnitOptions = computed(() => [
  { value: 'years', label: t('tools.date-calculator.unitYears', 'Years') },
  { value: 'months', label: t('tools.date-calculator.unitMonths', 'Months') },
  { value: 'weeks', label: t('tools.date-calculator.unitWeeks', 'Weeks') },
  { value: 'days', label: t('tools.date-calculator.unitDays', 'Days') },
  { value: 'hours', label: t('tools.date-calculator.unitHours', 'Hours') },
  { value: 'minutes', label: t('tools.date-calculator.unitMinutes', 'Minutes') },
  { value: 'seconds', label: t('tools.date-calculator.unitSeconds', 'Seconds') },
])

// Computed results
const arithmeticResult = computed(() => {
  if (!baseDate.value) {
    return undefined
  }

  // Check if all values are non-negative
  const values = [
    arithmeticYears.value,
    arithmeticMonths.value,
    arithmeticWeeks.value,
    arithmeticDays.value,
    arithmeticHours.value,
    arithmeticMinutes.value,
    arithmeticSeconds.value,
  ]
  
  if (values.some(v => v < 0)) {
    return undefined
  }

  // Start with base date
  let result = new Date(baseDate.value)

  // Apply each time unit
  const units: Array<{ amount: number; unit: TimeUnit }> = [
    { amount: arithmeticYears.value, unit: 'years' },
    { amount: arithmeticMonths.value, unit: 'months' },
    { amount: arithmeticWeeks.value, unit: 'weeks' },
    { amount: arithmeticDays.value, unit: 'days' },
    { amount: arithmeticHours.value, unit: 'hours' },
    { amount: arithmeticMinutes.value, unit: 'minutes' },
    { amount: arithmeticSeconds.value, unit: 'seconds' },
  ]

  for (const { amount, unit } of units) {
    if (amount > 0) {
      const calculated = calculateDateArithmetic({
        baseDate: result,
        amount,
        unit,
        operation: arithmeticOperation.value,
      })
      if (calculated) {
        result = calculated
      }
    }
  }

  return result
})

const differenceResult = computed(() => {
  if (!startDate.value || !endDate.value) {
    return undefined
  }

  return calculateDateDifference({
    startDate: startDate.value,
    endDate: endDate.value,
  })
})

const conversionResult = computed(() => {
  if (conversionAmount.value < 0) {
    return 0
  }

  return convertTimeUnits(
    conversionAmount.value,
    conversionFromUnit.value,
    conversionToUnit.value,
  )
})

const conversionResultDisplay = computed(() => {
  return conversionResult.value.toFixed(2)
})

const formattedDifference = computed(() => {
  if (!differenceResult.value) {
    return ''
  }
  return formatDateDifference(differenceResult.value, t)
})

// Validation
const isConversionAmountValid = computed(() => conversionAmount.value >= 0)

// Current selected labels for Select components
const currentConversionFromUnitLabel = computed(() => {
  const option = timeUnitOptions.value.find(opt => opt.value === conversionFromUnit.value)
  return option?.label || ''
})

const currentConversionToUnitLabel = computed(() => {
  const option = timeUnitOptions.value.find(opt => opt.value === conversionToUnit.value)
  return option?.label || ''
})

function formatResultDate(date: Date | undefined): string {
  if (!date) {
    return t('tools.date-calculator.invalidDate', 'Invalid date')
  }
  return format(date, 'yyyy-MM-dd HH:mm:ss')
}
</script>

<template>
  <div class="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Calculator class="h-5 w-5 text-primary" />
          {{ t('tools.date-calculator.title', 'Date Calculator') }}
        </CardTitle>
        <CardDescription>
          {{ t('tools.date-calculator.description', 'Perform date arithmetic, calculate differences, and convert time units') }}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs v-model="activeTab" class="w-full gap-4">
          <TabsList class="grid w-full grid-cols-3">
            <TabsTrigger value="arithmetic" data-testid="tab-arithmetic">
              {{ t('tools.date-calculator.tabArithmetic', 'Date Arithmetic') }}
            </TabsTrigger>
            <TabsTrigger value="difference" data-testid="tab-difference">
              {{ t('tools.date-calculator.tabDifference', 'Date Difference') }}
            </TabsTrigger>
            <TabsTrigger value="conversion" data-testid="tab-conversion">
              {{ t('tools.date-calculator.tabConversion', 'Unit Conversion') }}
            </TabsTrigger>
          </TabsList>

          <!-- Date Arithmetic Tab -->
          <TabsContent value="arithmetic" class="space-y-6" data-testid="content-arithmetic">
            <div class="space-y-4">
              <div class="space-y-2">
                <Label for="base-date">
                  {{ t('tools.date-calculator.baseDate', 'Base Date') }}
                </Label>
                <DateTimePicker
                  v-model="baseDate"
                  :placeholder="t('tools.date-calculator.baseDate', 'Base Date')"
                />
              </div>

              <FieldSet>
                <FieldLabel>{{ t('tools.date-calculator.operation', 'Operation') }}</FieldLabel>
                <RadioGroup v-model="arithmeticOperation" class="grid grid-cols-2 gap-3" data-testid="operation-select">
                  <FieldLabel for="add" class="cursor-pointer hover:bg-accent/50">
                    <Field orientation="horizontal">
                      <FieldContent>
                        <div class="flex items-center gap-2">
                          <FieldTitle>{{ t('tools.date-calculator.add', 'Add') }}</FieldTitle>
                        </div>
                      </FieldContent>
                      <RadioGroupItem id="add" value="add" />
                    </Field>
                  </FieldLabel>
                  <FieldLabel for="subtract" class="cursor-pointer hover:bg-accent/50">
                    <Field orientation="horizontal">
                      <FieldContent>
                        <div class="flex items-center gap-2">
                          <FieldTitle>{{ t('tools.date-calculator.subtract', 'Subtract') }}</FieldTitle>
                        </div>
                      </FieldContent>
                      <RadioGroupItem id="subtract" value="subtract" />
                    </Field>
                  </FieldLabel>
                </RadioGroup>
              </FieldSet>

              <div class="space-y-3">
                <Label>{{ t('tools.date-calculator.unit', 'Unit') }}</Label>
                <div class="grid grid-cols-2 gap-3">
                  <div class="space-y-2">
                    <Label for="arithmetic-years" class="text-sm text-muted-foreground">
                      {{ t('tools.date-calculator.unitYears', 'Years') }}
                    </Label>
                    <Input
                      id="arithmetic-years"
                      v-model.number="arithmeticYears"
                      type="number"
                      min="0"
                      placeholder="0"
                      data-testid="arithmetic-years-input"
                    />
                  </div>

                  <div class="space-y-2">
                    <Label for="arithmetic-months" class="text-sm text-muted-foreground">
                      {{ t('tools.date-calculator.unitMonths', 'Months') }}
                    </Label>
                    <Input
                      id="arithmetic-months"
                      v-model.number="arithmeticMonths"
                      type="number"
                      min="0"
                      placeholder="0"
                      data-testid="arithmetic-months-input"
                    />
                  </div>

                  <div class="space-y-2">
                    <Label for="arithmetic-weeks" class="text-sm text-muted-foreground">
                      {{ t('tools.date-calculator.unitWeeks', 'Weeks') }}
                    </Label>
                    <Input
                      id="arithmetic-weeks"
                      v-model.number="arithmeticWeeks"
                      type="number"
                      min="0"
                      placeholder="0"
                      data-testid="arithmetic-weeks-input"
                    />
                  </div>

                  <div class="space-y-2">
                    <Label for="arithmetic-days" class="text-sm text-muted-foreground">
                      {{ t('tools.date-calculator.unitDays', 'Days') }}
                    </Label>
                    <Input
                      id="arithmetic-days"
                      v-model.number="arithmeticDays"
                      type="number"
                      min="0"
                      placeholder="0"
                      data-testid="arithmetic-days-input"
                    />
                  </div>

                  <div class="space-y-2">
                    <Label for="arithmetic-hours" class="text-sm text-muted-foreground">
                      {{ t('tools.date-calculator.unitHours', 'Hours') }}
                    </Label>
                    <Input
                      id="arithmetic-hours"
                      v-model.number="arithmeticHours"
                      type="number"
                      min="0"
                      placeholder="0"
                      data-testid="arithmetic-hours-input"
                    />
                  </div>

                  <div class="space-y-2">
                    <Label for="arithmetic-minutes" class="text-sm text-muted-foreground">
                      {{ t('tools.date-calculator.unitMinutes', 'Minutes') }}
                    </Label>
                    <Input
                      id="arithmetic-minutes"
                      v-model.number="arithmeticMinutes"
                      type="number"
                      min="0"
                      placeholder="0"
                      data-testid="arithmetic-minutes-input"
                    />
                  </div>

                  <div class="space-y-2">
                    <Label for="arithmetic-seconds" class="text-sm text-muted-foreground">
                      {{ t('tools.date-calculator.unitSeconds', 'Seconds') }}
                    </Label>
                    <Input
                      id="arithmetic-seconds"
                      v-model.number="arithmeticSeconds"
                      type="number"
                      min="0"
                      placeholder="0"
                      data-testid="arithmetic-seconds-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div class="space-y-2">
              <Label>{{ t('tools.date-calculator.result', 'Result') }}</Label>
              <Alert data-testid="arithmetic-result">
                <AlertTitle>{{ t('tools.date-calculator.calculatedDate', 'Calculated Date') }}</AlertTitle>
                <AlertDescription class="font-mono">
                  {{ formatResultDate(arithmeticResult) }}
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <!-- Date Difference Tab -->
          <TabsContent value="difference" class="space-y-6" data-testid="content-difference">
            <div class="space-y-4">
              <div class="space-y-2">
                <Label for="start-date">
                  {{ t('tools.date-calculator.startDate', 'Start Date') }}
                </Label>
                <DateTimePicker
                  v-model="startDate"
                  :placeholder="t('tools.date-calculator.startDate', 'Start Date')"
                />
              </div>

              <div class="space-y-2">
                <Label for="end-date">
                  {{ t('tools.date-calculator.endDate', 'End Date') }}
                </Label>
                <DateTimePicker
                  v-model="endDate"
                  :placeholder="t('tools.date-calculator.endDate', 'End Date')"
                />
              </div>
            </div>

            <Separator />

            <div v-if="differenceResult" class="space-y-4">
              <div>
                <Label>{{ t('tools.date-calculator.formattedDifference', 'Formatted Difference') }}</Label>
                <Alert class="mt-2" data-testid="formatted-difference">
                  <AlertDescription>
                    {{ formattedDifference }}
                  </AlertDescription>
                </Alert>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label>{{ t('tools.date-calculator.years', 'Years') }}</Label>
                  <Input :model-value="differenceResult.years" readonly data-testid="diff-years" />
                </div>
                <div class="space-y-2">
                  <Label>{{ t('tools.date-calculator.months', 'Months') }}</Label>
                  <Input :model-value="differenceResult.months" readonly data-testid="diff-months" />
                </div>
                <div class="space-y-2">
                  <Label>{{ t('tools.date-calculator.weeks', 'Weeks') }}</Label>
                  <Input :model-value="differenceResult.weeks" readonly data-testid="diff-weeks" />
                </div>
                <div class="space-y-2">
                  <Label>{{ t('tools.date-calculator.days', 'Days') }}</Label>
                  <Input :model-value="differenceResult.days" readonly data-testid="diff-days" />
                </div>
                <div class="space-y-2">
                  <Label>{{ t('tools.date-calculator.hours', 'Hours') }}</Label>
                  <Input :model-value="differenceResult.hours" readonly data-testid="diff-hours" />
                </div>
                <div class="space-y-2">
                  <Label>{{ t('tools.date-calculator.minutes', 'Minutes') }}</Label>
                  <Input :model-value="differenceResult.minutes" readonly data-testid="diff-minutes" />
                </div>
                <div class="space-y-2">
                  <Label>{{ t('tools.date-calculator.seconds', 'Seconds') }}</Label>
                  <Input :model-value="differenceResult.seconds" readonly data-testid="diff-seconds" />
                </div>
              </div>
            </div>
          </TabsContent>

          <!-- Unit Conversion Tab -->
          <TabsContent value="conversion" class="space-y-4" data-testid="content-conversion">
            <div class="space-y-4">
              <div class="flex items-end gap-2">
                <div class="flex-1 space-y-2">
                  <Label for="conversion-amount">
                    {{ t('tools.date-calculator.amount', 'Amount') }}
                  </Label>
                  <Input
                    id="conversion-amount"
                    v-model.number="conversionAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    data-testid="conversion-amount-input"
                    :class="{ 'border-destructive': !isConversionAmountValid }"
                  />
                </div>

                <div class="w-[180px] space-y-2">
                  <Label for="conversion-from">
                    {{ t('tools.date-calculator.unit', 'Unit') }}
                  </Label>
                  <Select v-model="conversionFromUnit">
                    <SelectTrigger id="conversion-from">
                      <SelectValue :placeholder="currentConversionFromUnitLabel || t('tools.date-calculator.unit', 'Unit')" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="option in timeUnitOptions"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <Label>{{ t('tools.date-calculator.result', 'Result') }}</Label>
              <div class="flex items-center gap-2">
                <Input
                  :model-value="conversionResultDisplay"
                  readonly
                  class="flex-1 font-mono text-lg"
                  data-testid="conversion-result"
                />

                <div class="w-[180px]">
                  <Select v-model="conversionToUnit">
                    <SelectTrigger id="conversion-to">
                      <SelectValue :placeholder="currentConversionToUnitLabel || t('tools.date-calculator.unit', 'Unit')" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="option in timeUnitOptions"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  </div>
</template>
