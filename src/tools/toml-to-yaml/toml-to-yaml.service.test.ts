import { describe, expect, it } from 'vitest'
import { parse as parseToml } from 'smol-toml'
import { stringify as stringifyYaml } from 'yaml'

describe('toml-to-yaml service', () => {
  describe('conversion', () => {
    it('should convert basic TOML to YAML', () => {
      const toml = 'hello = "world"\nfoo = "bar"'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('hello: world')
      expect(yaml).toContain('foo: bar')
    })

    it('should preserve large numbers without precision loss', () => {
      const toml = 'userId = 17478252242305210114'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('17478252242305210114')
      expect(yaml).not.toContain('17478252242305210000')
    })

    it('should convert TOML tables to YAML objects', () => {
      const toml = '[user]\nid = 1\nname = "John"'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('user:')
      expect(yaml).toContain('id: 1')
      expect(yaml).toContain('name: John')
    })

    it('should convert TOML arrays to YAML arrays', () => {
      const toml = 'items = [1, 2, 3]'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('items:')
      expect(yaml).toContain('- 1')
      expect(yaml).toContain('- 2')
      expect(yaml).toContain('- 3')
    })

    it('should handle arrays with large numbers', () => {
      const toml = 'ids = [17478252242305210114, 17478252242305210115]'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('17478252242305210114')
      expect(yaml).toContain('17478252242305210115')
    })

    it('should handle negative large numbers', () => {
      const toml = 'negativeId = -17478252242305210114'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('-17478252242305210114')
    })

    it('should convert boolean values', () => {
      const toml = 'active = true\ninactive = false'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('active: true')
      expect(yaml).toContain('inactive: false')
    })

    it('should handle empty strings', () => {
      const toml = 'empty = ""'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('empty:')
    })

    it('should handle strings with special characters', () => {
      const toml = 'text = "Hello\\nWorld"'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('text:')
    })

    it('should handle unicode characters', () => {
      const toml = 'emoji = "😀"\nchinese = "你好"'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('😀')
      expect(yaml).toContain('你好')
    })

    it('should handle nested TOML tables', () => {
      const toml = '[level1.level2]\nvalue = 17478252242305210114'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('17478252242305210114')
      expect(yaml).toContain('level1:')
      expect(yaml).toContain('level2:')
    })

    it('should handle mixed types', () => {
      const toml = 'string = "text"\nnumber = 42\nboolean = true'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('string: text')
      expect(yaml).toContain('number: 42')
      expect(yaml).toContain('boolean: true')
    })

    it('should handle numbers at edge of safe integer range', () => {
      const toml = 'safe = 9007199254740991\nunsafe = 9007199254740992'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('9007199254740991')
      expect(yaml).toContain('9007199254740992')
    })

    it('should handle multiple large numbers in nested structure', () => {
      const toml = '[user1]\nid = 17478252242305210114\n\n[user2]\nid = 17478252242305210115'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('17478252242305210114')
      expect(yaml).toContain('17478252242305210115')
    })

    it('should handle floating point numbers', () => {
      const toml = 'pi = 3.14159\ne = 2.71828'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('3.14159')
      expect(yaml).toContain('2.71828')
    })

    it('should handle arrays of strings', () => {
      const toml = 'tags = ["tag1", "tag2", "tag3"]'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('tags:')
      expect(yaml).toContain('- tag1')
      expect(yaml).toContain('- tag2')
      expect(yaml).toContain('- tag3')
    })

    it('should handle array of tables', () => {
      const toml = '[[users]]\nname = "John"\n\n[[users]]\nname = "Jane"'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('users:')
      expect(yaml).toContain('John')
      expect(yaml).toContain('Jane')
    })

    it('should handle integer values', () => {
      const toml = 'count = 42\ntotal = 100'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('count: 42')
      expect(yaml).toContain('total: 100')
    })

    it('should handle zero values', () => {
      const toml = 'zero = 0'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('zero: 0')
    })

    it('should handle negative numbers', () => {
      const toml = 'negative = -42'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('negative: -42')
    })

    it('should handle simple nested table', () => {
      const toml = '[database]\nhost = "localhost"\nport = 5432'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('database:')
      expect(yaml).toContain('host: localhost')
      expect(yaml).toContain('port: 5432')
    })

    it('should handle empty arrays', () => {
      const toml = 'empty = []'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('empty: []')
    })

    it('should handle inline tables', () => {
      const toml = 'user = { name = "John", age = 30 }'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('user:')
      expect(yaml).toContain('John')
      expect(yaml).toContain('30')
    })

    it('should handle multiline strings', () => {
      const toml = 'text = """\nHello\nWorld\n"""'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('text:')
    })

    it('should handle quoted keys', () => {
      const toml = '"quoted key" = "value"'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('quoted key')
      expect(yaml).toContain('value')
    })

    it('should handle array of tables with large numbers', () => {
      const toml = '[[items]]\nid = 17478252242305210114\nname = "Item 1"\n\n[[items]]\nid = 17478252242305210115\nname = "Item 2"'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('17478252242305210114')
      expect(yaml).toContain('17478252242305210115')
      expect(yaml).toContain('Item 1')
      expect(yaml).toContain('Item 2')
    })

    it('should handle comments', () => {
      const toml = '# This is a comment\nhello = "world"'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('hello: world')
      // Comments should not appear in YAML
      expect(yaml).not.toContain('This is a comment')
    })

    it('should handle dotted keys', () => {
      const toml = 'user.name = "John"\nuser.age = 30'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('user:')
      expect(yaml).toContain('John')
      expect(yaml).toContain('30')
    })

    it('should handle complex nested structure', () => {
      const toml = '[server]\nhost = "localhost"\nport = 8080\n\n[database]\nhost = "db.example.com"\nport = 5432'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('server:')
      expect(yaml).toContain('database:')
      expect(yaml).toContain('localhost')
      expect(yaml).toContain('db.example.com')
    })

    it('should handle arrays of numbers', () => {
      const toml = 'numbers = [1, 2, 3, 4, 5]'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('numbers:')
      expect(yaml).toContain('- 1')
      expect(yaml).toContain('- 5')
    })

    it('should handle arrays of booleans', () => {
      const toml = 'flags = [true, false, true]'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('flags:')
      expect(yaml).toContain('- true')
      expect(yaml).toContain('- false')
    })

    it('should handle deeply nested tables', () => {
      const toml = '[a.b.c.d]\nvalue = 17478252242305210114'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('17478252242305210114')
      expect(yaml).toContain('a:')
    })

    it('should handle mixed array types', () => {
      const toml = 'mixed = [1, 2.5, "text"]'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('mixed:')
      expect(yaml).toContain('- 1')
      expect(yaml).toContain('- 2.5')
      expect(yaml).toContain('- text')
    })

    it('should handle strings with quotes', () => {
      const toml = 'text = "He said \\"hello\\""'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('text:')
    })

    it('should handle multiple sections with large numbers', () => {
      const toml = '[section1]\nid = 17478252242305210114\n\n[section2]\nid = 17478252242305210115'
      
      const parsed = parseToml(toml, { integersAsBigInt: true })
      const yaml = stringifyYaml(parsed, { indent: 2 })
      
      expect(yaml).toContain('section1:')
      expect(yaml).toContain('section2:')
      expect(yaml).toContain('17478252242305210114')
      expect(yaml).toContain('17478252242305210115')
    })
  })
})

