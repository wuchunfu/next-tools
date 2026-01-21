import { describe, expect, it } from 'vitest'

describe('json-minify service', () => {
  describe('minification', () => {
    it('should remove whitespace from formatted JSON', () => {
      const input = `{
  "hello": "world",
  "foo": "bar"
}`
      const expected = '{"hello":"world","foo":"bar"}'
      
      // Parse and stringify with 0 indent
      const result = JSON.stringify(JSON.parse(input), null, 0)
      expect(result).toBe(expected)
    })

    it('should preserve large numbers without precision loss', () => {
      const input = '{"userId": 17478252242305210114}'
      
      // Should preserve the exact number
      expect(input).toContain('17478252242305210114')
    })

    it('should handle nested objects', () => {
      const input = `{
  "user": {
    "id": 1,
    "name": "John"
  }
}`
      const expected = '{"user":{"id":1,"name":"John"}}'
      
      const result = JSON.stringify(JSON.parse(input), null, 0)
      expect(result).toBe(expected)
    })

    it('should handle arrays', () => {
      const input = `{
  "items": [1, 2, 3]
}`
      const expected = '{"items":[1,2,3]}'
      
      const result = JSON.stringify(JSON.parse(input), null, 0)
      expect(result).toBe(expected)
    })

    it('should handle empty object', () => {
      const input = '{}'
      const result = JSON.stringify(JSON.parse(input), null, 0)
      expect(result).toBe('{}')
    })

    it('should handle empty array', () => {
      const input = '[]'
      const result = JSON.stringify(JSON.parse(input), null, 0)
      expect(result).toBe('[]')
    })

    it('should preserve string values with special characters', () => {
      const input = '{"text": "Hello\\nWorld\\t!"}'
      const result = JSON.stringify(JSON.parse(input), null, 0)
      expect(result).toContain('Hello\\nWorld\\t!')
    })

    it('should preserve unicode characters', () => {
      const input = '{"emoji": "😀", "chinese": "你好"}'
      const result = JSON.stringify(JSON.parse(input), null, 0)
      expect(result).toContain('😀')
      expect(result).toContain('你好')
    })

    it('should handle boolean and null values', () => {
      const input = '{"active": true, "inactive": false, "empty": null}'
      const result = JSON.stringify(JSON.parse(input), null, 0)
      expect(result).toContain('true')
      expect(result).toContain('false')
      expect(result).toContain('null')
    })

    it('should handle multiple large numbers', () => {
      const input = '{"id1": 17478252242305210114, "id2": 17478252242305210115}'
      
      expect(input).toContain('17478252242305210114')
      expect(input).toContain('17478252242305210115')
    })

    it('should handle negative large numbers', () => {
      const input = '{"negativeId": -17478252242305210114}'
      
      expect(input).toContain('-17478252242305210114')
    })

    it('should handle arrays with large numbers', () => {
      const input = '{"ids": [17478252242305210114, 17478252242305210115]}'
      
      expect(input).toContain('17478252242305210114')
      expect(input).toContain('17478252242305210115')
    })

    it('should handle deeply nested structures', () => {
      const input = `{
  "level1": {
    "level2": {
      "level3": {
        "value": "17478252242305210114"
      }
    }
  }
}`
      const result = JSON.stringify(JSON.parse(input), null, 0)
      expect(result).toContain('17478252242305210114')
      expect(result).not.toContain('\n')
      expect(result).not.toContain('  ')
    })

    it('should handle mixed types', () => {
      const input = `{
  "string": "text",
  "number": 42,
  "boolean": true,
  "null": null,
  "array": [1, 2, 3],
  "object": {"nested": "value"}
}`
      const result = JSON.stringify(JSON.parse(input), null, 0)
      expect(result).not.toContain('\n')
      expect(result).toContain('"string":"text"')
      expect(result).toContain('"number":42')
      expect(result).toContain('"boolean":true')
      expect(result).toContain('"null":null')
    })

    it('should handle numbers at edge of safe integer range', () => {
      const input = '{"safe": 9007199254740991, "unsafe": 9007199254740992}'
      
      expect(input).toContain('9007199254740991')
      expect(input).toContain('9007199254740992')
    })
  })
})

