<script setup lang="ts">
import type { DateValue } from 'reka-ui'
import { fromDate as fromDateI18n, getLocalTimeZone } from '@internationalized/date'
import { addMilliseconds, formatRelative } from 'date-fns'
import type { Locale } from 'date-fns'
import { de, enGB, es, fr, nb, pt, ru, uk, vi, zhCN } from 'date-fns/locale'
import { Calendar as CalendarIcon, Clock, Info, X } from 'lucide-vue-next'
import { toDate } from 'reka-ui/date'

import InputCopyable from '@/components/InputCopyable.vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useToolI18n } from '@/composable/useToolI18n'
import { formatMsDuration } from './eta-calculator.service'

const unitCount = ref(3 * 62);
const unitPerTimeSpan = ref(3);
const timeSpan = ref(5);
const timeSpanUnitMultiplier = ref(60000);
const startedAt = ref(Date.now());

const { t, locale } = useToolI18n();

const localeMap: Record<string, Locale> = {
  en: enGB,
  de,
  es,
  fr,
  no: nb,
  pt,
  ru,
  uk,
  zh: zhCN,
  vi,
};
const currentDateFnsLocale = computed(() => localeMap[locale.value] ?? enGB);

// Map application locale to Calendar locale (for @internationalized/date)
const calendarLocale = computed(() => {
  const localeMap: Record<string, string> = {
    en: 'en-US',
    zh: 'zh-CN',
    de: 'de-DE',
    es: 'es-ES',
    fr: 'fr-FR',
    no: 'nb-NO',
    pt: 'pt-PT',
    ru: 'ru-RU',
    uk: 'uk-UA',
    vi: 'vi-VN',
  };
  return localeMap[locale.value] || 'en-US';
})

// Date picker state
const calendarOpen = ref(false);
const selectedDate = computed<DateValue>({
  get: () => {
    const date = new Date(startedAt.value);
    return fromDateI18n(date, getLocalTimeZone());
  },
  set: (value: DateValue) => {
    if (value) {
      const jsDate = toDate(value, getLocalTimeZone());
      const currentDate = new Date(startedAt.value);
      // Preserve time when changing date
      jsDate.setHours(currentDate.getHours());
      jsDate.setMinutes(currentDate.getMinutes());
      jsDate.setSeconds(currentDate.getSeconds());
      jsDate.setMilliseconds(currentDate.getMilliseconds());
      startedAt.value = jsDate.getTime();
    }
  },
});

// Time picker state
const selectedHour = computed({
  get: () => {
    const date = new Date(startedAt.value);
    return date.getHours();
  },
  set: (value: number) => {
    const date = new Date(startedAt.value);
    date.setHours(value);
    startedAt.value = date.getTime();
  },
});

const selectedMinute = computed({
  get: () => {
    const date = new Date(startedAt.value);
    return date.getMinutes();
  },
  set: (value: number) => {
    const date = new Date(startedAt.value);
    date.setMinutes(value);
    startedAt.value = date.getTime();
  },
});

