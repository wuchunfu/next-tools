<script lang="ts" setup>
import { syncRef, useStorage } from '@vueuse/core'
import { isValidCron } from 'cron-validator'
import cronstrue from 'cronstrue/i18n'
import {
  AlarmClockCheck,
  Clock,
  Copy,
  Info,
  List,
  Wand2,
} from 'lucide-vue-next'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Field, FieldContent, FieldLabel, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCopy } from '@/composable/copy'
import { useToolI18n } from '@/composable/useToolI18n'
import type { CronConfig, CronFieldConfig, CronFieldMode } from './cron-generator.service'
import {
  CronFieldType,
  FIELD_RANGES,
  generateCronExpression,
  getDefaultCronConfig,
  getFieldValues,
  parseCronExpression,
} from './cron-generator.service'

function isCronValid(v: string) {
  return isValidCron(v, { allowBlankDay: true, alias: true, seconds: true })
}

const CRONTAB = {
  EVERY_SECOND: '* * * * * *',
  EVERY_MINUTE: '0 * * * * *',
  EVERY_HOUR: '0 0 * * * *',
  EVERY_DAY: '0 0 0 * * *',
  EVERY_DAY_ZERO_FIFTEEN: '0 15 0 * * *',
  EVERY_DAY_ONE_FIFTEEN: '0 15 1 * * *',
  EVERY_PER_5_SECOND: '*/5 * * * * *',
  EVERY_PER_10_SECOND: '*/10 * * * * *',
  EVERY_PER_30_SECOND: '*/30 * * * * *',
  EVERY_PER_5_MINUTE: '0 */5 * * * *',
  EVERY_PER_10_MINUTE: '0 */10 * * * *',
  EVERY_PER_30_MINUTE: '0 */30 * * * *',
  EVERY_MONDAY_8: '0 0 8 * * 1',
  EVERY_WEEKDAY_9: '0 0 9 * * 1-5',
  FIRST_DAY_MONTH_MIDNIGHT: '0 0 0 1 * *',
  EVERY_SUNDAY_MIDNIGHT: '0 0 0 * * 0',
} as const

// Cron expression input and validation (persisted in localStorage)
const cron = useStorage('cron:expression', CRONTAB.EVERY_SECOND)

// Persisted cronstrue options
const cronstrueVerbose = useStorage('cron:cronstrue:verbose', true)
const cronstrueDayOfWeekStartIndexZero = useStorage('cron:cronstrue:day-start-index-zero', true)
const cronstrueUse24HourTimeFormat = useStorage('cron:cronstrue:use-24-hour-format', true)
const cronstrueThrowExceptionOnParseError = useStorage('cron:cronstrue:throw-exception-on-parse-error', true)

const cronstrueConfig = computed(() => ({
  verbose: cronstrueVerbose.value,
  dayOfWeekStartIndexZero: cronstrueDayOfWeekStartIndexZero.value,
  use24HourTimeFormat: cronstrueUse24HourTimeFormat.value,
  throwExceptionOnParseError: cronstrueThrowExceptionOnParseError.value,
}))

const { t, locale } = useToolI18n()
const cronstrueLocale = computed(() => {
  const lang = locale.value?.split('-')[0] || 'en'
  return lang === 'zh' ? 'zh_CN' : locale.value || 'en'
})

const cronValid = computed(() => isCronValid(cron.value))

const cronString = computed(() => {
  if (cronValid.value) {
    try {
      return cronstrue.toString(cron.value, { ...cronstrueConfig.value, locale: cronstrueLocale.value })
    }
    catch {
      return ''
    }
  }
  return ''
})

const { copy: copyCron } = useCopy({
  source: cron,
})

const cronPresetOpen = ref(false)

// Generator state
const generatorConfig = ref<CronConfig>(parseCronExpression(cron.value) || getDefaultCronConfig())
const activeFieldTab = ref<CronFieldType>(CronFieldType.Second)

// Bidirectional sync between cron expression and generator config
syncRef<string, CronConfig>(
  cron,
  generatorConfig,
  {
    transform: {
      // cron -> generatorConfig (when user types in cron input)
      ltr: (cronExpr) => {
        const parsed = parseCronExpression(cronExpr)
        // Only update if valid, otherwise keep current config
        return parsed || generatorConfig.value
      },
      // generatorConfig -> cron (when user changes form)
      rtl: (config) => {
        return generateCronExpression(config, false) as typeof cron.value
      },
    },
    deep: true,
    immediate: false
  },
)

// Get field config
function getFieldConfig(fieldType: CronFieldType): CronFieldConfig {
  return generatorConfig.value[fieldType] || { mode: 'every' }
}

