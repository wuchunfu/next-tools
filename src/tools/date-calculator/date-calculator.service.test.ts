import { describe, expect, it } from 'vitest'
import {
  calculateDateArithmetic,
  calculateDateDifference,
  convertTimeUnits,
  formatDateDifference,
  isValidDate,
  parseDate,
} from './date-calculator.service'

describe('date-calculator service', () => {
  describe('parseDate', () => {
    it('should parse valid ISO date string', () => {
      const result = parseDate('2026-01-01')
      expect(result).toBeDefined()
      expect(result?.getFullYear()).toBe(2026)
      expect(result?.getMonth()).toBe(0) // January is 0
      expect(result?.getDate()).toBe(1)
    })

    it('should parse Date object', () => {
      const date = new Date('2026-01-01')
      const result = parseDate(date)
      expect(result).toBeDefined()
      expect(result?.getFullYear()).toBe(2026)
    })

    it('should return undefined for invalid date string', () => {
      const result = parseDate('invalid-date')
      expect(result).toBeUndefined()
    })

    it('should return undefined for empty string', () => {
      const result = parseDate('')
      expect(result).toBeUndefined()
    })

    it('should parse ISO datetime with time', () => {
      const result = parseDate('2026-01-01T12:30:00')
      expect(result).toBeDefined()
      expect(result?.getHours()).toBe(12)
      expect(result?.getMinutes()).toBe(30)
    })
  })

  describe('isValidDate', () => {
    it('should return true for valid date string', () => {
      expect(isValidDate('2026-01-01')).toBe(true)
    })

    it('should return true for valid Date object', () => {
      expect(isValidDate(new Date('2026-01-01'))).toBe(true)
    })

    it('should return false for invalid date string', () => {
      expect(isValidDate('not-a-date')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isValidDate('')).toBe(false)
    })
  })

  describe('calculateDateArithmetic', () => {
    it('should add days to a date', () => {
      const baseDate = new Date('2026-01-01')
      const result = calculateDateArithmetic({
        baseDate,
        amount: 45,
        unit: 'days',
        operation: 'add',
      })

      expect(result).toBeDefined()
      expect(result?.getFullYear()).toBe(2026)
      expect(result?.getMonth()).toBe(1) // February
      expect(result?.getDate()).toBe(15)
    })

    it('should subtract days from a date', () => {
      const baseDate = new Date('2026-02-15')
      const result = calculateDateArithmetic({
        baseDate,
        amount: 45,
        unit: 'days',
        operation: 'subtract',
      })

      expect(result).toBeDefined()
      expect(result?.getFullYear()).toBe(2026)
      expect(result?.getMonth()).toBe(0) // January
      expect(result?.getDate()).toBe(1)
    })

    it('should add months to a date', () => {
      const baseDate = new Date('2026-01-15')
      const result = calculateDateArithmetic({
        baseDate,
        amount: 3,
        unit: 'months',
        operation: 'add',
      })

      expect(result).toBeDefined()
      expect(result?.getMonth()).toBe(3) // April
    })

    it('should add years to a date', () => {
      const baseDate = new Date('2026-01-01')
      const result = calculateDateArithmetic({
        baseDate,
        amount: 2,
        unit: 'years',
        operation: 'add',
      })

      expect(result).toBeDefined()
      expect(result?.getFullYear()).toBe(2028)
    })

    it('should add hours to a date', () => {
      const baseDate = new Date('2026-01-01T10:00:00')
      const result = calculateDateArithmetic({
        baseDate,
        amount: 5,
        unit: 'hours',
        operation: 'add',
      })

      expect(result).toBeDefined()
      expect(result?.getHours()).toBe(15)
    })

    it('should add minutes to a date', () => {
      const baseDate = new Date('2026-01-01T10:30:00')
      const result = calculateDateArithmetic({
        baseDate,
        amount: 45,
        unit: 'minutes',
        operation: 'add',
      })

      expect(result).toBeDefined()
      expect(result?.getHours()).toBe(11)
      expect(result?.getMinutes()).toBe(15)
    })

    it('should add weeks to a date', () => {
      const baseDate = new Date('2026-01-01')
      const result = calculateDateArithmetic({
        baseDate,
        amount: 2,
        unit: 'weeks',
        operation: 'add',
      })

      expect(result).toBeDefined()
      expect(result?.getDate()).toBe(15)
    })

    it('should return undefined for negative amount', () => {
      const baseDate = new Date('2026-01-01')
      const result = calculateDateArithmetic({
        baseDate,
        amount: -5,
        unit: 'days',
        operation: 'add',
      })

      expect(result).toBeUndefined()
    })

    it('should handle zero amount', () => {
      const baseDate = new Date('2026-01-01')
      const result = calculateDateArithmetic({
        baseDate,
        amount: 0,
        unit: 'days',
        operation: 'add',
      })

      expect(result).toBeDefined()
      expect(result?.getTime()).toBe(baseDate.getTime())
    })
  })

  describe('calculateDateDifference', () => {
    it('should calculate difference in days', () => {
      const startDate = new Date('2026-01-01')
      const endDate = new Date('2026-02-15')
      const result = calculateDateDifference({ startDate, endDate })

      expect(result).toBeDefined()
      expect(result?.days).toBe(45)
    })

    it('should calculate difference in hours', () => {
      const startDate = new Date('2026-01-01T10:00:00')
      const endDate = new Date('2026-01-01T15:00:00')
      const result = calculateDateDifference({ startDate, endDate })

      expect(result).toBeDefined()
      expect(result?.hours).toBe(5)
    })

    it('should calculate difference in minutes', () => {
      const startDate = new Date('2026-01-01T10:00:00')
      const endDate = new Date('2026-01-01T10:45:00')
      const result = calculateDateDifference({ startDate, endDate })

      expect(result).toBeDefined()
      expect(result?.minutes).toBe(45)
    })

    it('should calculate difference in months', () => {
      const startDate = new Date('2026-01-01')
      const endDate = new Date('2026-04-01')
      const result = calculateDateDifference({ startDate, endDate })

      expect(result).toBeDefined()
      expect(result?.months).toBe(3)
    })

    it('should calculate difference in years', () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2026-01-01')
      const result = calculateDateDifference({ startDate, endDate })

      expect(result).toBeDefined()
      expect(result?.years).toBe(2)
    })

    it('should handle negative difference (end before start)', () => {
      const startDate = new Date('2026-02-15')
      const endDate = new Date('2026-01-01')
      const result = calculateDateDifference({ startDate, endDate })

      expect(result).toBeDefined()
      expect(result?.days).toBe(-45)
    })

    it('should calculate total hours correctly', () => {
      const startDate = new Date('2026-01-01')
      const endDate = new Date('2026-01-03')
      const result = calculateDateDifference({ startDate, endDate })

      expect(result).toBeDefined()
      expect(result?.totalHours).toBe(48)
    })

    it('should return undefined for invalid start date', () => {
      const startDate = new Date('invalid')
      const endDate = new Date('2026-01-01')
      const result = calculateDateDifference({ startDate, endDate })

      expect(result).toBeUndefined()
    })

    it('should return undefined for invalid end date', () => {
      const startDate = new Date('2026-01-01')
      const endDate = new Date('invalid')
      const result = calculateDateDifference({ startDate, endDate })

      expect(result).toBeUndefined()
    })

    it('should handle same date (zero difference)', () => {
      const date = new Date('2026-01-01')
      const result = calculateDateDifference({ startDate: date, endDate: date })

      expect(result).toBeDefined()
      expect(result?.days).toBe(0)
      expect(result?.hours).toBe(0)
      expect(result?.minutes).toBe(0)
    })
  })

  describe('convertTimeUnits', () => {
    it('should convert days to hours', () => {
      const result = convertTimeUnits(2, 'days', 'hours')
      expect(result).toBe(48)
    })

    it('should convert hours to minutes', () => {
      const result = convertTimeUnits(2, 'hours', 'minutes')
      expect(result).toBe(120)
    })

    it('should convert minutes to seconds', () => {
      const result = convertTimeUnits(5, 'minutes', 'seconds')
      expect(result).toBe(300)
    })

    it('should convert weeks to days', () => {
      const result = convertTimeUnits(2, 'weeks', 'days')
      expect(result).toBe(14)
    })

    it('should convert years to days (approximate)', () => {
      const result = convertTimeUnits(1, 'years', 'days')
      expect(result).toBe(365)
    })

    it('should convert months to days (approximate)', () => {
      const result = convertTimeUnits(1, 'months', 'days')
      expect(result).toBe(30)
    })

    it('should handle same unit conversion', () => {
      const result = convertTimeUnits(5, 'days', 'days')
      expect(result).toBe(5)
    })

    it('should handle zero amount', () => {
      const result = convertTimeUnits(0, 'days', 'hours')
      expect(result).toBe(0)
    })

    it('should handle negative amount', () => {
      const result = convertTimeUnits(-5, 'days', 'hours')
      expect(result).toBe(0)
    })

    it('should convert seconds to hours', () => {
      const result = convertTimeUnits(7200, 'seconds', 'hours')
      expect(result).toBe(2)
    })
  })

  describe('formatDateDifference', () => {
    // Mock translation function
    const mockT = (key: string, fallback: string) => fallback

    it('should format years, months, and days', () => {
      const result = formatDateDifference({
        years: 1,
        months: 14,
        weeks: 0,
        days: 45,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalDays: 410,
        totalHours: 0,
        totalMinutes: 0,
        totalSeconds: 0,
      }, mockT)

      expect(result).toContain('1 year')
      expect(result).toContain('2 months')
      expect(result).toContain('15 days')
    })

    it('should format hours, minutes, and seconds', () => {
      const result = formatDateDifference({
        years: 0,
        months: 0,
        weeks: 0,
        days: 1,
        hours: 25,
        minutes: 125,
        seconds: 185,
        totalDays: 1,
        totalHours: 25,
        totalMinutes: 125,
        totalSeconds: 185,
      }, mockT)

      expect(result).toContain('1 day')
      expect(result).toContain('1 hour')
      expect(result).toContain('5 minutes')
      expect(result).toContain('5 seconds')
    })

    it('should handle singular units', () => {
      const result = formatDateDifference({
        years: 1,
        months: 1,
        weeks: 0,
        days: 1,
        hours: 1,
        minutes: 1,
        seconds: 1,
        totalDays: 1,
        totalHours: 1,
        totalMinutes: 1,
        totalSeconds: 1,
      }, mockT)

      expect(result).toContain('1 year')
      expect(result).toContain('1 month')
      expect(result).toContain('1 day')
      expect(result).toContain('1 hour')
      expect(result).toContain('1 minute')
      expect(result).toContain('1 second')
      expect(result).not.toContain('years')
      expect(result).not.toContain('months')
      expect(result).not.toContain('days')
      expect(result).not.toContain('hours')
      expect(result).not.toContain('minutes')
      expect(result).not.toContain('seconds')
    })

    it('should handle plural units', () => {
      const result = formatDateDifference({
        years: 2,
        months: 14,
        weeks: 0,
        days: 35,
        hours: 50,
        minutes: 125,
        seconds: 185,
        totalDays: 35,
        totalHours: 50,
        totalMinutes: 125,
        totalSeconds: 185,
      }, mockT)

      expect(result).toContain('2 years')
      expect(result).toContain('2 months')
      expect(result).toContain('5 days')
      expect(result).toContain('2 hours')
      expect(result).toContain('5 minutes')
      expect(result).toContain('5 seconds')
    })

    it('should handle zero difference', () => {
      const result = formatDateDifference({
        years: 0,
        months: 0,
        weeks: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalDays: 0,
        totalHours: 0,
        totalMinutes: 0,
        totalSeconds: 0,
      }, mockT)

      expect(result).toBe('0 seconds')
    })

    it('should only show non-zero units', () => {
      const result = formatDateDifference({
        years: 0,
        months: 3,
        weeks: 0,
        days: 15,
        hours: 0,
        minutes: 30,
        seconds: 0,
        totalDays: 105,
        totalHours: 0,
        totalMinutes: 30,
        totalSeconds: 0,
      }, mockT)

      expect(result).not.toContain('year')
      expect(result).toContain('3 months')
      expect(result).toContain('15 days')
      expect(result).not.toContain('hour')
      expect(result).toContain('30 minutes')
      expect(result).not.toContain('second')
    })

    it('should handle modulo correctly for remaining units', () => {
      const result = formatDateDifference({
        years: 0,
        months: 15,
        weeks: 0,
        days: 35,
        hours: 27,
        minutes: 125,
        seconds: 185,
        totalDays: 35,
        totalHours: 27,
        totalMinutes: 125,
        totalSeconds: 185,
      }, mockT)

      // 15 months % 12 = 3 months
      expect(result).toContain('3 months')
      // 35 days % 30 = 5 days
      expect(result).toContain('5 days')
      // 27 hours % 24 = 3 hours
      expect(result).toContain('3 hours')
      // 125 minutes % 60 = 5 minutes
      expect(result).toContain('5 minutes')
      // 185 seconds % 60 = 5 seconds
      expect(result).toContain('5 seconds')
    })

    it('should use translation function for unit names', () => {
      const customT = (key: string, fallback: string) => {
        if (key === 'tools.date-calculator.day') return 'día'
        if (key === 'tools.date-calculator.days') return 'días'
        return fallback
      }

      const result = formatDateDifference({
        years: 0,
        months: 0,
        weeks: 0,
        days: 2,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalDays: 2,
        totalHours: 0,
        totalMinutes: 0,
        totalSeconds: 0,
      }, customT)

      expect(result).toContain('2 días')
    })

    it('should handle negative difference with minus sign', () => {
      const result = formatDateDifference({
        years: -1,
        months: -14,
        weeks: 0,
        days: -45,
        hours: -25,
        minutes: -125,
        seconds: -185,
        totalDays: -410,
        totalHours: -25,
        totalMinutes: -125,
        totalSeconds: -185,
      }, mockT)

      // Should start with minus sign
      expect(result).toMatch(/^-/)
      // Should contain absolute values
      expect(result).toContain('1 year')
      expect(result).toContain('2 months')
      expect(result).toContain('15 days')
      expect(result).toContain('1 hour')
      expect(result).toContain('5 minutes')
      expect(result).toContain('5 seconds')
    })

    it('should handle negative zero difference', () => {
      const result = formatDateDifference({
        years: 0,
        months: 0,
        weeks: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: -0,
        totalDays: 0,
        totalHours: 0,
        totalMinutes: 0,
        totalSeconds: 0,
      }, mockT)

      expect(result).toBe('0 seconds')
    })
  })
})
