import { describe, expect, it } from 'vitest'
import { parse as parseYaml } from 'yaml'
import JSONBigInt from 'json-bigint'

const JSONBig = JSONBigInt({ useNativeBigInt: true })

describe('yaml-to-json service', () => {
  describe('conversion', () => {
    it('should convert basic YAML to JSON', () => {
      const yaml = 'hello: world\nfoo: bar'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"hello": "world"')
      expect(json).toContain('"foo": "bar"')
    })

    it('should preserve large numbers without precision loss', () => {
      const yaml = 'userId: 17478252242305210114'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('17478252242305210114')
      expect(json).not.toContain('17478252242305210000')
    })

    it('should convert nested YAML objects to JSON', () => {
      const yaml = `user:
  id: 1
  name: John`
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"user"')
      expect(json).toContain('"id": 1')
      expect(json).toContain('"name": "John"')
    })

    it('should convert YAML arrays to JSON arrays', () => {
      const yaml = `items:
  - 1
  - 2
  - 3`
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"items"')
      expect(json).toContain('[')
      expect(json).toContain('1')
      expect(json).toContain('2')
      expect(json).toContain('3')
    })

    it('should handle arrays with large numbers', () => {
      const yaml = `ids:
  - 17478252242305210114
  - 17478252242305210115`
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('17478252242305210114')
      expect(json).toContain('17478252242305210115')
    })

    it('should handle negative large numbers', () => {
      const yaml = 'negativeId: -17478252242305210114'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('-17478252242305210114')
    })

    it('should convert boolean values', () => {
      const yaml = 'active: true\ninactive: false'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"active": true')
      expect(json).toContain('"inactive": false')
    })

    it('should convert null values', () => {
      const yaml = 'value: null'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"value": null')
    })

    it('should handle empty strings', () => {
      const yaml = 'empty: ""'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"empty"')
    })

    it('should handle multiline strings', () => {
      const yaml = `text: |
  Hello
  World`
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"text"')
      expect(json).toContain('Hello')
      expect(json).toContain('World')
    })

    it('should handle unicode characters', () => {
      const yaml = 'emoji: "😀"\nchinese: "你好"'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('😀')
      expect(json).toContain('你好')
    })

    it('should handle deeply nested structures', () => {
      const yaml = `level1:
  level2:
    level3:
      value: 17478252242305210114`
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('17478252242305210114')
      expect(json).toContain('"level1"')
      expect(json).toContain('"level2"')
      expect(json).toContain('"level3"')
    })

    it('should handle mixed types', () => {
      const yaml = `string: text
number: 42
boolean: true
nullValue: null
array:
  - 1
  - 2
object:
  nested: value`
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"string": "text"')
      expect(json).toContain('"number": 42')
      expect(json).toContain('"boolean": true')
      expect(json).toContain('"nullValue": null')
    })

    it('should handle numbers at edge of safe integer range', () => {
      const yaml = 'safe: 9007199254740991\nunsafe: 9007199254740992'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('9007199254740991')
      expect(json).toContain('9007199254740992')
    })

    it('should handle multiple large numbers in nested structure', () => {
      const yaml = `users:
  - id: 17478252242305210114
    balance: 9007199254740993
  - id: 17478252242305210115
    balance: 9007199254740994`
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('17478252242305210114')
      expect(json).toContain('17478252242305210115')
      expect(json).toContain('9007199254740993')
      expect(json).toContain('9007199254740994')
    })

    it('should handle inline YAML arrays', () => {
      const yaml = 'items: [1, 2, 3]'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"items"')
      expect(json).toContain('[')
    })

    it('should handle inline YAML objects', () => {
      const yaml = 'user: {id: 1, name: John}'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"user"')
      expect(json).toContain('{')
    })

    it('should handle floating point numbers', () => {
      const yaml = 'pi: 3.14159\ne: 2.71828'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('3.14159')
      expect(json).toContain('2.71828')
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
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"matrix"')
      expect(json).toContain('[')
    })

    it('should handle special characters in strings', () => {
      const yaml = 'text: "Hello\\nWorld\\t!"'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"text"')
    })

    it('should handle quoted strings', () => {
      const yaml = 'text: "quoted string"'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"text"')
      expect(json).toContain('quoted string')
    })

    it('should handle empty YAML object', () => {
      const yaml = '{}'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toBe('{}')
    })

    it('should handle empty YAML array', () => {
      const yaml = '[]'
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toBe('[]')
    })

    it('should handle objects with many properties', () => {
      let yaml = ''
      for (let i = 0; i < 50; i++) {
        yaml += `key${i}: ${i}\n`
      }
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('"key0"')
      expect(json).toContain('"key49"')
    })

    it('should handle arrays of objects with large numbers', () => {
      const yaml = `items:
  - id: 17478252242305210114
    name: Item 1
  - id: 17478252242305210115
    name: Item 2`
      
      const parsed = parseYaml(yaml, { intAsBigInt: true })
      const json = JSONBig.stringify(parsed, null, 2)
      
      expect(json).toContain('17478252242305210114')
      expect(json).toContain('17478252242305210115')
      expect(json).toContain('Item 1')
      expect(json).toContain('Item 2')
    })
  })
})

