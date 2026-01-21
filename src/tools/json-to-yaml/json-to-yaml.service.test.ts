import { describe, expect, it } from 'vitest'
import JSONBigInt from 'json-bigint'
import { stringify as stringifyYaml } from 'yaml'

const JSONBig = JSONBigInt({ useNativeBigInt: true })

describe('json-to-yaml service', () => {
  describe('conversion', () => {
    it('should convert basic JSON to YAML', () => {
      const json = '{"hello": "world", "foo": "bar"}'
      
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('hello: world')
      expect(yaml).toContain('foo: bar')
    })

    it('should preserve large numbers without precision loss', () => {
      const json = '{"userId": 17478252242305210114}'
      
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('17478252242305210114')
      expect(yaml).not.toContain('17478252242305210000')
    })

    it('should convert nested JSON objects to YAML', () => {
      const json = '{"user": {"id": 1, "name": "John"}}'
      
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('user:')
      expect(yaml).toContain('id: 1')
      expect(yaml).toContain('name: John')
    })

    it('should convert JSON arrays to YAML arrays', () => {
      const json = '{"items": [1, 2, 3]}'
      
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('items:')
      expect(yaml).toContain('- 1')
      expect(yaml).toContain('- 2')
      expect(yaml).toContain('- 3')
    })

    it('should handle arrays with large numbers', () => {
      const json = '{"ids": [17478252242305210114, 17478252242305210115]}'
      
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('17478252242305210114')
      expect(yaml).toContain('17478252242305210115')
    })

    it('should handle negative large numbers', () => {
      const json = '{"negativeId": -17478252242305210114}'
      
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('-17478252242305210114')
    })

    it('should convert boolean values', () => {
      const json = '{"active": true, "inactive": false}'
      
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('active: true')
      expect(yaml).toContain('inactive: false')
    })

    it('should convert null values', () => {
      const json = '{"value": null}'
      
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('value: null')
    })

    it('should handle empty strings', () => {
      const json = '{"empty": ""}'
      
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('empty:')
    })

    it('should handle strings with special characters', () => {
      const json = '{"text": "Hello\\nWorld\\t!"}'
      
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('text:')
    })

    it('should handle unicode characters', () => {
      const json = '{"emoji": "😀", "chinese": "你好"}'
      
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('😀')
      expect(yaml).toContain('你好')
    })

    it('should handle deeply nested structures', () => {
      const json = '{"level1": {"level2": {"level3": {"value": 17478252242305210114}}}}'
      
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('17478252242305210114')
      expect(yaml).toContain('level1:')
      expect(yaml).toContain('level2:')
      expect(yaml).toContain('level3:')
    })

    it('should handle mixed types', () => {
      const json = '{"string": "text", "number": 42, "boolean": true, "nullValue": null, "array": [1, 2], "object": {"nested": "value"}}'
      
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('string: text')
      expect(yaml).toContain('number: 42')
      expect(yaml).toContain('boolean: true')
      expect(yaml).toContain('nullValue: null')
    })

    it('should handle numbers at edge of safe integer range', () => {
      const json = '{"safe": 9007199254740991, "unsafe": 9007199254740992}'
      
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('9007199254740991')
      expect(yaml).toContain('9007199254740992')
    })

    it('should handle multiple large numbers in nested structure', () => {
      const json = '{"users": [{"id": 17478252242305210114, "balance": 9007199254740993}, {"id": 17478252242305210115, "balance": 9007199254740994}]}'
      
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('17478252242305210114')
      expect(yaml).toContain('17478252242305210115')
      expect(yaml).toContain('9007199254740993')
      expect(yaml).toContain('9007199254740994')
    })

    it('should handle empty JSON object', () => {
      const json = '{}'
      
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toBe('{}\n')
    })

    it('should handle empty JSON array', () => {
      const json = '[]'
      
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toBe('[]\n')
    })

    it('should handle floating point numbers', () => {
      const json = '{"pi": 3.14159, "e": 2.71828}'
      
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('3.14159')
      expect(yaml).toContain('2.71828')
    })

    it('should handle complex nested arrays', () => {
      const json = '{"matrix": [[1, 2, 3], [4, 5, 6]]}'
      
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('matrix:')
    })

    it('should handle objects with many properties', () => {
      const obj: Record<string, number> = {}
      for (let i = 0; i < 50; i++) {
        obj[`key${i}`] = i
      }
      
      const json = JSON.stringify(obj)
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('key0:')
      expect(yaml).toContain('key49:')
    })

    it('should handle arrays of objects with large numbers', () => {
      const json = '{"items": [{"id": 17478252242305210114, "name": "Item 1"}, {"id": 17478252242305210115, "name": "Item 2"}]}'
      
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('17478252242305210114')
      expect(yaml).toContain('17478252242305210115')
      expect(yaml).toContain('Item 1')
      expect(yaml).toContain('Item 2')
    })

    it('should handle strings with quotes', () => {
      const json = '{"text": "He said \\"hello\\""}'
      
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('text:')
    })

    it('should handle arrays of strings', () => {
      const json = '{"tags": ["tag1", "tag2", "tag3"]}'
      
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('tags:')
      expect(yaml).toContain('- tag1')
      expect(yaml).toContain('- tag2')
      expect(yaml).toContain('- tag3')
    })

    it('should handle arrays of mixed types', () => {
      const json = '{"mixed": [1, "text", true, null]}'
      
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('mixed:')
      expect(yaml).toContain('- 1')
      expect(yaml).toContain('- text')
      expect(yaml).toContain('- true')
      expect(yaml).toContain('- null')
    })

    it('should handle objects with numeric keys', () => {
      const json = '{"123": "value1", "456": "value2"}'
      
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toBeDefined()
    })

    it('should handle nested arrays of objects', () => {
      const json = '{"data": [[{"a": 1}], [{"b": 2}]]}'
      
      const parsed = JSONBig.parse(json)
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('data:')
    })
  })
})

