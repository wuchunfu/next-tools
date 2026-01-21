import { describe, expect, it } from 'vitest'
import { parse, stringify } from 'yaml'

describe('yaml-prettify service', () => {
  describe('parse and stringify', () => {
    it('should parse and format basic YAML', () => {
      const input = 'hello: world\nfoo: bar'
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toContain('hello: world')
      expect(result).toContain('foo: bar')
    })

    it('should preserve large numbers without precision loss', () => {
      const input = 'userId: 17478252242305210114'
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toContain('17478252242305210114')
      expect(result).not.toContain('17478252242305210000')
    })

    it('should handle nested objects', () => {
      const input = `user:
  id: 1
  name: John`
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toContain('user:')
      expect(result).toContain('id: 1')
      expect(result).toContain('name: John')
    })

    it('should handle arrays', () => {
      const input = `items:
  - 1
  - 2
  - 3`
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toContain('items:')
      expect(result).toContain('- 1')
      expect(result).toContain('- 2')
      expect(result).toContain('- 3')
    })

    it('should handle arrays with large numbers', () => {
      const input = `ids:
  - 17478252242305210114
  - 17478252242305210115`
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toContain('17478252242305210114')
      expect(result).toContain('17478252242305210115')
    })

    it('should handle negative large numbers', () => {
      const input = 'negativeId: -17478252242305210114'
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toContain('-17478252242305210114')
    })

    it('should handle boolean values', () => {
      const input = 'active: true\ninactive: false'
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toContain('active: true')
      expect(result).toContain('inactive: false')
    })

    it('should handle null values', () => {
      const input = 'value: null'
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toContain('value: null')
    })

    it('should handle empty strings', () => {
      const input = 'empty: ""'
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toContain('empty:')
    })

    it('should handle multiline strings', () => {
      const input = `text: |
  Hello
  World`
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toContain('text:')
    })

    it('should handle special characters in strings', () => {
      const input = 'text: "Hello\\nWorld"'
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toContain('text:')
    })

    it('should handle unicode characters', () => {
      const input = 'emoji: "😀"\nchinese: "你好"'
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toContain('😀')
      expect(result).toContain('你好')
    })

    it('should handle deeply nested structures', () => {
      const input = `level1:
  level2:
    level3:
      value: 17478252242305210114`
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toContain('17478252242305210114')
      expect(result).toContain('level1:')
      expect(result).toContain('level2:')
      expect(result).toContain('level3:')
    })

    it('should handle mixed types', () => {
      const input = `string: text
number: 42
boolean: true
nullValue: null
array:
  - 1
  - 2
object:
  nested: value`
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toContain('string: text')
      expect(result).toContain('number: 42')
      expect(result).toContain('boolean: true')
      expect(result).toContain('nullValue: null')
    })

    it('should handle numbers at edge of safe integer range', () => {
      const input = 'safe: 9007199254740991\nunsafe: 9007199254740992'
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toContain('9007199254740991')
      expect(result).toContain('9007199254740992')
    })

    it('should handle multiple large numbers in nested structure', () => {
      const input = `users:
  - id: 17478252242305210114
    balance: 9007199254740993
  - id: 17478252242305210115
    balance: 9007199254740994`
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toContain('17478252242305210114')
      expect(result).toContain('17478252242305210115')
      expect(result).toContain('9007199254740993')
      expect(result).toContain('9007199254740994')
    })

    it('should handle inline arrays', () => {
      const input = 'items: [1, 2, 3]'
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toContain('items:')
    })

    it('should handle inline objects', () => {
      const input = 'user: {id: 1, name: John}'
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toContain('user:')
    })

    it('should handle comments', () => {
      const input = '# This is a comment\nhello: world'
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toContain('hello: world')
    })

    it('should handle quoted strings', () => {
      const input = 'text: "quoted string"'
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toContain('text:')
    })

    it('should handle single quoted strings', () => {
      const input = "text: 'single quoted'"
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toContain('text:')
    })

    it('should handle complex nested arrays', () => {
      const input = `matrix:
  - - 1
    - 2
    - 3
  - - 4
    - 5
    - 6`
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toContain('matrix:')
    })

    it('should handle objects with many properties', () => {
      const obj: Record<string, number> = {}
      for (let i = 0; i < 50; i++) {
        obj[`key${i}`] = i
      }
      
      const input = stringify(obj, { indent: 2 })
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toContain('key0:')
      expect(result).toContain('key49:')
    })

    it('should handle different indent sizes', () => {
      const input = 'hello: world\nfoo: bar'
      
      const parsed = parse(input, { intAsBigInt: true })
      const result2 = stringify(parsed, { indent: 2 })
      const result4 = stringify(parsed, { indent: 4 })
      
      expect(result2).toBeDefined()
      expect(result4).toBeDefined()
    })

    it('should handle empty document', () => {
      const input = ''
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toBeDefined()
    })

    it('should handle document with only comments', () => {
      const input = '# Just a comment'
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toBeDefined()
    })

    it('should handle floating point numbers', () => {
      const input = 'pi: 3.14159\ne: 2.71828'
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toContain('3.14159')
      expect(result).toContain('2.71828')
    })

    it('should handle scientific notation', () => {
      const input = 'large: 1.23e10\nsmall: 1.23e-10'
      
      const parsed = parse(input, { intAsBigInt: true })
      const result = stringify(parsed, { indent: 2 })
      
      expect(result).toBeDefined()
    })
  })
})

