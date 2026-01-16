/**
 * Cron Generator Service
 *
 * Handles cron expression generation, parsing, and bidirectional conversion
 * between visual form configuration and cron expression string.
 */

/**
 * Field type for cron expression (with optional seconds and year support)
 */
export enum CronFieldType {
  Second = 'second',
  Minute = 'minute',
  Hour = 'hour',
  Day = 'day',
  Month = 'month',
  Week = 'week',
  Year = 'year',
}

/**
 * Mode for each cron field
 * - every: Every time unit (asterisk)
 * - range: Range of values (start-end)
 * - interval: Interval values (start/step or asterisk/step)
 * - specific: Specific values (comma-separated list)
 */
export type CronFieldMode = 'every' | 'range' | 'interval' | 'specific'

/**
 * Configuration for a single cron field
 */
export interface CronFieldConfig {
  mode: CronFieldMode
  // For range mode: start and end values
  rangeStart?: number
  rangeEnd?: number
  // For interval mode: start value and step
  intervalStart?: number
  intervalStep?: number
  // For specific mode: array of selected values
  specificValues?: number[]
}

/**
 * Complete cron configuration for all fields
 */
export interface CronConfig {
  second: CronFieldConfig
  minute: CronFieldConfig
  hour: CronFieldConfig
  day: CronFieldConfig
  month: CronFieldConfig
  week: CronFieldConfig
  year?: CronFieldConfig // Optional year field
}

/**
 * Range limits for each field type
 */
export const FIELD_RANGES: Record<CronFieldType, { min: number, max: number, default: number }> = {
  second: { min: 0, max: 59, default: 0 },
  minute: { min: 0, max: 59, default: 0 },
  hour: { min: 0, max: 23, default: 0 },
  day: { min: 1, max: 31, default: 1 },
  month: { min: 1, max: 12, default: 1 },
  week: { min: 0, max: 6, default: 0 }, // 0 = Sunday, 6 = Saturday
  year: { min: 1970, max: 2099, default: new Date().getFullYear() },
}

/**
 * Default configuration for all fields (every mode)
 */
export function getDefaultCronConfig(): CronConfig {
  return {
    second: { mode: 'every' },
    minute: { mode: 'every' },
    hour: { mode: 'every' },
    day: { mode: 'every' },
    month: { mode: 'every' },
    week: { mode: 'every' },
  }
}

/**
 * Generate cron expression string from field configuration
 *
 * @param config - Field configuration
 * @param fieldType - Type of field for validation
 * @returns Cron expression string for the field
 */
export function generateFieldExpression(config: CronFieldConfig, fieldType: CronFieldType): string {
  const range = FIELD_RANGES[fieldType]

  switch (config.mode) {
    case 'every':
      return '*'

    case 'range': {
      const start = config.rangeStart ?? range.min
      const end = config.rangeEnd ?? range.max
      return `${start}-${end}`
    }

    case 'interval': {
      const start = config.intervalStart ?? range.min
      const step = config.intervalStep ?? 1

      // If start is at the minimum, use */step format
      if (start === range.min) {
        return `*/${step}`
      }
      return `${start}/${step}`
    }

    case 'specific': {
      const values = config.specificValues ?? [range.default]
      return values.sort((a, b) => a - b).join(',')
    }

    default:
      return '*'
  }
}

/**
 * Generate complete cron expression from configuration
 *
 * @param config - Complete cron configuration
 * @param includeYear - Whether to include year field (default: false)
 * @returns Complete cron expression string
 *
 * @example
 * ```typescript
 * const config = {
 *   second: { mode: 'every' },
 *   minute: { mode: 'interval', intervalStart: 0, intervalStep: 5 },
 *   hour: { mode: 'every' },
 *   day: { mode: 'every' },
 *   month: { mode: 'every' },
 *   week: { mode: 'every' },
 * }
 * generateCronExpression(config) // Returns: "* *\/5 * * * *"
 * ```
 */
export function generateCronExpression(config: CronConfig, includeYear = false): string {
  const fields: string[] = [
    generateFieldExpression(config.second, CronFieldType.Second),
    generateFieldExpression(config.minute, CronFieldType.Minute),
    generateFieldExpression(config.hour, CronFieldType.Hour),
    generateFieldExpression(config.day, CronFieldType.Day),
    generateFieldExpression(config.month, CronFieldType.Month),
    generateFieldExpression(config.week, CronFieldType.Week),
  ]

  if (includeYear && config.year) {
    fields.push(generateFieldExpression(config.year, CronFieldType.Year))
  }

  return fields.join(' ')
}

/**
 * Parse a single cron field expression to configuration
 *
 * @param expression - Field expression string (e.g., "*", "0-5", "*\/10", "1,2,3")
 * @param fieldType - Type of field for validation
 * @returns Parsed field configuration
 */
