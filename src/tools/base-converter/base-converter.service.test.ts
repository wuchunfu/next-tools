import { describe, expect, it } from 'vitest'
import { convertBase } from './base-converter.service'

describe('integer-base-converter model', () => {
  describe('convertBase', () => {
    describe('basic conversions', () => {
      it('should convert decimal to binary', () => {
        expect(convertBase({ value: '42', fromBase: 10, toBase: 2 })).toBe('101010')
      })

      it('should convert binary to decimal', () => {
        expect(convertBase({ value: '1010', fromBase: 2, toBase: 10 })).toBe('10')
      })

      it('should convert decimal to hexadecimal', () => {
        expect(convertBase({ value: '255', fromBase: 10, toBase: 16 })).toBe('ff')
      })

      it('should convert hexadecimal to decimal', () => {
        expect(convertBase({ value: 'ff', fromBase: 16, toBase: 10 })).toBe('255')
      })

      it('should convert decimal to octal', () => {
        expect(convertBase({ value: '8', fromBase: 10, toBase: 8 })).toBe('10')
      })

      it('should convert octal to decimal', () => {
        expect(convertBase({ value: '77', fromBase: 8, toBase: 10 })).toBe('63')
      })

      it('should convert binary to hexadecimal', () => {
        expect(convertBase({ value: '11111111', fromBase: 2, toBase: 16 })).toBe('ff')
      })

      it('should return "0" for zero input', () => {
        expect(convertBase({ value: '0', fromBase: 10, toBase: 2 })).toBe('0')
        expect(convertBase({ value: '0', fromBase: 16, toBase: 10 })).toBe('0')
      })
    })

    describe('case insensitivity for bases <= 36', () => {
      it('should accept uppercase hex input', () => {
        expect(convertBase({ value: 'FF', fromBase: 16, toBase: 10 })).toBe('255')
      })

      it('should accept lowercase hex input', () => {
        expect(convertBase({ value: 'ff', fromBase: 16, toBase: 10 })).toBe('255')
      })

      it('should accept mixed case hex input', () => {
        expect(convertBase({ value: '1B2f', fromBase: 16, toBase: 10 })).toBe('6959')
        expect(convertBase({ value: '1b2F', fromBase: 16, toBase: 10 })).toBe('6959')
      })

      it('should accept uppercase letters for base 36', () => {
        expect(convertBase({ value: 'Z', fromBase: 36, toBase: 10 })).toBe('35')
        expect(convertBase({ value: 'z', fromBase: 36, toBase: 10 })).toBe('35')
      })

      it('should handle full uppercase hex string', () => {
        expect(convertBase({ value: 'DEADBEEF', fromBase: 16, toBase: 10 })).toBe('3735928559')
      })

      it('should produce same result regardless of case for bases <= 36', () => {
        const upper = convertBase({ value: 'ABC', fromBase: 16, toBase: 10 })
        const lower = convertBase({ value: 'abc', fromBase: 16, toBase: 10 })
        const mixed = convertBase({ value: 'AbC', fromBase: 16, toBase: 10 })

        expect(upper).toBe(lower)
        expect(lower).toBe(mixed)
      })
    })

    describe('case sensitivity for bases > 36', () => {
      it('should treat uppercase and lowercase as different digits for base 64', () => {
        // In the range, 'a' is at position 10, 'A' is at position 36
        const lowercaseResult = convertBase({ value: 'a', fromBase: 64, toBase: 10 })
        const uppercaseResult = convertBase({ value: 'A', fromBase: 64, toBase: 10 })

        expect(lowercaseResult).toBe('10')
        expect(uppercaseResult).toBe('36')
        expect(lowercaseResult).not.toBe(uppercaseResult)
      })

      it('should handle base 62 with distinct case', () => {
        const lowercaseResult = convertBase({ value: 'z', fromBase: 62, toBase: 10 })
        const uppercaseResult = convertBase({ value: 'Z', fromBase: 62, toBase: 10 })

        expect(lowercaseResult).toBe('35')
        expect(uppercaseResult).toBe('61')
      })
    })

    describe('large numbers (BigInt precision)', () => {
      it('should handle large decimal numbers', () => {
        expect(convertBase({ value: '999999999999999999', fromBase: 10, toBase: 16 })).toBe('de0b6b3a763ffff')
      })

      it('should handle large binary numbers', () => {
        const binary = '1111111111111111111111111111111111111111'
        const result = convertBase({ value: binary, fromBase: 2, toBase: 10 })
        expect(result).toBe('1099511627775')
      })

      it('should round-trip large numbers correctly', () => {
        const original = '123456789012345678'
        const hex = convertBase({ value: original, fromBase: 10, toBase: 16 })
        const backToDecimal = convertBase({ value: hex, fromBase: 16, toBase: 10 })
        expect(backToDecimal).toBe(original)
      })
    })

    describe('error handling', () => {
      it('should throw for invalid digit in given base', () => {
        // '2' is not a valid binary digit
        expect(() => convertBase({ value: '2', fromBase: 2, toBase: 10 })).toThrow(
          'Invalid digit "2" for base 2.',
        )
      })

      it('should throw for hex digit in decimal base', () => {
        expect(() => convertBase({ value: 'a', fromBase: 10, toBase: 16 })).toThrow(
          'Invalid digit "a" for base 10.',
        )
      })

      it('should throw for digit 9 in octal', () => {
        expect(() => convertBase({ value: '9', fromBase: 8, toBase: 10 })).toThrow(
          'Invalid digit "9" for base 8.',
        )
      })

      it('should throw for uppercase letters invalid in base > 36', () => {
        // In base 37, valid chars are 0-9, a-z, A (position 36)
        // 'B' is at position 37, so it's invalid for base 37
        expect(() => convertBase({ value: 'B', fromBase: 37, toBase: 10 })).toThrow(
          'Invalid digit "B" for base 37.',
        )
      })
    })

    describe('edge cases', () => {
      it('should convert between same base', () => {
        expect(convertBase({ value: 'ff', fromBase: 16, toBase: 16 })).toBe('ff')
        expect(convertBase({ value: '42', fromBase: 10, toBase: 10 })).toBe('42')
      })

      it('should handle single digit values', () => {
        expect(convertBase({ value: '1', fromBase: 10, toBase: 2 })).toBe('1')
        expect(convertBase({ value: '1', fromBase: 2, toBase: 10 })).toBe('1')
      })

      it('should handle base 2 minimum range', () => {
        expect(convertBase({ value: '0', fromBase: 2, toBase: 10 })).toBe('0')
        expect(convertBase({ value: '1', fromBase: 2, toBase: 10 })).toBe('1')
      })

      it('should handle base 64 with special characters + and /', () => {
        // '+' is at position 62, '/' is at position 63
        expect(convertBase({ value: '+', fromBase: 64, toBase: 10 })).toBe('62')
        expect(convertBase({ value: '/', fromBase: 64, toBase: 10 })).toBe('63')
      })
    })
  })
})
