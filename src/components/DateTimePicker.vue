<script setup lang="ts">
import { computed } from 'vue'
import { useVModel } from '@vueuse/core'
import { CalendarIcon, Clock } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useI18n } from 'vue-i18n'
import type { DateValue } from '@internationalized/date'
import { CalendarDate } from '@internationalized/date'

// Props and emits
const props = withDefaults(
  defineProps<{
    modelValue?: Date
    placeholder?: string
  }>(),
  {
    modelValue: () => new Date(),
    placeholder: 'Pick a date and time',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: Date]
}>()

const { t } = useI18n()

// Use vueuse's useVModel
const date = useVModel(props, 'modelValue', emit, {
  passive: true,
  defaultValue: new Date(),
})

// Convert Date to CalendarDate
function dateToCalendarDate(date: Date): CalendarDate {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return new CalendarDate(year, month, day)
}

// Convert CalendarDate to Date, preserving time
function calendarDateToDate(calendarDate: DateValue, currentDate: Date): Date {
  if (!calendarDate || typeof calendarDate !== 'object' || !('year' in calendarDate)) {
    return currentDate
  }
  
  const newDate = new Date(
    calendarDate.year,
    calendarDate.month - 1,
    calendarDate.day,
    currentDate.getHours(),
    currentDate.getMinutes(),
    currentDate.getSeconds(),
    currentDate.getMilliseconds(),
  )
  return newDate
}

// Computed date value for Calendar component
const dateValue = computed<DateValue>({
  get: () => dateToCalendarDate(date.value),
  set: (value: DateValue) => {
    if (value) {
      date.value = calendarDateToDate(value, date.value)
    }
  },
})

// Computed time value
const timeValue = computed({
  get: () => {
    const hours = date.value.getHours().toString().padStart(2, '0')
    const minutes = date.value.getMinutes().toString().padStart(2, '0')
    const seconds = date.value.getSeconds().toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  },
  set: (value: string) => {
    const parts = value.split(':')
    const hours = Number(parts[0]) || 0
    const minutes = Number(parts[1]) || 0
    const seconds = Number(parts[2]) || 0
    const newDate = new Date(date.value)
    newDate.setHours(hours, minutes, seconds, 0)
    date.value = newDate
  },
})

// Format display text
const displayText = computed(() => {
  try {
    return format(date.value, 'yyyy/MM/dd HH:mm:ss')
  }
  catch {
    return props.placeholder
  }
})

// Set to current time
function setCurrentTime() {
  date.value = new Date()
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :class="cn(
          'w-full justify-start text-left font-normal',
          !modelValue && 'text-muted-foreground',
        )"
      >
        <CalendarIcon class="mr-2 h-4 w-4" />
        {{ displayText }}
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0">
      <Calendar
        v-model="dateValue"
        :initial-focus="true"
      />
      <div class="border-t p-3 space-y-2">
        <Input
          v-model="timeValue"
          type="time"
          step="1"
          class="w-full"
        />
        <Button
          variant="outline"
          size="sm"
          class="w-full"
          @click="setCurrentTime"
        >
          <Clock class="mr-2 h-4 w-4" />
          {{ t('common.setCurrentTime', 'Set Current Time') }}
        </Button>
      </div>
    </PopoverContent>
  </Popover>
</template>