// Format date for display
const formattedDate = computed(() => {
  const date = new Date(startedAt.value);
  const localeMap: Record<string, string> = {
    en: 'en-US',
    zh: 'zh-CN',
    de: 'de-DE',
    es: 'es-ES',
    fr: 'fr-FR',
    no: 'nb-NO',
    pt: 'pt-PT',
    ru: 'ru-RU',
    uk: 'uk-UA',
    vi: 'vi-VN',
  };
  return date.toLocaleString(localeMap[locale.value] || 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
})

// Generate hour and minute options
const hourOptions = Array.from({ length: 24 }, (_, i) => ({ value: i, label: String(i).padStart(2, '0') }));
const minuteOptions = Array.from({ length: 60 }, (_, i) => ({ value: i, label: String(i).padStart(2, '0') }));

const timeUnitOptions = computed(() => [
  { label: t('tools.eta-calculator.milliseconds', 'milliseconds'), value: 1 },
  { label: t('tools.eta-calculator.seconds', 'seconds'), value: 1000 },
  { label: t('tools.eta-calculator.minutes', 'minutes'), value: 1000 * 60 },
  { label: t('tools.eta-calculator.hours', 'hours'), value: 1000 * 60 * 60 },
  { label: t('tools.eta-calculator.days', 'days'), value: 1000 * 60 * 60 * 24 },
]);

const selectedTimeUnitLabel = computed(() => {
  const option = timeUnitOptions.value.find(opt => opt.value === timeSpanUnitMultiplier.value);
  return option?.label || '';
})

const durationMs = computed(() => {
  const timeSpanMs = timeSpan.value * timeSpanUnitMultiplier.value;

  return unitCount.value / (unitPerTimeSpan.value / timeSpanMs);
})
const endAt = computed(() =>
  formatRelative(
    addMilliseconds(startedAt.value, durationMs.value),
    Date.now(),
    { locale: currentDateFnsLocale.value },
  ),
);

const hasResults = computed(() => unitCount.value > 0 && unitPerTimeSpan.value > 0 && timeSpan.value > 0);

function clearInputs() {
  unitCount.value = 3 * 62;
  unitPerTimeSpan.value = 3;
  timeSpan.value = 5;
  timeSpanUnitMultiplier.value = 60000;
  startedAt.value = Date.now();
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <Alert class="border-primary/40 bg-primary/10">
      <Info class="h-4 w-4 text-primary" />
      <AlertTitle class="text-sm">
        {{ t('tools.eta-calculator.exampleTitle', 'Example') }}
      </AlertTitle>
      <AlertDescription class="text-xs">
        {{ t('tools.eta-calculator.example', 'With a concrete example, if you wash 5 plates in 3 minutes and you have 500 plates to wash, it will take you 5 hours to wash them all.') }}
      </AlertDescription>
    </Alert>

    <Card class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Clock class="h-5 w-5 text-primary" />
            {{ t('tools.eta-calculator.cardInputTitle', 'Input parameters') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.eta-calculator.cardInputDescription',
                'Enter the amount of elements to consume, start time, and consumption rate to calculate the estimated time of arrival.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup class="space-y-4 gap-2">
          <div class="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel>
                {{ t('tools.eta-calculator.amountOfElement', 'Amount of element to consume') }}
              </FieldLabel>
              <FieldContent>
                <Input
                  v-model.number="unitCount"
                  type="number"
                  :min="1"
                  :placeholder="t('tools.eta-calculator.amountOfElement', 'Amount of element to consume')"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                {{ t('tools.eta-calculator.consumptionStartedAt', 'The consumption started at') }}
              </FieldLabel>
              <FieldContent>
                <Popover v-model:open="calendarOpen">
                  <PopoverTrigger as-child>
                    <Button
                      variant="outline"
                      class="w-full justify-start text-left font-normal"
                      :class="!startedAt && 'text-muted-foreground'"
                    >
                      <CalendarIcon class="mr-2 h-4 w-4" />
                      {{ formattedDate }}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-auto p-0" align="start">
                    <div class="p-3 space-y-3">
                      <Calendar
                        v-model="selectedDate"
                        layout="month-and-year"
                        :locale="calendarLocale"
                      />
                      <Separator />
                      <div class="flex items-center gap-2">
                        <div class="flex items-center gap-2 flex-1">
                          <span class="text-sm text-muted-foreground min-w-[60px]">
                            {{ t('tools.eta-calculator.hour', 'Hour') }}
                          </span>
                          <Select
                            :model-value="selectedHour"
                            @update:model-value="value => (selectedHour = value as number)"
                          >
                            <SelectTrigger class="flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem
                                  v-for="opt in hourOptions"
                                  :key="opt.value"
                                  :value="opt.value"
                                >
                                  {{ opt.label }}
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        <div class="flex items-center gap-2 flex-1">
                          <span class="text-sm text-muted-foreground min-w-[60px]">
                            {{ t('tools.eta-calculator.minute', 'Minute') }}
                          </span>
                          <Select
                            :model-value="selectedMinute"
                            @update:model-value="value => (selectedMinute = value as number)"
                          >
                            <SelectTrigger class="flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem
                                  v-for="opt in minuteOptions"
                                  :key="opt.value"
                                  :value="opt.value"
                                >
                                  {{ opt.label }}
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </FieldContent>
            </Field>
          </div>

          <Separator />

          <Field>
            <FieldLabel>
              {{ t('tools.eta-calculator.amountOfUnitConsumed', 'Amount of unit consumed by time span') }}
            </FieldLabel>
            <FieldContent>
              <div class="flex flex-col gap-3 md:flex-row md:items-center">
                <Input
                  v-model.number="unitPerTimeSpan"
                  type="number"
                  :min="1"
                  class="flex-1"
                  :placeholder="t('tools.eta-calculator.amountOfUnitConsumed', 'Amount of unit consumed by time span')"
                />
                <span class="text-sm text-muted-foreground whitespace-nowrap">
                  {{ t('tools.eta-calculator.in', 'in') }}
                </span>
                <Input
                  v-model.number="timeSpan"
                  type="number"
                  :min="1"
                  class="w-32"
                  :placeholder="t('tools.eta-calculator.timeSpan', 'Time span')"
                />
                <Select
                  :model-value="timeSpanUnitMultiplier"
                  @update:model-value="value => (timeSpanUnitMultiplier = value as number)"
                >
                  <SelectTrigger class="w-40">
                    <SelectValue>
                      {{ selectedTimeUnitLabel }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                        v-for="opt in timeUnitOptions"
                        :key="opt.value"
                        :value="opt.value"
                      >
                        {{ opt.label }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </FieldContent>
          </Field>

          <div class="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" @click="clearInputs">
              <X class="mr-2 h-4 w-4" />
              {{ t('common.clear', 'Clear') }}
            </Button>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card v-if="hasResults" class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Clock class="h-5 w-5 text-primary" />
            {{ t('tools.eta-calculator.cardResultsTitle', 'Calculation results') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.eta-calculator.cardResultsDescription',
                'Estimated time of arrival and completion time based on your input parameters.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <InputCopyable
          :value="formatMsDuration(durationMs, currentDateFnsLocale)"
          :label="t('tools.eta-calculator.totalDuration', 'Total duration')"
          :field-props="{ class: 'w-full' }"
          :label-props="{ class: 'w-40 text-right' }"
          readonly
        />

        <InputCopyable
          :value="endAt"
          :label="t('tools.eta-calculator.itWillEnd', 'It will end')"
          :field-props="{ class: 'w-full' }"
          :label-props="{ class: 'w-40 text-right' }"
          readonly
        />
      </CardContent>
    </Card>
  </div>
</template>