// Update field config
function updateFieldConfig(fieldType: CronFieldType, config: CronFieldConfig) {
  generatorConfig.value[fieldType] = config
}

// Get field range
function getFieldRange(fieldType: CronFieldType) {
  return FIELD_RANGES[fieldType]
}

// Get all values for a field
function getFieldValueOptions(fieldType: CronFieldType): number[] {
  return getFieldValues(fieldType)
}

// Get display label for specific values
function getFieldValueLabel(fieldType: CronFieldType, value: number): string {
  if (fieldType === CronFieldType.Month) {
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
    return t(`tools.cron-generator.${months[value - 1]}`, value.toString())
  }

  if (fieldType === CronFieldType.Week) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return t(`tools.cron-generator.${days[value]}`, value.toString())
  }

  return value.toString()
}

// Presets
const helpers = computed(() => [
  { symbol: '*', meaning: t('tools.cron-generator.anyValue'), example: '* * * *', equivalent: t('tools.cron-generator.everyMinute') },
  { symbol: '-', meaning: t('tools.cron-generator.rangeOfValues'), example: '1-10 * * *', equivalent: t('tools.cron-generator.minutes1Through10') },
  { symbol: ',', meaning: t('tools.cron-generator.listOfValues'), example: '1,10 * * *', equivalent: t('tools.cron-generator.atMinutes1And10') },
  { symbol: '/', meaning: t('tools.cron-generator.stepValues'), example: '*/10 * * *', equivalent: t('tools.cron-generator.every10Minutes') },
])

const cronPresets = computed(() => [
  {
    value: CRONTAB.EVERY_SECOND,
    label: t('tools.cron-generator.presetEverySecond', 'Every second'),
  },
  {
    value: CRONTAB.EVERY_PER_5_SECOND,
    label: t('tools.cron-generator.presetEvery5Seconds', 'Every 5 seconds'),
  },
  {
    value: CRONTAB.EVERY_PER_10_SECOND,
    label: t('tools.cron-generator.presetEvery10Seconds', 'Every 10 seconds'),
  },
  {
    value: CRONTAB.EVERY_PER_30_SECOND,
    label: t('tools.cron-generator.presetEvery30Seconds', 'Every 30 seconds'),
  },
  {
    value: CRONTAB.EVERY_MINUTE,
    label: t('tools.cron-generator.presetEveryMinute', 'Every minute (at second 0)'),
  },
  {
    value: CRONTAB.EVERY_PER_5_MINUTE,
    label: t('tools.cron-generator.presetEvery5Minutes', 'Every 5 minutes'),
  },
  {
    value: CRONTAB.EVERY_PER_10_MINUTE,
    label: t('tools.cron-generator.presetEvery10Minutes', 'Every 10 minutes'),
  },
  {
    value: CRONTAB.EVERY_PER_30_MINUTE,
    label: t('tools.cron-generator.presetEvery30Minutes', 'Every 30 minutes'),
  },
  {
    value: CRONTAB.EVERY_HOUR,
    label: t('tools.cron-generator.presetEveryHour', 'Every hour at :00'),
  },
  {
    value: CRONTAB.EVERY_DAY,
    label: t('tools.cron-generator.presetEveryDayMidnight', 'Every day at 00:00'),
  },
  {
    value: CRONTAB.EVERY_DAY_ZERO_FIFTEEN,
    label: t('tools.cron-generator.presetEveryDay0015', 'Every day at 00:15'),
  },
  {
    value: CRONTAB.EVERY_DAY_ONE_FIFTEEN,
    label: t('tools.cron-generator.presetEveryDay0115', 'Every day at 01:15'),
  },
  {
    value: CRONTAB.EVERY_WEEKDAY_9,
    label: t('tools.cron-generator.presetEveryWeekday9', 'Every weekday at 09:00'),
  },
  {
    value: CRONTAB.EVERY_MONDAY_8,
    label: t('tools.cron-generator.presetEveryMonday8', 'Every Monday at 08:00'),
  },
  {
    value: CRONTAB.FIRST_DAY_MONTH_MIDNIGHT,
    label: t('tools.cron-generator.presetFirstOfMonthMidnight', 'First day of each month at midnight'),
  },
  {
    value: CRONTAB.EVERY_SUNDAY_MIDNIGHT,
    label: t('tools.cron-generator.presetEverySundayMidnight', 'Every Sunday at midnight'),
  },
])
</script>

