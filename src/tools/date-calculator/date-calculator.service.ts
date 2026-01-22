/**
 * Date Calculator Service
 * 
 * Provides business logic for date calculations including:
 * - Date arithmetic (add/subtract time units)
 * - Date difference calculations
 * - Time unit conversions
 */

import { add, differenceInDays, differenceInHours, differenceInMinutes, differenceInMonths, differenceInSeconds, differenceInWeeks, differenceInYears, isValid, parseISO, sub } from 'date-fns'

export type TimeUnit = 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds'

export type OperationType = 'add' | 'subtract'

export interface DateArithmeticInput {
  baseDate: Date
  amount: number
  unit: TimeUnit
  operation: OperationType
}

export interface DateDifferenceInput {
  startDate: Date
  endDate: Date
}

export interface DateDifferenceResult {
  years: number
  months: number
  weeks: number
  days: number
  hours: number
  minutes: number
  seconds: number
  totalDays: number
  totalHours: number
  totalMinutes: number
  totalSeconds: number
}

/**
 * Parse a date string or Date object into a valid Date
 * 
 * @param dateInput - Date string (ISO format) or Date object
 * @returns Parsed Date object or undefined if invalid
 */
export function parseDate(dateInput: string | Date): Date | undefined {
  if (!dateInput) {
    return undefined
  }

  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput
    return isValid(date) ? date : undefined
  }
  catch {
    return undefined
  }
}

/**
 * Validate if a date input is valid
 * 
 * @param dateInput - Date string or Date object
 * @returns True if valid, false otherwise
 */
export function isValidDate(dateInput: string | Date): boolean {
  const parsed = parseDate(dateInput)
  return parsed !== undefined
}

/**
 * Perform date arithmetic (add or subtract time)
 * 
 * @param input - Date arithmetic parameters
 * @returns Calculated date or undefined if invalid
 * 
 * @example
 * calculateDateArithmetic({
 *   baseDate: new Date('2026-01-01'),
 *   amount: 45,
 *   unit: 'days',
 *   operation: 'add'
 * }) // Returns: 2026-02-15
 */
export function calculateDateArithmetic(input: DateArithmeticInput): Date | undefined {
  const { baseDate, amount, unit, operation } = input

  if (!isValid(baseDate) || amount < 0) {
    return undefined
  }

  try {
    const duration = { [unit]: amount }

    if (operation === 'add') {
      return add(baseDate, duration)
    }
    else {
      return sub(baseDate, duration)
    }
  }
  catch {
    return undefined
  }
}

/**
 * Calculate the difference between two dates in all time units
 * 
 * @param input - Start and end dates
 * @returns Object containing differences in various units
 * 
 * @example
 * calculateDateDifference({
 *   startDate: new Date('2026-01-01'),
 *   endDate: new Date('2026-02-15')
 * })
 * // Returns: { days: 45, hours: 1080, ... }
 */
export function calculateDateDifference(input: DateDifferenceInput): DateDifferenceResult | undefined {
  const { startDate, endDate } = input

  if (!isValid(startDate) || !isValid(endDate)) {
    return undefined
  }

  try {
    return {
      years: differenceInYears(endDate, startDate),
      months: differenceInMonths(endDate, startDate),
      weeks: differenceInWeeks(endDate, startDate),
      days: differenceInDays(endDate, startDate),
      hours: differenceInHours(endDate, startDate),
      minutes: differenceInMinutes(endDate, startDate),
      seconds: differenceInSeconds(endDate, startDate),
      totalDays: differenceInDays(endDate, startDate),
      totalHours: differenceInHours(endDate, startDate),
      totalMinutes: differenceInMinutes(endDate, startDate),
      totalSeconds: differenceInSeconds(endDate, startDate),
    }
  }
  catch {
    return undefined
  }
}

/**
 * Convert time between different units
 * 
 * @param amount - Amount to convert
 * @param fromUnit - Source unit
 * @param toUnit - Target unit
 * @returns Converted amount
 * 
 * @example
 * convertTimeUnits(2, 'days', 'hours') // Returns: 48
 */
export function convertTimeUnits(amount: number, fromUnit: TimeUnit, toUnit: TimeUnit): number {
  if (amount < 0) {
    return 0
  }

  // Convert to seconds first (base unit)
  const secondsMap: Record<TimeUnit, number> = {
    seconds: 1,
    minutes: 60,
    hours: 3600,
    days: 86400,
    weeks: 604800,
    months: 2592000, // Approximate: 30 days
    years: 31536000, // Approximate: 365 days
  }

  const inSeconds = amount * secondsMap[fromUnit]
  return inSeconds / secondsMap[toUnit]
}

/**
 * Format a date difference result into a human-readable string
 * 
 * @param result - Date difference result
 * @param t - Translation function for i18n support
 * @returns Formatted string
 * 
 * @example
 * formatDateDifference({ years: 1, months: 2, days: 15, ... }, t)
 * // Returns: "1 year, 2 months, 15 days" (or translated equivalent)
 */
export function formatDateDifference(
  result: DateDifferenceResult,
  t: (key: string, fallback: string, params?: Record<string, number>) => string,
): string {
  const parts: string[] = []
  const isNegative = result.seconds < 0

  // Use absolute values for formatting
  const absYears = Math.abs(result.years)
  const absMonths = Math.abs(result.months)
  const absDays = Math.abs(result.days)
  const absHours = Math.abs(result.hours)
  const absMinutes = Math.abs(result.minutes)
  const absSeconds = Math.abs(result.seconds)

  if (absYears > 0) {
    const yearText = absYears === 1
      ? t('tools.date-calculator.year', 'year')
      : t('tools.date-calculator.years', 'years')
    parts.push(`${absYears} ${yearText}`)
  }

  const remainingMonths = absMonths % 12
  if (remainingMonths > 0) {
    const monthText = remainingMonths === 1
      ? t('tools.date-calculator.month', 'month')
      : t('tools.date-calculator.months', 'months')
    parts.push(`${remainingMonths} ${monthText}`)
  }

  const remainingDays = absDays % 30
  if (remainingDays > 0) {
    const dayText = remainingDays === 1
      ? t('tools.date-calculator.day', 'day')
      : t('tools.date-calculator.days', 'days')
    parts.push(`${remainingDays} ${dayText}`)
  }

  const remainingHours = absHours % 24
  if (remainingHours > 0) {
    const hourText = remainingHours === 1
      ? t('tools.date-calculator.hour', 'hour')
      : t('tools.date-calculator.hours', 'hours')
    parts.push(`${remainingHours} ${hourText}`)
  }

  const remainingMinutes = absMinutes % 60
  if (remainingMinutes > 0) {
    const minuteText = remainingMinutes === 1
      ? t('tools.date-calculator.minute', 'minute')
      : t('tools.date-calculator.minutes', 'minutes')
    parts.push(`${remainingMinutes} ${minuteText}`)
  }

  const remainingSeconds = absSeconds % 60
  if (remainingSeconds > 0) {
    const secondText = remainingSeconds === 1
      ? t('tools.date-calculator.second', 'second')
      : t('tools.date-calculator.seconds', 'seconds')
    parts.push(`${remainingSeconds} ${secondText}`)
  }

  const formattedDiff = parts.length > 0 ? parts.join(', ') : `0 ${t('tools.date-calculator.seconds', 'seconds')}`
  
  // Add negative sign if the difference is negative
  return isNegative ? `-${formattedDiff}` : formattedDiff
}

