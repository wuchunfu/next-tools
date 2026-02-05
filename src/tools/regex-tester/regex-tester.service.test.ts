import { describe, expect, it } from 'vitest'
import { matchRegex } from './regex-tester.service'

describe('regex-tester service', () => {
  describe('matchRegex', () => {
    describe('basic matching', () => {
      it('should return empty array for empty regex', () => {
        const result = matchRegex('', 'test', 'd')
        expect(result).toEqual([])
      })

      it('should return empty array when no match found', () => {
        const result = matchRegex('xyz', 'abc', 'd')
        expect(result).toEqual([])
      })

      it('should match simple pattern', () => {
        const result = matchRegex('abc', 'abc', 'd')
        expect(result).toHaveLength(1)
        expect(result[0]!.value).toBe('abc')
        expect(result[0]!.index).toBe(0)
      })

      it('should match pattern in middle of text', () => {
        const result = matchRegex('world', 'hello world', 'd')
        expect(result).toHaveLength(1)
        expect(result[0]!.value).toBe('world')
        expect(result[0]!.index).toBe(6)
      })
    })

    describe('global flag', () => {
      it('should return only first match without global flag', () => {
        const result = matchRegex('a', 'aaa', 'd')
        expect(result).toHaveLength(1)
        expect(result[0]!.value).toBe('a')
        expect(result[0]!.index).toBe(0)
      })

      it('should return all matches with global flag', () => {
        const result = matchRegex('a', 'aaa', 'dg')
        expect(result).toHaveLength(3)
        expect(result[0]!.index).toBe(0)
        expect(result[1]!.index).toBe(1)
        expect(result[2]!.index).toBe(2)
      })

      it('should find multiple non-overlapping matches', () => {
        const result = matchRegex('ab', 'abcabc', 'dg')
        expect(result).toHaveLength(2)
        expect(result[0]!.index).toBe(0)
        expect(result[1]!.index).toBe(3)
      })
    })

    describe('capture groups', () => {
      it('should capture numbered groups', () => {
        const result = matchRegex('(\\d+)-(\\d+)', '123-456', 'd')
        expect(result).toHaveLength(1)
        expect(result[0]!.value).toBe('123-456')
        expect(result[0]!.captures).toHaveLength(2)
        expect(result[0]!.captures[0]).toEqual({
          name: '1',
          value: '123',
          start: 0,
          end: 3,
        })
        expect(result[0]!.captures[1]).toEqual({
          name: '2',
          value: '456',
          start: 4,
          end: 7,
        })
      })

      it('should capture named groups', () => {
        const result = matchRegex('(?<year>\\d{4})-(?<month>\\d{2})', '2024-01', 'd')
        expect(result).toHaveLength(1)
        expect(result[0]!.groups).toHaveLength(2)
        expect(result[0]!.groups[0]).toEqual({
          name: 'year',
          value: '2024',
          start: 0,
          end: 4,
        })
        expect(result[0]!.groups[1]).toEqual({
          name: 'month',
          value: '01',
          start: 5,
          end: 7,
        })
      })

      it('should handle nested capture groups', () => {
        const result = matchRegex('((a)(b))', 'ab', 'd')
        expect(result).toHaveLength(1)
        expect(result[0]!.captures).toHaveLength(3)
        expect(result[0]!.captures[0]!.value).toBe('ab')
        expect(result[0]!.captures[1]!.value).toBe('a')
        expect(result[0]!.captures[2]!.value).toBe('b')
      })
    })

    describe('alternation patterns (undefined capture groups)', () => {
      it('should handle alternation with undefined captures', () => {
        // This regex has alternation - only one branch matches
        const result = matchRegex('(a)|(b)', 'a', 'd')
        expect(result).toHaveLength(1)
        expect(result[0]!.value).toBe('a')
        // Only the first capture group should be present (group 2 is undefined)
        expect(result[0]!.captures).toHaveLength(1)
        expect(result[0]!.captures[0]!.value).toBe('a')
      })

      it('should handle complex date regex with many alternations', () => {
        // Simplified date regex with alternation
        const dateRegex = '^(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$'
        const result = matchRegex(dateRegex, '1990-12-12', 'd')
        expect(result).toHaveLength(1)
        expect(result[0]!.value).toBe('1990-12-12')
        expect(result[0]!.captures.length).toBeGreaterThan(0)
      })

      it('should handle the original problematic date regex', () => {
        // The exact regex that caused the original issue
        const complexDateRegex = '^(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29)$'

        // Test regular date
        const result1 = matchRegex(complexDateRegex, '1990-12-12', 'd')
        expect(result1).toHaveLength(1)
        expect(result1[0]!.value).toBe('1990-12-12')

        // Test leap year date
        const result2 = matchRegex(complexDateRegex, '2000-02-29', 'd')
        expect(result2).toHaveLength(1)
        expect(result2[0]!.value).toBe('2000-02-29')

        // Test invalid date should not match
        const result3 = matchRegex(complexDateRegex, '2001-02-29', 'd')
        expect(result3).toHaveLength(0)
      })
    })

    describe('zero-length matches', () => {
      it('should handle zero-length matches without infinite loop', () => {
        // /a*/ can match empty string
        const result = matchRegex('a*', 'bbb', 'dg')
        // Should match empty string at positions 0, 1, 2, 3
        expect(result).toHaveLength(4)
        expect(result.every(r => r.value === '')).toBe(true)
      })

      it('should handle lookahead assertions', () => {
        // Lookahead matches zero-length
        const result = matchRegex('(?=a)', 'aaa', 'dg')
        expect(result).toHaveLength(3)
        expect(result.every(r => r.value === '')).toBe(true)
      })

      it('should handle word boundaries', () => {
        const result = matchRegex('\\b', 'a b', 'dg')
        // Word boundaries at: before 'a', after 'a', before 'b', after 'b'
        expect(result).toHaveLength(4)
      })
    })

    describe('flags', () => {
      it('should respect case-insensitive flag', () => {
        const result = matchRegex('abc', 'ABC', 'di')
        expect(result).toHaveLength(1)
        expect(result[0]!.value).toBe('ABC')
      })

      it('should respect multiline flag', () => {
        const result = matchRegex('^test', 'line1\ntest', 'dgm')
        expect(result).toHaveLength(1)
        expect(result[0]!.index).toBe(6)
      })

      it('should respect dotAll flag', () => {
        const result = matchRegex('a.b', 'a\nb', 'ds')
        expect(result).toHaveLength(1)
        expect(result[0]!.value).toBe('a\nb')
      })

      it('should work without indices flag', () => {
        // Without 'd' flag, indices will be undefined
        const result = matchRegex('(\\d+)', '123', 'g')
        expect(result).toHaveLength(1)
        expect(result[0]!.value).toBe('123')
        // Captures should be empty since no indices available
        expect(result[0]!.captures).toHaveLength(0)
      })
    })

    describe('edge cases', () => {
      it('should handle empty text', () => {
        const result = matchRegex('a', '', 'd')
        expect(result).toEqual([])
      })

      it('should handle regex that matches entire text', () => {
        const result = matchRegex('.*', 'hello', 'd')
        expect(result).toHaveLength(1)
        expect(result[0]!.value).toBe('hello')
      })

      it('should handle unicode characters', () => {
        const result = matchRegex('你好', '你好世界', 'd')
        expect(result).toHaveLength(1)
        expect(result[0]!.value).toBe('你好')
        expect(result[0]!.index).toBe(0)
      })

      it('should handle special regex characters', () => {
        const result = matchRegex('\\$\\d+\\.\\d{2}', 'Price: $19.99', 'd')
        expect(result).toHaveLength(1)
        expect(result[0]!.value).toBe('$19.99')
      })

      it('should not exceed max iterations', () => {
        // This should not hang even with pathological regex
        const result = matchRegex('a*', 'b'.repeat(100), 'dg')
        expect(result.length).toBeLessThanOrEqual(101)
      })
    })
  })
})