export function parseFieldExpression(expression: string, fieldType: CronFieldType): CronFieldConfig {
  const range = FIELD_RANGES[fieldType]
  const trimmed = expression.trim()

  // Every mode: *
  if (trimmed === '*') {
    return { mode: 'every' }
  }

  // Interval mode: */N or M/N
  if (trimmed.includes('/')) {
    const [start, step] = trimmed.split('/')
    const intervalStart = start === '*' ? range.min : Number.parseInt(start || '0', 10)
    const intervalStep = Number.parseInt(step || '1', 10)

    return {
      mode: 'interval',
      intervalStart,
      intervalStep,
    }
  }

  // Range mode: M-N
  if (trimmed.includes('-') && !trimmed.includes(',')) {
    const [start, end] = trimmed.split('-').map(v => Number.parseInt(v, 10))
    return {
      mode: 'range',
      rangeStart: start,
      rangeEnd: end,
    }
  }

  // Specific mode: M,N,O or single value M
  if (trimmed.includes(',') || /^\d+$/.test(trimmed)) {
    const values = trimmed.split(',').map(v => Number.parseInt(v.trim(), 10))
    return {
      mode: 'specific',
      specificValues: values,
    }
  }

  // Fallback to every mode if parsing fails
  return { mode: 'every' }
}

/**
 * Parse complete cron expression to configuration
 *
 * Supports both 6-field (with seconds) and 7-field (with seconds and year) formats.
 * Standard 5-field format is NOT supported - this tool focuses on extended formats.
 *
 * @param expression - Complete cron expression string
 * @returns Parsed cron configuration or null if invalid
 *
 * @example
 * ```typescript
 * parseCronExpression("* *\/5 * * * *") // Returns config with 5-minute interval
 * parseCronExpression("0 0 12 * * ?")   // Returns config for daily at noon
 * ```
 */
export function parseCronExpression(expression: string): CronConfig | null {
  const fields = expression.trim().split(/\s+/)

  // Support 6-field (second to week) or 7-field (second to year) formats
  if (fields.length !== 6 && fields.length !== 7) {
    return null
  }

  try {
    const config: CronConfig = {
      second: parseFieldExpression(fields[0]!, CronFieldType.Second),
      minute: parseFieldExpression(fields[1]!, CronFieldType.Minute),
      hour: parseFieldExpression(fields[2]!, CronFieldType.Hour),
      day: parseFieldExpression(fields[3]!, CronFieldType.Day),
      month: parseFieldExpression(fields[4]!, CronFieldType.Month),
      week: parseFieldExpression(fields[5]!, CronFieldType.Week),
    }

    // Parse year field if present
    if (fields.length === 7) {
      config.year = parseFieldExpression(fields[6]!, CronFieldType.Year)
    }

    return config
  }
  catch {
    return null
  }
}

/**
 * Validate field configuration
 *
 * @param config - Field configuration to validate
 * @param fieldType - Type of field
 * @returns Validation result with error key for i18n
 */
export function validateFieldConfig(
  config: CronFieldConfig,
  fieldType: CronFieldType,
): { valid: boolean, errorKey?: string } {
  const range = FIELD_RANGES[fieldType]

  switch (config.mode) {
    case 'range': {
      const start = config.rangeStart ?? range.min
      const end = config.rangeEnd ?? range.max

      if (start < range.min || start > range.max) {
        return { valid: false, errorKey: 'errorRangeStartOutOfBounds' }
      }

      if (end < range.min || end > range.max) {
        return { valid: false, errorKey: 'errorRangeEndOutOfBounds' }
      }

      if (start >= end) {
        return { valid: false, errorKey: 'errorRangeStartGreaterThanEnd' }
      }

      break
    }

    case 'interval': {
      const start = config.intervalStart ?? range.min
      const step = config.intervalStep ?? 1

      if (start < range.min || start > range.max) {
        return { valid: false, errorKey: 'errorIntervalStartOutOfBounds' }
      }

      if (step < 1) {
        return { valid: false, errorKey: 'errorIntervalStepTooSmall' }
      }

      break
    }

    case 'specific': {
      const values = config.specificValues ?? []

      if (values.length === 0) {
        return { valid: false, errorKey: 'errorNoSpecificValues' }
      }

      for (const value of values) {
        if (value < range.min || value > range.max) {
          return { valid: false, errorKey: 'errorSpecificValueOutOfBounds' }
        }
      }

      break
    }
  }

  return { valid: true }
}

/**
 * Validate complete cron configuration
 *
 * @param config - Complete cron configuration
 * @returns Validation result with error key and field name for i18n
 */
export function validateCronConfig(
  config: CronConfig,
): { valid: boolean, errorKey?: string, field?: CronFieldType } {
  const fieldsToValidate: Array<{ type: CronFieldType, config: CronFieldConfig }> = [
    { type: CronFieldType.Second, config: config.second },
    { type: CronFieldType.Minute, config: config.minute },
    { type: CronFieldType.Hour, config: config.hour },
    { type: CronFieldType.Day, config: config.day },
    { type: CronFieldType.Month, config: config.month },
    { type: CronFieldType.Week, config: config.week },
  ]

  if (config.year) {
    fieldsToValidate.push({ type: CronFieldType.Year, config: config.year })
  }

  for (const { type, config: fieldConfig } of fieldsToValidate) {
    const result = validateFieldConfig(fieldConfig, type)
    if (!result.valid) {
      return { valid: false, errorKey: result.errorKey, field: type }
    }
  }

  return { valid: true }
}

/**
 * Generate array of values for a field type (for UI rendering)
 *
 * @param fieldType - Type of field
 * @returns Array of valid values for the field
 */
export function getFieldValues(fieldType: CronFieldType): number[] {
  const range = FIELD_RANGES[fieldType]
  const values: number[] = []

  for (let i = range.min; i <= range.max; i++) {
    values.push(i)
  }

  return values
}
