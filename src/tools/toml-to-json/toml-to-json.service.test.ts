import { describe, expect, it } from 'vitest'
import { parse as parseToml } from 'smol-toml'
import JSONBigInt from 'json-bigint'

const JSONBig = JSONBigInt({ useNativeBigInt: true })

describe('toml-to-json service', () => {
  describe('conversion', () => {
    it('should convert basic TOML to JSON', () => {
      const toml = 'hello = "world"\nfoo = "bar"'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"hello": "world"')
      expect(json).toContain('"foo": "bar"')
    })

    it('should preserve large numbers without precision loss', () => {
      const toml = 'userId = 17478252242305210114'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('17478252242305210114')
      expect(json).not.toContain('17478252242305210000')
    })

    it('should convert TOML tables to JSON objects', () => {
      const toml = '[user]\nid = 1\nname = "John"'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"user"')
      expect(json).toContain('"id": 1')
      expect(json).toContain('"name": "John"')
    })

    it('should convert TOML arrays to JSON arrays', () => {
      const toml = 'items = [1, 2, 3]'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"items"')
      expect(json).toContain('[')
      expect(json).toContain('1')
      expect(json).toContain('2')
      expect(json).toContain('3')
    })

    it('should handle arrays with large numbers', () => {
      const toml = 'ids = [17478252242305210114, 17478252242305210115]'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('17478252242305210114')
      expect(json).toContain('17478252242305210115')
    })

    it('should handle negative large numbers', () => {
      const toml = 'negativeId = -17478252242305210114'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('-17478252242305210114')
    })

    it('should convert boolean values', () => {
      const toml = 'active = true\ninactive = false'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"active": true')
      expect(json).toContain('"inactive": false')
    })

    it('should handle empty strings', () => {
      const toml = 'empty = ""'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"empty": ""')
    })

    it('should handle strings with special characters', () => {
      const toml = 'text = "Hello\\nWorld"'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"text"')
    })

    it('should handle unicode characters', () => {
      const toml = 'emoji = "😀"\nchinese = "你好"'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('😀')
      expect(json).toContain('你好')
    })

    it('should handle nested TOML tables', () => {
      const toml = '[level1.level2]\nvalue = 17478252242305210114'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('17478252242305210114')
      expect(json).toContain('"level1"')
      expect(json).toContain('"level2"')
    })

    it('should handle mixed types', () => {
      const toml = 'string = "text"\nnumber = 42\nboolean = true'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"string": "text"')
      expect(json).toContain('"number": 42')
      expect(json).toContain('"boolean": true')
    })

    it('should handle numbers at edge of safe integer range', () => {
      const toml = 'safe = 9007199254740991\nunsafe = 9007199254740992'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('9007199254740991')
      expect(json).toContain('9007199254740992')
    })

    it('should handle multiple large numbers in nested structure', () => {
      const toml = '[user1]\nid = 17478252242305210114\n\n[user2]\nid = 17478252242305210115'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('17478252242305210114')
      expect(json).toContain('17478252242305210115')
    })

    it('should handle floating point numbers', () => {
      const toml = 'pi = 3.14159\ne = 2.71828'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('3.14159')
      expect(json).toContain('2.71828')
    })

    it('should handle arrays of strings', () => {
      const toml = 'tags = ["tag1", "tag2", "tag3"]'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"tags"')
      expect(json).toContain('tag1')
      expect(json).toContain('tag2')
      expect(json).toContain('tag3')
    })

    it('should handle array of tables', () => {
      const toml = '[[users]]\nname = "John"\n\n[[users]]\nname = "Jane"'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('John')
      expect(json).toContain('Jane')
    })

    it('should handle integer values', () => {
      const toml = 'count = 42\ntotal = 100'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"count": 42')
      expect(json).toContain('"total": 100')
    })

    it('should handle zero values', () => {
      const toml = 'zero = 0'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"zero": 0')
    })

    it('should handle negative numbers', () => {
      const toml = 'negative = -42'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"negative": -42')
    })

    it('should handle simple nested table', () => {
      const toml = '[database]\nhost = "localhost"\nport = 5432'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"database"')
      expect(json).toContain('"host": "localhost"')
      expect(json).toContain('"port": 5432')
    })

    it('should handle empty arrays', () => {
      const toml = 'empty = []'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"empty": []')
    })

    it('should handle inline tables', () => {
      const toml = 'user = { name = "John", age = 30 }'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"user"')
      expect(json).toContain('John')
      expect(json).toContain('30')
    })

    it('should handle multiline strings', () => {
      const toml = 'text = """\nHello\nWorld\n"""'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"text"')
    })

    it('should handle quoted keys', () => {
      const toml = '"quoted key" = "value"'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('quoted key')
      expect(json).toContain('value')
    })

    it('should handle array of tables with large numbers', () => {
      const toml = '[[items]]\nid = 17478252242305210114\nname = "Item 1"\n\n[[items]]\nid = 17478252242305210115\nname = "Item 2"'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('17478252242305210114')
      expect(json).toContain('17478252242305210115')
    })

    it('should handle comments', () => {
      const toml = '# This is a comment\nhello = "world"'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"hello": "world"')
      // Comments should not appear in JSON
      expect(json).not.toContain('This is a comment')
    })

    it('should handle dotted keys', () => {
      const toml = 'user.name = "John"\nuser.age = 30'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"user"')
      expect(json).toContain('John')
      expect(json).toContain('30')
    })
  })
})

