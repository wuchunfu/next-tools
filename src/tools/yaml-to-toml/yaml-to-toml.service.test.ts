import { describe, expect, it } from 'vitest'
import { parse as parseYaml } from 'yaml'
import { stringify as stringifyToml } from 'smol-toml'

describe('yaml-to-toml service', () => {
  describe('conversion', () => {
    it('should convert basic YAML to TOML', () => {
      const yaml = 'hello: world\nfoo: bar'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('hello = "world"')
      expect(toml).toContain('foo = "bar"')
    })

    it('should preserve large numbers without precision loss', () => {
      const yaml = 'userId: 17478252242305210114'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('17478252242305210114')
      expect(toml).not.toContain('17478252242305210000')
    })

    it('should convert nested YAML objects to TOML tables', () => {
      const yaml = `user:
  id: 1
  name: John`
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('[user]')
      expect(toml).toContain('id = 1')
      expect(toml).toContain('name = "John"')
    })

    it('should convert YAML arrays to TOML arrays', () => {
      const yaml = `items:
  - 1
  - 2
  - 3`
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('items = [ 1, 2, 3 ]')
    })

    it('should handle arrays with large numbers', () => {
      const yaml = `ids:
  - 17478252242305210114
  - 17478252242305210115`
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('17478252242305210114')
      expect(toml).toContain('17478252242305210115')
    })

    it('should handle negative large numbers', () => {
      const yaml = 'negativeId: -17478252242305210114'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('-17478252242305210114')
    })

    it('should convert boolean values', () => {
      const yaml = 'active: true\ninactive: false'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('active = true')
      expect(toml).toContain('inactive = false')
    })

    it('should handle empty strings', () => {
      const yaml = 'empty: ""'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('empty = ""')
    })

    it('should handle strings with special characters', () => {
      const yaml = 'text: "Hello\\nWorld"'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('text =')
    })

    it('should handle unicode characters', () => {
      const yaml = 'emoji: "😀"\nchinese: "你好"'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('😀')
      expect(toml).toContain('你好')
    })

    it('should handle deeply nested structures', () => {
      const yaml = `level1:
  level2:
    value: 17478252242305210114`
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('17478252242305210114')
    })

    it('should handle mixed types', () => {
      const yaml = `string: text
number: 42
boolean: true`
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('string = "text"')
      expect(toml).toContain('number = 42')
      expect(toml).toContain('boolean = true')
    })

    it('should handle numbers at edge of safe integer range', () => {
      const yaml = 'safe: 9007199254740991\nunsafe: 9007199254740992'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('9007199254740991')
      expect(toml).toContain('9007199254740992')
    })

    it('should handle multiple large numbers in nested structure', () => {
      const yaml = `user1:
  id: 17478252242305210114
user2:
  id: 17478252242305210115`
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('17478252242305210114')
      expect(toml).toContain('17478252242305210115')
    })

    it('should handle floating point numbers', () => {
      const yaml = 'pi: 3.14159\ne: 2.71828'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('3.14159')
      expect(toml).toContain('2.71828')
    })

    it('should handle arrays of strings', () => {
      const yaml = `tags:
  - tag1
  - tag2
  - tag3`
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('tags =')
      expect(toml).toContain('tag1')
      expect(toml).toContain('tag2')
      expect(toml).toContain('tag3')
    })

    it('should handle arrays of objects', () => {
      const yaml = `users:
  - name: John
  - name: Jane`
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('John')
      expect(toml).toContain('Jane')
    })

    it('should handle objects with many properties', () => {
      let yaml = ''
      for (let i = 0; i < 20; i++) {
        yaml += `key${i}: ${i}\n`
      }
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('key0')
      expect(toml).toContain('key19')
    })

    it('should handle arrays with large numbers and objects', () => {
      const yaml = `items:
  - id: 17478252242305210114
    name: Item 1
  - id: 17478252242305210115
    name: Item 2`
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('17478252242305210114')
      expect(toml).toContain('17478252242305210115')
    })

    it('should handle integer values', () => {
      const yaml = 'count: 42\ntotal: 100'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('count = 42')
      expect(toml).toContain('total = 100')
    })

    it('should handle zero values', () => {
      const yaml = 'zero: 0'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('zero = 0')
    })

    it('should handle negative numbers', () => {
      const yaml = 'negative: -42'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('negative = -42')
    })

    it('should handle simple nested object', () => {
      const yaml = `database:
  host: localhost
  port: 5432`
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('[database]')
      expect(toml).toContain('host = "localhost"')
      expect(toml).toContain('port = 5432')
    })

    it('should handle empty arrays', () => {
      const yaml = 'empty: []'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('empty = []')
    })

    it('should handle inline YAML arrays', () => {
      const yaml = 'items: [1, 2, 3]'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('items = [ 1, 2, 3 ]')
    })

    it('should handle inline YAML objects', () => {
      const yaml = 'user: {name: John, age: 30}'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('[user]')
      expect(toml).toContain('John')
      expect(toml).toContain('30')
    })

    it('should handle multiline strings', () => {
      const yaml = `text: |
  Hello
  World`
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('text =')
    })

    it('should handle quoted strings', () => {
      const yaml = 'text: "quoted string"'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('text = "quoted string"')
    })

    it('should handle single quoted strings', () => {
      const yaml = "text: 'single quoted'"
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('text =')
      expect(toml).toContain('single quoted')
    })

    it('should handle null values', () => {
      const yaml = 'value: null'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toBeDefined()
    })

    it('should handle complex nested arrays', () => {
      const yaml = `matrix:
  - - 1
    - 2
    - 3
  - - 4
    - 5
    - 6`
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('matrix =')
    })

    it('should handle YAML with comments', () => {
      const yaml = `# This is a comment
hello: world`
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('hello = "world"')
      // Comments should not appear in TOML output
      expect(toml).not.toContain('This is a comment')
    })

    it('should handle arrays of mixed types', () => {
      const yaml = 'mixed: [1, "text", true]'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('mixed =')
    })

    it('should handle deeply nested objects with large numbers', () => {
      const yaml = `level1:
  level2:
    level3:
      id: 17478252242305210114
      balance: 9007199254740993`
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('17478252242305210114')
      expect(toml).toContain('9007199254740993')
    })

    it('should handle strings with quotes', () => {
      const yaml = 'text: "He said \\"hello\\""'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const toml = stringifyToml(parsed)
      
      expect(toml).toContain('text =')
    })
  })
})