<template>
  <div class="space-y-6">
    <Card>
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <AlarmClockCheck class="h-5 w-5 text-primary" />
            {{ t('tools.cron-generator.cardTitle', 'Crontab validator') }}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent class="space-y-6">
        <div class="grid gap-6 lg:grid-cols-2">
          <div class="space-y-4">
            <FieldSet class="space-y-3">
              <div class="flex items-center justify-between">
                <FieldLabel class="text-sm font-medium">
                  {{ t('tools.cron-generator.inputLabel', 'Cron expression') }}
                </FieldLabel>
                <div class="flex items-center gap-1">
                  <Button data-testid="copy-cron-btn" size="icon-sm" variant="outline" @click="copyCron()">
                    <Copy class="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Field>
                <FieldContent class="flex flex-row items-center gap-2">
                  <Input
                    v-model="cron"
                    :placeholder="t('tools.cron-generator.inputPlaceholder', '* * * * * *')"
                    class="text-center text-lg font-mono flex-1"
                    data-testid="cron-input"
                  />
                  <Popover v-model:open="cronPresetOpen">
                    <PopoverTrigger as-child>
                      <Button class="size-9" data-testid="preset-btn" variant="outline">
                        <Clock class="size-4.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" class="w-80 p-0">
                      <Command>
                        <CommandInput
                          :placeholder="t('tools.cron-generator.presetSearchPlaceholder', 'Search schedules...')"
                        />
                        <CommandList>
                          <CommandEmpty>{{ t('common.noResults', 'No results found') }}</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              v-for="preset in cronPresets"
                              :key="preset.value"
                              :value="`${preset.value} ${preset.label}`"
                              @select="() => { cron = preset.value as typeof cron; cronPresetOpen = false }"
                            >
                              <div class="flex flex-col gap-0.5">
                                <span class="font-mono text-xs text-foreground">{{ preset.value }}</span>
                                <span class="text-xs text-muted-foreground">{{ preset.label }}</span>
                              </div>
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FieldContent>
              </Field>
              <div class="text-xs text-muted-foreground">
                {{ t('tools.cron-generator.inputHint', 'Supports standard 5-part cron expressions and 6-part expressions with seconds.') }}
              </div>
              <div v-if="!cronValid" class="text-sm text-destructive" data-testid="cron-error">
                {{ t('tools.cron-generator.invalidCron') }}
              </div>
            </FieldSet>

            <Separator />

            <FieldSet class="space-y-3">
              <div class="flex items-center gap-2 text-sm font-medium">
                <Info class="h-4 w-4 text-muted-foreground" />
                {{ t('tools.cron-generator.optionsTitle', 'Options') }}
              </div>
              <div class="space-y-2">
                <div class="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                  <div class="text-sm">
                    {{ t('tools.cron-generator.verbose') }}
                  </div>
                  <Switch v-model="cronstrueVerbose" />
                </div>
                <div class="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                  <div class="text-sm">
                    {{ t('tools.cron-generator.use24HourTimeFormat') }}
                  </div>
                  <Switch v-model="cronstrueUse24HourTimeFormat" />
                </div>
                <div class="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                  <div class="text-sm">
                    {{ t('tools.cron-generator.daysStartAt0') }}
                  </div>
                  <Switch v-model="cronstrueDayOfWeekStartIndexZero" />
                </div>
              </div>
            </FieldSet>
          </div>

          <div class="space-y-3 overflow-hidden">
            <div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <List class="h-4 w-4" />
              {{ t('tools.cron-generator.humanReadableTitle', 'Human readable') }}
            </div>
            <Alert v-if="!cronValid" class="border-destructive/40 bg-destructive/10" data-testid="cron-invalid-alert" variant="destructive">
              <AlertTitle class="text-destructive text-sm">
                {{ t('tools.cron-generator.invalidCron') }}
              </AlertTitle>
              <AlertDescription class="text-destructive/80 text-sm">
                {{ t('tools.cron-generator.invalidHint', 'Please enter a valid cron to see the description.') }}
              </AlertDescription>
            </Alert>
            <div v-else class="rounded-lg border bg-muted/30 p-4 max-h-30.5 overflow-y-auto" data-testid="cron-human-readable">
              <p class="text-base font-medium leading-relaxed text-foreground">
                {{ cronString }}
              </p>
            </div>

            <div class="rounded-lg border bg-muted/20 p-4 text-sm font-mono leading-6">
              <div class="w-full overflow-auto">
                <pre class="inline-block min-w-max whitespace-pre text-foreground">
