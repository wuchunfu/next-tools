import { describe, expect, it } from 'vitest'
import { diff } from './json-diff.service'
import type { ObjectDifference, ArrayDifference } from './json-diff.types'

describe('json-diff service', () => {
  describe('diff function', () => {
    it('should detect no differences for identical objects', () => {
      const obj1 = { hello: 'world' }
      const obj2 = { hello: 'world' }
      
      const result = diff(obj1, obj2)
      
      expect(result.status).toBe('unchanged')
      expect(result.type).toBe('object')
    })

    it('should detect value changes', () => {
      const obj1 = { hello: 'world' }
      const obj2 = { hello: 'universe' }
      
      const result = diff(obj1, obj2) as ObjectDifference
      
      expect(result.status).toBe('children-updated')
      expect(result.type).toBe('object')
      expect(result.children).toHaveLength(1)
      expect(result.children[0]!.status).toBe('updated')
    })

    it('should detect added properties', () => {
      const obj1 = { hello: 'world' }
      const obj2 = { hello: 'world', foo: 'bar' }
      
      const result = diff(obj1, obj2) as ObjectDifference
      
      expect(result.status).toBe('children-updated')
      expect(result.children).toHaveLength(2)
      
      const addedProp = result.children.find(c => c.key === 'foo')
      expect(addedProp?.status).toBe('added')
    })

    it('should detect removed properties', () => {
      const obj1 = { hello: 'world', foo: 'bar' }
      const obj2 = { hello: 'world' }
      
      const result = diff(obj1, obj2) as ObjectDifference
      
      expect(result.status).toBe('children-updated')
      
      const removedProp = result.children.find(c => c.key === 'foo')
      expect(removedProp?.status).toBe('removed')
    })

    it('should handle large numbers without precision loss', () => {
      const obj1 = { userId: 17478252242305210114n }
      const obj2 = { userId: 17478252242305210114n }
      
      const result = diff(obj1, obj2) as ObjectDifference
      
      expect(result.status).toBe('unchanged')
      expect(result.children[0]!.value).toBe(17478252242305210114n)
    })

    it('should detect changes in large numbers', () => {
      const obj1 = { userId: 17478252242305210114n }
      const obj2 = { userId: 17478252242305210115n }
      
      const result = diff(obj1, obj2) as ObjectDifference
      
      expect(result.status).toBe('children-updated')
      expect(result.children[0]!.status).toBe('updated')
      expect(result.children[0]!.oldValue).toBe(17478252242305210114n)
      expect(result.children[0]!.value).toBe(17478252242305210115n)
    })

    it('should handle nested objects', () => {
      const obj1 = { user: { id: 1, name: 'John' } }
      const obj2 = { user: { id: 1, name: 'Jane' } }
      
      const result = diff(obj1, obj2) as ObjectDifference
      
      expect(result.status).toBe('children-updated')
      expect(result.children[0]!.type).toBe('object')
      expect(result.children[0]!.status).toBe('children-updated')
    })

    it('should handle arrays', () => {
      const obj1 = { items: [1, 2, 3] }
      const obj2 = { items: [1, 2, 4] }
      
      const result = diff(obj1, obj2) as ObjectDifference
      
      expect(result.status).toBe('children-updated')
      expect(result.children[0]!.type).toBe('array')
      expect(result.children[0]!.status).toBe('children-updated')
    })

    it('should handle arrays with large numbers', () => {
      const obj1 = { ids: [17478252242305210114n, 17478252242305210115n] }
      const obj2 = { ids: [17478252242305210114n, 17478252242305210116n] }
      
      const result = diff(obj1, obj2) as ObjectDifference
      
      expect(result.status).toBe('children-updated')
      const arrayDiff = result.children[0]! as ArrayDifference
      expect(arrayDiff.type).toBe('array')
      expect(arrayDiff.children[1]!.status).toBe('updated')
    })

    it('should handle empty objects', () => {
      const obj1 = {}
      const obj2 = {}
      
      const result = diff(obj1, obj2)
      
      expect(result.status).toBe('unchanged')
      expect(result.type).toBe('object')
    })

    it('should handle null values', () => {
      const obj1 = { value: null }
      const obj2 = { value: null }
      
      const result = diff(obj1, obj2)
      
      expect(result.status).toBe('unchanged')
    })

    it('should detect null to value changes', () => {
      const obj1 = { value: null }
      const obj2 = { value: 'something' }
      
      const result = diff(obj1, obj2) as ObjectDifference
      
      expect(result.status).toBe('children-updated')
      expect(result.children[0]!.status).toBe('updated')
    })

    it('should handle boolean values', () => {
      const obj1 = { active: true }
      const obj2 = { active: false }
      
      const result = diff(obj1, obj2) as ObjectDifference
      
      expect(result.status).toBe('children-updated')
      expect(result.children[0]!.status).toBe('updated')
    })

    it('should handle deeply nested structures', () => {
      const obj1 = {
        level1: {
          level2: {
            level3: {
              value: 17478252242305210114n
            }
          }
        }
      }
      const obj2 = {
        level1: {
          level2: {
            level3: {
              value: 17478252242305210115n
            }
          }
        }
      }
      
      const result = diff(obj1, obj2)
      
      expect(result.status).toBe('children-updated')
      expect(result.type).toBe('object')
    })

    it('should handle mixed types', () => {
      const obj1 = {
        string: 'text',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        object: { nested: 'value' }
      }
      const obj2 = {
        string: 'text',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        object: { nested: 'value' }
      }
      
      const result = diff(obj1, obj2)
      
      expect(result.status).toBe('unchanged')
    })

    it('should handle type changes', () => {
      const obj1 = { value: 'string' }
      const obj2 = { value: 123 }
      
      const result = diff(obj1, obj2) as ObjectDifference
      
      expect(result.status).toBe('children-updated')
      expect(result.children[0]!.status).toBe('updated')
    })

    it('should handle array length changes', () => {
      const obj1 = { items: [1, 2, 3] }
      const obj2 = { items: [1, 2] }
      
      const result = diff(obj1, obj2) as ObjectDifference
      
      expect(result.status).toBe('children-updated')
      const arrayDiff = result.children[0]! as ArrayDifference
      expect(arrayDiff.children).toHaveLength(3)
      expect(arrayDiff.children[2]!.status).toBe('removed')
    })

    it('should handle array order changes', () => {
      const obj1 = { items: [1, 2, 3] }
      const obj2 = { items: [3, 2, 1] }
      
      const result = diff(obj1, obj2)
      
      expect(result.status).toBe('children-updated')
    })

    it('should handle onlyShowDifferences option', () => {
      const obj1 = { a: 1, b: 2, c: 3 }
      const obj2 = { a: 1, b: 5, c: 3 }
      
      const result = diff(obj1, obj2, { onlyShowDifferences: true }) as ObjectDifference
      
      // Should only show the changed property 'b'
      expect(result.children).toHaveLength(1)
      expect(result.children[0]!.key).toBe('b')
    })

    it('should handle multiple large numbers in nested structure', () => {
      const obj1 = {
        users: [
          { id: 17478252242305210114n, balance: 9007199254740993n },
          { id: 17478252242305210115n, balance: 9007199254740994n }
        ]
      }
      const obj2 = {
        users: [
          { id: 17478252242305210114n, balance: 9007199254740993n },
          { id: 17478252242305210115n, balance: 9007199254740995n }
        ]
      }
      
      const result = diff(obj1, obj2)
      
      expect(result.status).toBe('children-updated')
    })

    it('should handle negative large numbers', () => {
      const obj1 = { negativeId: -17478252242305210114n }
      const obj2 = { negativeId: -17478252242305210114n }
      
      const result = diff(obj1, obj2)
      
      expect(result.status).toBe('unchanged')
    })

    it('should handle special characters in strings', () => {
      const obj1 = { text: 'Hello\nWorld\t!' }
      const obj2 = { text: 'Hello\nWorld\t!' }
      
      const result = diff(obj1, obj2)
      
      expect(result.status).toBe('unchanged')
    })

    it('should handle unicode characters', () => {
      const obj1 = { emoji: '😀', chinese: '你好' }
      const obj2 = { emoji: '😀', chinese: '你好' }
      
      const result = diff(obj1, obj2)
      
      expect(result.status).toBe('unchanged')
    })

    it('should handle numbers at edge of safe integer range', () => {
      const obj1 = { safe: 9007199254740991n, unsafe: 9007199254740992n }
      const obj2 = { safe: 9007199254740991n, unsafe: 9007199254740992n }
      
      const result = diff(obj1, obj2)
      
      expect(result.status).toBe('unchanged')
    })

    it('should handle complex nested arrays', () => {
      const obj1 = {
        matrix: [
          [1, 2, 3],
          [4, 5, 6]
        ]
      }
      const obj2 = {
        matrix: [
          [1, 2, 3],
          [4, 5, 7]
        ]
      }
      
      const result = diff(obj1, obj2)
      
      expect(result.status).toBe('children-updated')
    })

    it('should handle comparing arrays directly', () => {
      const arr1 = [1, 2, 3]
      const arr2 = [1, 2, 4]
      
      const result = diff(arr1, arr2)
      
      expect(result.type).toBe('array')
      expect(result.status).toBe('children-updated')
    })

    it('should handle comparing primitive values directly', () => {
      const val1 = 'hello'
      const val2 = 'world'
      
      const result = diff(val1, val2)
      
      expect(result.type).toBe('value')
      expect(result.status).toBe('updated')
    })
  })
})
