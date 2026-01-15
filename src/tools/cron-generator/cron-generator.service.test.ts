import { describe, expect, it } from 'vitest'
import {
  FIELD_RANGES,
  generateCronExpression,
  generateFieldExpression,
  getDefaultCronConfig,
  getFieldValues,
  parseCronExpression,
  parseFieldExpression,
  validateCronConfig,
  validateFieldConfig,
} from './cron-generator.service'
import type { CronConfig, CronFieldConfig } from './cron-generator.service'

describe('cron-generator service', () => {
  describe('filed_range', () => {
    it('should have correct ranges for all field types', () => {
      expect(FIELD_RANGES.second).toEqual({ min: 0, max: 59, default: 0 })
      expect(FIELD_RANGES.minute).toEqual({ min: 0, max: 59, default: 0 })
      expect(FIELD_RANGES.hour).toEqual({ min: 0, max: 23, default: 0 })
      expect(FIELD_RANGES.day).toEqual({ min: 1, max: 31, default: 1 })
      expect(FIELD_RANGES.month).toEqual({ min: 1, max: 12, default: 1 })
      expect(FIELD_RANGES.week).toEqual({ min: 0, max: 6, default: 0 })
    })

    it('should have year range', () => {
      expect(FIELD_RANGES.year.min).toBe(1970)
      expect(FIELD_RANGES.year.max).toBe(2099)
      expect(FIELD_RANGES.year.default).toBeGreaterThanOrEqual(1970)
      expect(FIELD_RANGES.year.default).toBeLessThanOrEqual(2099)
    })
  })

  describe('getDefaultCronConfig', () => {
    it('should return default config with all fields in every mode', () => {
      const config = getDefaultCronConfig()

      expect(config.second).toEqual({ mode: 'every' })
      expect(config.minute).toEqual({ mode: 'every' })
      expect(config.hour).toEqual({ mode: 'every' })
      expect(config.day).toEqual({ mode: 'every' })
      expect(config.month).toEqual({ mode: 'every' })
      expect(config.week).toEqual({ mode: 'every' })
      expect(config.year).toBeUndefined()
    })
  })

  describe('generateFieldExpression', () => {
    it('should generate asterisk for every mode', () => {
      const config: CronFieldConfig = { mode: 'every' }
      expect(generateFieldExpression(config, 'second')).toBe('*')
      expect(generateFieldExpression(config, 'minute')).toBe('*')
      expect(generateFieldExpression(config, 'hour')).toBe('*')
    })

    it('should generate range expression', () => {
      const config: CronFieldConfig = {
        mode: 'range',
        rangeStart: 10,
        rangeEnd: 20,
      }
      expect(generateFieldExpression(config, 'second')).toBe('10-20')
    })

    it('should use default range values if not provided', () => {
      const config: CronFieldConfig = { mode: 'range' }
      expect(generateFieldExpression(config, 'second')).toBe('0-59')
      expect(generateFieldExpression(config, 'day')).toBe('1-31')
    })

    it('should generate interval expression with */step format', () => {
      const config: CronFieldConfig = {
        mode: 'interval',
        intervalStart: 0,
        intervalStep: 5,
      }
      expect(generateFieldExpression(config, 'second')).toBe('*/5')
    })

    it('should generate interval expression with start/step format', () => {
      const config: CronFieldConfig = {
        mode: 'interval',
        intervalStart: 10,
        intervalStep: 5,
      }
      expect(generateFieldExpression(config, 'second')).toBe('10/5')
    })

    it('should use default interval values if not provided', () => {
      const config: CronFieldConfig = { mode: 'interval' }
      expect(generateFieldExpression(config, 'second')).toBe('*/1')
    })

    it('should generate specific values expression', () => {
      const config: CronFieldConfig = {
        mode: 'specific',
        specificValues: [1, 5, 10, 15],
      }
      expect(generateFieldExpression(config, 'second')).toBe('1,5,10,15')
    })

    it('should sort specific values', () => {
      const config: CronFieldConfig = {
        mode: 'specific',
        specificValues: [15, 5, 10, 1],
      }
      expect(generateFieldExpression(config, 'second')).toBe('1,5,10,15')
    })

    it('should use default value if no specific values provided', () => {
      const config: CronFieldConfig = { mode: 'specific' }
      expect(generateFieldExpression(config, 'second')).toBe('0')
      expect(generateFieldExpression(config, 'day')).toBe('1')
    })
  })

  describe('generateCronExpression', () => {
    it('should generate expression for all every mode', () => {
      const config = getDefaultCronConfig()
      expect(generateCronExpression(config)).toBe('* * * * * *')
    })

    it('should generate expression with mixed modes', () => {
      const config: CronConfig = {
        second: { mode: 'specific', specificValues: [0] },
        minute: { mode: 'interval', intervalStart: 0, intervalStep: 5 },
        hour: { mode: 'every' },
        day: { mode: 'every' },
        month: { mode: 'every' },
        week: { mode: 'every' },
      }
      expect(generateCronExpression(config)).toBe('0 */5 * * * *')
    })

    it('should generate expression with range', () => {
      const config: CronConfig = {
        second: { mode: 'every' },
        minute: { mode: 'every' },
        hour: { mode: 'range', rangeStart: 9, rangeEnd: 17 },
        day: { mode: 'every' },
        month: { mode: 'every' },
        week: { mode: 'every' },
      }
      expect(generateCronExpression(config)).toBe('* * 9-17 * * *')
    })

    it('should include year field when requested', () => {
      const config: CronConfig = {
        second: { mode: 'every' },
        minute: { mode: 'every' },
        hour: { mode: 'every' },
        day: { mode: 'every' },
        month: { mode: 'every' },
        week: { mode: 'every' },
        year: { mode: 'specific', specificValues: [2024] },
      }
      expect(generateCronExpression(config, true)).toBe('* * * * * * 2024')
    })

    it('should not include year field by default', () => {
      const config: CronConfig = {
        second: { mode: 'every' },
        minute: { mode: 'every' },
        hour: { mode: 'every' },
        day: { mode: 'every' },
        month: { mode: 'every' },
        week: { mode: 'every' },
        year: { mode: 'specific', specificValues: [2024] },
      }
      expect(generateCronExpression(config)).toBe('* * * * * *')
    })
  })

  describe('parseFieldExpression', () => {
    it('should parse asterisk as every mode', () => {
      const result = parseFieldExpression('*', 'second')
      expect(result).toEqual({ mode: 'every' })
    })

    it('should parse interval with asterisk', () => {
      const result = parseFieldExpression('*/5', 'second')
      expect(result).toEqual({
        mode: 'interval',
        intervalStart: 0,
        intervalStep: 5,
      })
    })

    it('should parse interval with start value', () => {
      const result = parseFieldExpression('10/5', 'second')
      expect(result).toEqual({
        mode: 'interval',
        intervalStart: 10,
        intervalStep: 5,
      })
    })

    it('should parse range expression', () => {
      const result = parseFieldExpression('10-20', 'second')
      expect(result).toEqual({
        mode: 'range',
        rangeStart: 10,
        rangeEnd: 20,
      })
    })

    it('should parse specific values', () => {
      const result = parseFieldExpression('1,5,10,15', 'second')
      expect(result).toEqual({
        mode: 'specific',
        specificValues: [1, 5, 10, 15],
      })
    })

    it('should parse single value as specific', () => {
      const result = parseFieldExpression('5', 'second')
      expect(result).toEqual({
        mode: 'specific',
        specificValues: [5],
      })
    })

    it('should handle whitespace in expressions', () => {
      const result = parseFieldExpression(' 1, 5, 10 ', 'second')
      expect(result).toEqual({
        mode: 'specific',
        specificValues: [1, 5, 10],
      })
    })

    it('should fallback to every mode for invalid expressions', () => {
      const result = parseFieldExpression('invalid', 'second')
      expect(result).toEqual({ mode: 'every' })
    })
  })

  describe('parseCronExpression', () => {
    it('should parse 6-field cron expression', () => {
      const result = parseCronExpression('* * * * * *')
      expect(result).toBeDefined()
      expect(result?.second).toEqual({ mode: 'every' })
      expect(result?.minute).toEqual({ mode: 'every' })
      expect(result?.hour).toEqual({ mode: 'every' })
      expect(result?.day).toEqual({ mode: 'every' })
      expect(result?.month).toEqual({ mode: 'every' })
      expect(result?.week).toEqual({ mode: 'every' })
    })

    it('should parse expression with intervals', () => {
      const result = parseCronExpression('0 */5 * * * *')
      expect(result?.second).toEqual({ mode: 'specific', specificValues: [0] })
      expect(result?.minute).toEqual({ mode: 'interval', intervalStart: 0, intervalStep: 5 })
    })

    it('should parse expression with ranges', () => {
      const result = parseCronExpression('* * 9-17 * * *')
      expect(result?.hour).toEqual({ mode: 'range', rangeStart: 9, rangeEnd: 17 })
    })

    it('should parse 7-field cron expression with year', () => {
      const result = parseCronExpression('* * * * * * 2024')
      expect(result).toBeDefined()
      expect(result?.year).toEqual({ mode: 'specific', specificValues: [2024] })
    })

    it('should return null for invalid field count', () => {
      expect(parseCronExpression('* * *')).toBeNull()
      expect(parseCronExpression('* * * * *')).toBeNull()
      expect(parseCronExpression('* * * * * * * *')).toBeNull()
    })

    it('should handle extra whitespace', () => {
      const result = parseCronExpression('  *   *   *   *   *   *  ')
      expect(result).toBeDefined()
      expect(result?.second).toEqual({ mode: 'every' })
    })
  })

  describe('validateFieldConfig', () => {
    it('should validate every mode as valid', () => {
      const config: CronFieldConfig = { mode: 'every' }
      const result = validateFieldConfig(config, 'second')
      expect(result.valid).toBe(true)
      expect(result.errorKey).toBeUndefined()
    })

    describe('range mode validation', () => {
      it('should accept valid range', () => {
        const config: CronFieldConfig = {
          mode: 'range',
          rangeStart: 10,
          rangeEnd: 20,
        }
        const result = validateFieldConfig(config, 'second')
        expect(result.valid).toBe(true)
      })

      it('should reject range start out of bounds', () => {
        const config: CronFieldConfig = {
          mode: 'range',
          rangeStart: -1,
          rangeEnd: 20,
        }
        const result = validateFieldConfig(config, 'second')
        expect(result.valid).toBe(false)
        expect(result.errorKey).toBe('errorRangeStartOutOfBounds')
      })

      it('should reject range end out of bounds', () => {
        const config: CronFieldConfig = {
          mode: 'range',
          rangeStart: 10,
          rangeEnd: 100,
        }
        const result = validateFieldConfig(config, 'second')
        expect(result.valid).toBe(false)
        expect(result.errorKey).toBe('errorRangeEndOutOfBounds')
      })

      it('should reject range where start >= end', () => {
        const config: CronFieldConfig = {
          mode: 'range',
          rangeStart: 20,
          rangeEnd: 10,
        }
        const result = validateFieldConfig(config, 'second')
        expect(result.valid).toBe(false)
        expect(result.errorKey).toBe('errorRangeStartGreaterThanEnd')
      })

      it('should reject range where start equals end', () => {
        const config: CronFieldConfig = {
          mode: 'range',
          rangeStart: 15,
          rangeEnd: 15,
        }
        const result = validateFieldConfig(config, 'second')
        expect(result.valid).toBe(false)
        expect(result.errorKey).toBe('errorRangeStartGreaterThanEnd')
      })
    })

    describe('interval mode validation', () => {
      it('should accept valid interval', () => {
        const config: CronFieldConfig = {
          mode: 'interval',
          intervalStart: 0,
          intervalStep: 5,
        }
        const result = validateFieldConfig(config, 'second')
        expect(result.valid).toBe(true)
      })

      it('should reject interval start out of bounds', () => {
        const config: CronFieldConfig = {
          mode: 'interval',
          intervalStart: -1,
          intervalStep: 5,
        }
        const result = validateFieldConfig(config, 'second')
        expect(result.valid).toBe(false)
        expect(result.errorKey).toBe('errorIntervalStartOutOfBounds')
      })

      it('should reject interval step less than 1', () => {
        const config: CronFieldConfig = {
          mode: 'interval',
          intervalStart: 0,
          intervalStep: 0,
        }
        const result = validateFieldConfig(config, 'second')
        expect(result.valid).toBe(false)
        expect(result.errorKey).toBe('errorIntervalStepTooSmall')
      })

      it('should reject negative interval step', () => {
        const config: CronFieldConfig = {
          mode: 'interval',
          intervalStart: 0,
          intervalStep: -5,
        }
        const result = validateFieldConfig(config, 'second')
        expect(result.valid).toBe(false)
        expect(result.errorKey).toBe('errorIntervalStepTooSmall')
      })
    })

    describe('specific mode validation', () => {
      it('should accept valid specific values', () => {
        const config: CronFieldConfig = {
          mode: 'specific',
          specificValues: [1, 5, 10, 15],
        }
        const result = validateFieldConfig(config, 'second')
        expect(result.valid).toBe(true)
      })

      it('should reject empty specific values', () => {
        const config: CronFieldConfig = {
          mode: 'specific',
          specificValues: [],
        }
        const result = validateFieldConfig(config, 'second')
        expect(result.valid).toBe(false)
        expect(result.errorKey).toBe('errorNoSpecificValues')
      })

      it('should reject specific value out of bounds', () => {
        const config: CronFieldConfig = {
          mode: 'specific',
          specificValues: [1, 5, 100],
        }
        const result = validateFieldConfig(config, 'second')
        expect(result.valid).toBe(false)
        expect(result.errorKey).toBe('errorSpecificValueOutOfBounds')
      })

      it('should reject negative specific value', () => {
        const config: CronFieldConfig = {
          mode: 'specific',
          specificValues: [-1, 5, 10],
        }
        const result = validateFieldConfig(config, 'second')
        expect(result.valid).toBe(false)
        expect(result.errorKey).toBe('errorSpecificValueOutOfBounds')
      })
    })
  })

  describe('validateCronConfig', () => {
    it('should validate default config as valid', () => {
      const config = getDefaultCronConfig()
      const result = validateCronConfig(config)
      expect(result.valid).toBe(true)
      expect(result.errorKey).toBeUndefined()
      expect(result.field).toBeUndefined()
    })

    it('should validate all valid fields', () => {
      const config: CronConfig = {
        second: { mode: 'specific', specificValues: [0, 30] },
        minute: { mode: 'interval', intervalStart: 0, intervalStep: 5 },
        hour: { mode: 'range', rangeStart: 9, rangeEnd: 17 },
        day: { mode: 'every' },
        month: { mode: 'every' },
        week: { mode: 'every' },
      }
      const result = validateCronConfig(config)
      expect(result.valid).toBe(true)
    })

    it('should detect invalid second field', () => {
      const config: CronConfig = {
        second: { mode: 'range', rangeStart: 50, rangeEnd: 40 },
        minute: { mode: 'every' },
        hour: { mode: 'every' },
        day: { mode: 'every' },
        month: { mode: 'every' },
        week: { mode: 'every' },
      }
      const result = validateCronConfig(config)
      expect(result.valid).toBe(false)
      expect(result.field).toBe('second')
      expect(result.errorKey).toBe('errorRangeStartGreaterThanEnd')
    })

    it('should detect invalid minute field', () => {
      const config: CronConfig = {
        second: { mode: 'every' },
        minute: { mode: 'specific', specificValues: [] },
        hour: { mode: 'every' },
        day: { mode: 'every' },
        month: { mode: 'every' },
        week: { mode: 'every' },
      }
      const result = validateCronConfig(config)
      expect(result.valid).toBe(false)
      expect(result.field).toBe('minute')
      expect(result.errorKey).toBe('errorNoSpecificValues')
    })

    it('should validate year field when present', () => {
      const config: CronConfig = {
        second: { mode: 'every' },
        minute: { mode: 'every' },
        hour: { mode: 'every' },
        day: { mode: 'every' },
        month: { mode: 'every' },
        week: { mode: 'every' },
        year: { mode: 'specific', specificValues: [2024, 2025] },
      }
      const result = validateCronConfig(config)
      expect(result.valid).toBe(true)
    })

    it('should detect invalid year field', () => {
      const config: CronConfig = {
        second: { mode: 'every' },
        minute: { mode: 'every' },
        hour: { mode: 'every' },
        day: { mode: 'every' },
        month: { mode: 'every' },
        week: { mode: 'every' },
        year: { mode: 'specific', specificValues: [] },
      }
      const result = validateCronConfig(config)
      expect(result.valid).toBe(false)
      expect(result.field).toBe('year')
      expect(result.errorKey).toBe('errorNoSpecificValues')
    })
  })

  describe('getFieldValues', () => {
    it('should generate values for second field (0-59)', () => {
      const values = getFieldValues('second')
      expect(values).toHaveLength(60)
      expect(values[0]).toBe(0)
      expect(values[59]).toBe(59)
    })

    it('should generate values for minute field (0-59)', () => {
      const values = getFieldValues('minute')
      expect(values).toHaveLength(60)
      expect(values[0]).toBe(0)
      expect(values[59]).toBe(59)
    })

    it('should generate values for hour field (0-23)', () => {
      const values = getFieldValues('hour')
      expect(values).toHaveLength(24)
      expect(values[0]).toBe(0)
      expect(values[23]).toBe(23)
    })

    it('should generate values for day field (1-31)', () => {
      const values = getFieldValues('day')
      expect(values).toHaveLength(31)
      expect(values[0]).toBe(1)
      expect(values[30]).toBe(31)
    })

    it('should generate values for month field (1-12)', () => {
      const values = getFieldValues('month')
      expect(values).toHaveLength(12)
      expect(values[0]).toBe(1)
      expect(values[11]).toBe(12)
    })

    it('should generate values for week field (0-6)', () => {
      const values = getFieldValues('week')
      expect(values).toHaveLength(7)
      expect(values[0]).toBe(0)
      expect(values[6]).toBe(6)
    })
  })
})