┌──────────── [{{ t('tools.cron-generator.legendOptional') }}] {{ t('tools.cron-generator.legendSeconds') }}
| ┌────────── {{ t('tools.cron-generator.legendMinutes') }}
| | ┌──────── {{ t('tools.cron-generator.legendHours') }}
| | | ┌────── {{ t('tools.cron-generator.legendDayOfMonth') }}
| | | | ┌──── {{ t('tools.cron-generator.legendMonth') }}
| | | | | ┌── {{ t('tools.cron-generator.legendDayOfWeek') }}
| | | | | |
* * * * * * {{ t('tools.cron-generator.legendCommand') }}
    </pre>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Generator Card -->
    <Card data-testid="generator-card">
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Wand2 class="h-5 w-5 text-primary" />
            {{ t('tools.cron-generator.generatorCardTitle', 'Cron Expression Generator') }}
          </CardTitle>
          <CardDescription>
            {{ t('tools.cron-generator.generatorCardDescription', 'Generate cron expressions using a visual form builder') }}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent class="space-y-4">
        <!-- Field Tabs -->
        <Tabs v-model="activeFieldTab" class="w-full">
          <TabsList class="grid w-full grid-cols-6">
            <TabsTrigger data-testid="tab-second" value="second">
              {{ t('tools.cron-generator.tabSecond', 'Second') }}
            </TabsTrigger>
            <TabsTrigger data-testid="tab-minute" value="minute">
              {{ t('tools.cron-generator.tabMinute', 'Minute') }}
            </TabsTrigger>
            <TabsTrigger data-testid="tab-hour" value="hour">
              {{ t('tools.cron-generator.tabHour', 'Hour') }}
            </TabsTrigger>
            <TabsTrigger data-testid="tab-day" value="day">
              {{ t('tools.cron-generator.tabDay', 'Day') }}
            </TabsTrigger>
            <TabsTrigger data-testid="tab-month" value="month">
              {{ t('tools.cron-generator.tabMonth', 'Month') }}
            </TabsTrigger>
            <TabsTrigger data-testid="tab-week" value="week">
              {{ t('tools.cron-generator.tabWeek', 'Week') }}
            </TabsTrigger>
          </TabsList>

          <!-- Field Tab Content Generator -->
          <template
            v-for="fieldType in [CronFieldType.Second, CronFieldType.Minute, CronFieldType.Hour, CronFieldType.Day, CronFieldType.Month, CronFieldType.Week]"
            :key="fieldType"
          >
            <TabsContent :value="fieldType" class="space-y-4 mt-4">
              <RadioGroup
                :model-value="getFieldConfig(fieldType).mode"
                @update:model-value="(value: string) => updateFieldConfig(fieldType, { ...getFieldConfig(fieldType), mode: value as CronFieldMode })"
              >
                <!-- Every Mode -->
                <div :data-testid="`${fieldType}-mode-every`" class="flex items-center space-x-2 rounded-lg border p-3">
                  <RadioGroupItem :id="`${fieldType}-every`" value="every" />
                  <Label :for="`${fieldType}-every`" class="flex-1 cursor-pointer">
                    {{ t('tools.cron-generator.modeEvery', 'Every') }}
                    <span class="text-xs text-muted-foreground ml-1">
                      ({{ t('tools.cron-generator.modeEveryDesc', 'Every time unit') }})
                    </span>
                  </Label>
                </div>

                <!-- Range Mode -->
                <div :data-testid="`${fieldType}-mode-range`" class="rounded-lg border p-3 space-y-3">
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem :id="`${fieldType}-range`" value="range" />
                    <Label :for="`${fieldType}-range`" class="flex-1 cursor-pointer">
                      {{ t('tools.cron-generator.modeRange', 'Range') }}
                    </Label>
                  </div>
                  <div class="flex items-center gap-2 pl-6">
                    <Label class="text-sm">{{ t('tools.cron-generator.from', 'From') }}</Label>
                    <Input
                      :data-testid="`${fieldType}-range-start`"
                      :max="getFieldRange(fieldType).max"
                      :min="getFieldRange(fieldType).min"
                      :model-value="getFieldConfig(fieldType).rangeStart ?? getFieldRange(fieldType).min"
                      class="w-20"
                      type="number"
                      @update:model-value="(v) => updateFieldConfig(fieldType, { ...getFieldConfig(fieldType), rangeStart: Number(v) })"
                    />
                    <Label class="text-sm">{{ t('tools.cron-generator.to', 'To') }}</Label>
                    <Input
                      :data-testid="`${fieldType}-range-end`"
                      :max="getFieldRange(fieldType).max"
                      :min="getFieldRange(fieldType).min"
                      :model-value="getFieldConfig(fieldType).rangeEnd ?? getFieldRange(fieldType).max"
                      class="w-20"
                      type="number"
                      @update:model-value="(v) => updateFieldConfig(fieldType, { ...getFieldConfig(fieldType), rangeEnd: Number(v) })"
                    />
                  </div>
                </div>

                <!-- Interval Mode -->
                <div :data-testid="`${fieldType}-mode-interval`" class="rounded-lg border p-3 space-y-3">
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem :id="`${fieldType}-interval`" value="interval" />
                    <Label :for="`${fieldType}-interval`" class="flex-1 cursor-pointer">
                      {{ t('tools.cron-generator.modeInterval', 'Interval') }}
                    </Label>
                  </div>
                  <div class="flex items-center gap-2 pl-6">
                    <Label class="text-sm">{{ t('tools.cron-generator.startingAt', 'Starting at') }}</Label>
                    <Input
                      :data-testid="`${fieldType}-interval-start`"
                      :max="getFieldRange(fieldType).max"
                      :min="getFieldRange(fieldType).min"
                      :model-value="getFieldConfig(fieldType).intervalStart ?? getFieldRange(fieldType).min"
                      class="w-20"
                      type="number"
                      @update:model-value="(v) => updateFieldConfig(fieldType, { ...getFieldConfig(fieldType), intervalStart: Number(v) })"
                    />
                    <Label class="text-sm">{{ t('tools.cron-generator.every', 'Every') }}</Label>
                    <Input
                      :data-testid="`${fieldType}-interval-step`"
                      :min="1"
                      :model-value="getFieldConfig(fieldType).intervalStep ?? 1"
                      class="w-20"
                      type="number"
                      @update:model-value="(v) => updateFieldConfig(fieldType, { ...getFieldConfig(fieldType), intervalStep: Number(v) })"
                    />
                  </div>
                </div>

                <!-- Specific Mode -->
                <div :data-testid="`${fieldType}-mode-specific`" class="rounded-lg border p-3 space-y-3">
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem :id="`${fieldType}-specific`" value="specific" />
                    <Label :for="`${fieldType}-specific`" class="flex-1 cursor-pointer">
                      {{ t('tools.cron-generator.modeSpecific', 'Specific') }}
                    </Label>
                  </div>
                  <div class="sm:pl-6">
                    <div
                      :class="[
                        'grid gap-2.5',
                        fieldType === CronFieldType.Month || fieldType === CronFieldType.Week
                          ? 'grid-cols-3 sm:grid-cols-4'
                          : 'grid-cols-6 sm:grid-cols-7 md:grid-cols-10',
                      ]"
                    >
                      <div
                        v-for="value in getFieldValueOptions(fieldType)"
                        :key="value"
                        class="flex items-center gap-2 sm:gap-2.5"
                      >
                        <Checkbox
                          :id="`${fieldType}-${value}`"
                          :data-testid="`${fieldType}-specific-${value}`"
                          :model-value="(getFieldConfig(fieldType).specificValues ?? []).includes(value)"
                          @update:model-value="(checked) => {
                            const current = getFieldConfig(fieldType).specificValues ?? []
                            const updated = checked
                              ? [...current, value]
                              : current.filter(v => v !== value)
                            updateFieldConfig(fieldType, { ...getFieldConfig(fieldType), specificValues: updated })
                          }"
                        />
                        <Label
                          :for="`${fieldType}-${value}`"
                          class="text-sm cursor-pointer"
                        >
                          {{ getFieldValueLabel(fieldType, value) }}
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </TabsContent>
          </template>
        </Tabs>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="flex items-center gap-2 text-base">
          <Info class="h-4 w-4 text-primary" />
          {{ t('tools.cron-generator.helpersTitle', 'Common symbols') }}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="{ symbol, meaning, example, equivalent } in helpers"
            :key="symbol"
            class="rounded-lg border bg-muted/20 p-4 space-y-2"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold">{{ t('tools.cron-generator.symbol') }}</span>
              <span class="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                {{ symbol || '—' }}
              </span>
            </div>
            <div class="text-sm">
              <span class="font-semibold">{{ t('tools.cron-generator.meaning') }}: </span>{{ meaning }}
            </div>
            <div class="text-sm">
              <span class="font-semibold">{{ t('tools.cron-generator.example') }}: </span>
              <code class="rounded bg-muted px-1 py-0.5 text-xs font-mono">{{ example || '—' }}</code>
            </div>
            <div class="text-sm">
              <span class="font-semibold">{{ t('tools.cron-generator.equivalent') }}: </span>
              <code class="rounded bg-muted px-1 py-0.5 text-xs font-mono">{{ equivalent || '—' }}</code>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
