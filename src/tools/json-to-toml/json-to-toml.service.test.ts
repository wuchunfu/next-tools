import { describe, expect, it } from 'vitest'
import JSONBigInt from 'json-bigint'
import { stringify as stringifyToml } from 'smol-toml'

const JSONBig = JSONBigInt({ useNativeBigInt: true })

describe('json-to-toml service', () => {
  describe('conversion', () => {
    it('should convert basic JSON to TOML', () => {
      const json = '{"hello": "world", "foo": "bar"}'
      
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('hello = "world"')
      expect(toml).toContain('foo = "bar"')
    })

    it('should preserve large numbers without precision loss', () => {
      const json = '{"userId": 17478252242305210114}'
      
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('17478252242305210114')
      expect(toml).not.toContain('17478252242305210000')
    })

    it('should convert nested JSON objects to TOML tables', () => {
      const json = '{"user": {"id": 1, "name": "John"}}'
      
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('[user]')
      expect(toml).toContain('id = 1')
      expect(toml).toContain('name = "John"')
    })

    it('should convert JSON arrays to TOML arrays', () => {
      const json = '{"items": [1, 2, 3]}'
      
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('items = [ 1, 2, 3 ]')
    })

    it('should handle arrays with large numbers', () => {
      const json = '{"ids": [17478252242305210114, 17478252242305210115]}'
      
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('17478252242305210114')
      expect(toml).toContain('17478252242305210115')
    })

    it('should handle negative large numbers', () => {
      const json = '{"negativeId": -17478252242305210114}'
      
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('-17478252242305210114')
    })

    it('should convert boolean values', () => {
      const json = '{"active": true, "inactive": false}'
      
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('active = true')
      expect(toml).toContain('inactive = false')
    })

    it('should handle empty strings', () => {
      const json = '{"empty": ""}'
      
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('empty = ""')
    })

    it('should handle strings with special characters', () => {
      const json = '{"text": "Hello\\nWorld"}'
      
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('text =')
    })

    it('should handle unicode characters', () => {
      const json = '{"emoji": "😀", "chinese": "你好"}'
      
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('😀')
      expect(toml).toContain('你好')
    })

    it('should handle deeply nested structures', () => {
      const json = '{"level1": {"level2": {"value": 17478252242305210114}}}'
      
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('17478252242305210114')
    })

    it('should handle mixed types', () => {
      const json = '{"string": "text", "number": 42, "boolean": true}'
      
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('string = "text"')
      expect(toml).toContain('number = 42')
      expect(toml).toContain('boolean = true')
    })

    it('should handle numbers at edge of safe integer range', () => {
      const json = '{"safe": 9007199254740991, "unsafe": 9007199254740992}'
      
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('9007199254740991')
      expect(toml).toContain('9007199254740992')
    })

    it('should handle multiple large numbers in nested structure', () => {
      const json = '{"user1": {"id": 17478252242305210114}, "user2": {"id": 17478252242305210115}}'
      
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('17478252242305210114')
      expect(toml).toContain('17478252242305210115')
    })

    it('should handle floating point numbers', () => {
      const json = '{"pi": 3.14159, "e": 2.71828}'
      
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('3.14159')
      expect(toml).toContain('2.71828')
    })

    it('should handle arrays of strings', () => {
      const json = '{"tags": ["tag1", "tag2", "tag3"]}'
      
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('tags =')
      expect(toml).toContain('tag1')
      expect(toml).toContain('tag2')
      expect(toml).toContain('tag3')
    })

    it('should handle arrays of objects', () => {
      const json = '{"users": [{"name": "John"}, {"name": "Jane"}]}'
      
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('John')
      expect(toml).toContain('Jane')
    })

    it('should handle objects with many properties', () => {
      const obj: Record<string, number> = {}
      for (let i = 0; i < 20; i++) {
        obj[`key${i}`] = i
      }
      
      const json = JSON.stringify(obj)
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('key0')
      expect(toml).toContain('key19')
    })

    it('should handle arrays with large numbers and objects', () => {
      const json = '{"items": [{"id": 17478252242305210114, "name": "Item 1"}, {"id": 17478252242305210115, "name": "Item 2"}]}'
      
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('17478252242305210114')
      expect(toml).toContain('17478252242305210115')
    })

    it('should handle strings with quotes', () => {
      const json = '{"text": "He said \\"hello\\""}'
      
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('text =')
    })

    it('should handle integer values', () => {
      const json = '{"count": 42, "total": 100}'
      
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('count = 42')
      expect(toml).toContain('total = 100')
    })

    it('should handle zero values', () => {
      const json = '{"zero": 0}'
      
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('zero = 0')
    })

    it('should handle negative numbers', () => {
      const json = '{"negative": -42}'
      
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('negative = -42')
    })

    it('should handle simple nested object', () => {
      const json = '{"database": {"host": "localhost", "port": 5432}}'
      
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('[database]')
      expect(toml).toContain('host = "localhost"')
      expect(toml).toContain('port = 5432')
    })

    it('should handle mixed array types', () => {
      const json = '{"mixed": [1, "text", true]}'
      
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('mixed =')
    })

    it('should handle empty arrays', () => {
      const json = '{"empty": []}'
      
      const parsed = JSONBig.parse(json)
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('empty = []')
    })
  })
})

