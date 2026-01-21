import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { formatJson, sortObjectKeys } from './json.models'

describe('json-prettify service', () => {
  describe('sortObjectKeys', () => {
    it('should sort object keys alphabetically', () => {
      const input = { zebra: 1, apple: 2, banana: 3 }
      const result = sortObjectKeys(input)
      const keys = Object.keys(result)
      
      expect(keys).toEqual(['apple', 'banana', 'zebra'])
    })

    it('should handle nested objects', () => {
      const input = {
        z: { nested2: 1, nested1: 2 },
        a: { nested2: 3, nested1: 4 },
      }
      const result = sortObjectKeys(input)
      const keys = Object.keys(result)
      const nestedKeys = Object.keys(result.a)
      
      expect(keys).toEqual(['a', 'z'])
      expect(nestedKeys).toEqual(['nested1', 'nested2'])
    })

    it('should handle arrays without sorting', () => {
      const input = { items: [3, 1, 2] }
      const result = sortObjectKeys(input)
      
      expect(result.items).toEqual([3, 1, 2])
    })

    it('should handle arrays of objects', () => {
      const input = {
        users: [
          { name: 'John', age: 30 },
          { name: 'Jane', age: 25 },
        ],
      }
      const result = sortObjectKeys(input)
      
      expect(result.users).toHaveLength(2)
      expect(Object.keys(result.users[0]!)).toEqual(['age', 'name'])
      expect(Object.keys(result.users[1]!)).toEqual(['age', 'name'])
    })

    it('should handle null values', () => {
      const input = { a: null, b: 'value' }
      const result = sortObjectKeys(input)
      
      expect(result.a).toBeNull()
      expect(result.b).toBe('value')
    })

    it('should handle primitive values', () => {
      expect(sortObjectKeys(null)).toBeNull()
      expect(sortObjectKeys('string')).toBe('string')
      expect(sortObjectKeys(123)).toBe(123)
      expect(sortObjectKeys(true)).toBe(true)
    })

    it('should preserve BigInt values', () => {
      const input = { userId: 17478252242305210114n }
      const result = sortObjectKeys(input)
      
      expect(result.userId).toBe(17478252242305210114n)
      expect(typeof result.userId).toBe('bigint')
    })

    it('should handle mixed types in object', () => {
      const input = {
        string: 'text',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        object: { nested: 'value' },
        bigint: 9007199254740993n,
      }
      const result = sortObjectKeys(input)
      const keys = Object.keys(result)
      
      expect(keys).toEqual(['array', 'bigint', 'boolean', 'null', 'number', 'object', 'string'])
      expect(result.bigint).toBe(9007199254740993n)
    })
  })

  describe('formatJson', () => {
    it('should format valid JSON with default options', () => {
      const rawJson = ref('{"hello":"world"}')
      const result = formatJson({ rawJson })
      
      expect(result).toContain('"hello"')
      expect(result).toContain('"world"')
      expect(result).toContain('\n') // Should be formatted with newlines
    })

    it('should format JSON with custom indent size', () => {
      const rawJson = ref('{"a":1}')
      const indentSize = ref(2)
      const result = formatJson({ rawJson, indentSize })
      
      // With indent 2, should have 2 spaces
      expect(result).toContain('  "a"')
    })

    it('should sort keys when sortKeys is true', () => {
      const rawJson = ref('{"z":1,"a":2}')
      const sortKeys = ref(true)
      const result = formatJson({ rawJson, sortKeys })
      
      // 'a' should appear before 'z' in the output
      const indexA = result.indexOf('"a"')
      const indexZ = result.indexOf('"z"')
      expect(indexA).toBeLessThan(indexZ)
    })

    it('should not sort keys when sortKeys is false', () => {
      const rawJson = ref('{"z":1,"a":2}')
      const sortKeys = ref(false)
      const result = formatJson({ rawJson, sortKeys })
      
      // 'z' should appear before 'a' in the output (original order)
      const indexA = result.indexOf('"a"')
      const indexZ = result.indexOf('"z"')
      expect(indexZ).toBeLessThan(indexA)
    })

    it('should preserve large numbers without precision loss', () => {
      const rawJson = ref('{"userId":17478252242305210114}')
      const result = formatJson({ rawJson })
      
      // Should preserve the exact number
      expect(result).toContain('17478252242305210114')
      expect(result).not.toContain('17478252242305210000') // Should NOT have precision loss
    })

    it('should handle nested objects with large numbers', () => {
      const rawJson = ref('{"user":{"id":17478252242305210114,"name":"John"}}')
      const result = formatJson({ rawJson })
      
      expect(result).toContain('17478252242305210114')
      expect(result).toContain('"name"')
      expect(result).toContain('"John"')
    })

    it('should handle arrays with large numbers', () => {
      const rawJson = ref('{"ids":[17478252242305210114,17478252242305210115]}')
      const result = formatJson({ rawJson })
      
      expect(result).toContain('17478252242305210114')
      expect(result).toContain('17478252242305210115')
    })

    it('should handle empty object', () => {
      const rawJson = ref('{}')
      const result = formatJson({ rawJson })
      
      expect(result).toBe('{}')
    })

    it('should handle empty array', () => {
      const rawJson = ref('[]')
      const result = formatJson({ rawJson })
      
      expect(result).toBe('[]')
    })

    it('should handle complex nested structure', () => {
      const rawJson = ref('{"users":[{"id":17478252242305210114,"profile":{"age":30}}],"count":1}')
      const sortKeys = ref(true)
      const result = formatJson({ rawJson, sortKeys })
      
      expect(result).toContain('17478252242305210114')
      expect(result).toContain('"count"')
      expect(result).toContain('"users"')
      expect(result).toContain('"profile"')
    })

    it('should handle special characters in strings', () => {
      const rawJson = ref('{"text":"Hello\\nWorld\\t!"}')
      const result = formatJson({ rawJson })
      
      expect(result).toContain('Hello\\nWorld\\t!')
    })

    it('should handle unicode characters', () => {
      const rawJson = ref('{"emoji":"😀","chinese":"你好"}')
      const result = formatJson({ rawJson })
      
      expect(result).toContain('😀')
      expect(result).toContain('你好')
    })

    it('should handle boolean and null values', () => {
      const rawJson = ref('{"active":true,"inactive":false,"empty":null}')
      const result = formatJson({ rawJson })
      
      expect(result).toContain('true')
      expect(result).toContain('false')
      expect(result).toContain('null')
    })

    it('should handle numbers at the edge of safe integer range', () => {
      const rawJson = ref('{"safe":9007199254740991,"unsafe":9007199254740992}')
      const result = formatJson({ rawJson })
      
      // Both should be preserved accurately
      expect(result).toContain('9007199254740991')
      expect(result).toContain('9007199254740992')
    })

    it('should handle negative large numbers', () => {
      const rawJson = ref('{"negativeId":-17478252242305210114}')
      const result = formatJson({ rawJson })
      
      expect(result).toContain('-17478252242305210114')
    })

    it('should handle zero indent size', () => {
      const rawJson = ref('{"a":1,"b":2}')
      const indentSize = ref(0)
      const result = formatJson({ rawJson, indentSize })
      
      // With indent 0, should be compact (no extra spaces)
      expect(result).toBe('{"a":1,"b":2}')
    })

    it('should handle maximum indent size', () => {
      const rawJson = ref('{"a":1}')
      const indentSize = ref(10)
      const result = formatJson({ rawJson, indentSize })
      
      // With indent 10, should have 10 spaces
      expect(result).toContain('          "a"')
    })
  })
})

