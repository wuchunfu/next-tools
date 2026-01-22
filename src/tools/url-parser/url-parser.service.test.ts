import type { UrlProperty } from './url-parser.service'
import { describe, expect, it } from 'vitest'
import {
  extractUrlProperties,
  isValidUrl,
  parseSearchParams,
  parseUrl,
} from './url-parser.service'

describe('url-parser service', () => {
  describe('parseUrl', () => {
    it('should parse a valid HTTP URL', () => {
      const result = parseUrl('https://example.com/path')
      expect(result).toBeDefined()
      expect(result?.protocol).toBe('https:')
      expect(result?.hostname).toBe('example.com')
      expect(result?.pathname).toBe('/path')
    })

    it('should parse a URL with all components', () => {
      const result = parseUrl('https://user:pass@example.com:8080/path?key=value#hash')
      expect(result).toBeDefined()
      expect(result?.protocol).toBe('https:')
      expect(result?.username).toBe('user')
      expect(result?.password).toBe('pass')
      expect(result?.hostname).toBe('example.com')
      expect(result?.port).toBe('8080')
      expect(result?.pathname).toBe('/path')
      expect(result?.search).toBe('?key=value')
      expect(result?.hash).toBe('#hash')
    })

    it('should parse a URL with query parameters', () => {
      const result = parseUrl('https://example.com?foo=bar&baz=qux')
      expect(result).toBeDefined()
      expect(result?.search).toBe('?foo=bar&baz=qux')
    })

    it('should parse a URL with hash fragment', () => {
      const result = parseUrl('https://example.com#section')
      expect(result).toBeDefined()
      expect(result?.hash).toBe('#section')
    })

    it('should parse localhost URLs', () => {
      const result = parseUrl('http://localhost:3000/api')
      expect(result).toBeDefined()
      expect(result?.hostname).toBe('localhost')
      expect(result?.port).toBe('3000')
      expect(result?.pathname).toBe('/api')
    })

    it('should parse IP address URLs', () => {
      const result = parseUrl('http://192.168.1.1:8080')
      expect(result).toBeDefined()
      expect(result?.hostname).toBe('192.168.1.1')
      expect(result?.port).toBe('8080')
    })

    it('should return undefined for empty string', () => {
      const result = parseUrl('')
      expect(result).toBeUndefined()
    })

    it('should return undefined for whitespace-only string', () => {
      const result = parseUrl('   ')
      expect(result).toBeUndefined()
    })

    it('should return undefined for invalid URL', () => {
      const result = parseUrl('not a url')
      expect(result).toBeUndefined()
    })

    it('should return undefined for malformed URL', () => {
      const result = parseUrl('http://')
      expect(result).toBeUndefined()
    })

    it('should parse file:// protocol', () => {
      const result = parseUrl('file:///path/to/file.txt')
      expect(result).toBeDefined()
      expect(result?.protocol).toBe('file:')
    })

    it('should parse ftp:// protocol', () => {
      const result = parseUrl('ftp://ftp.example.com/file.zip')
      expect(result).toBeDefined()
      expect(result?.protocol).toBe('ftp:')
      expect(result?.hostname).toBe('ftp.example.com')
    })
  })

  describe('isValidUrl', () => {
    it('should return true for valid HTTP URL', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
    })

    it('should return true for valid URL with all components', () => {
      expect(isValidUrl('https://user:pass@example.com:8080/path?key=value#hash')).toBe(true)
    })

    it('should return true for localhost URL', () => {
      expect(isValidUrl('http://localhost:3000')).toBe(true)
    })

    it('should return true for IP address URL', () => {
      expect(isValidUrl('http://192.168.1.1')).toBe(true)
    })

    it('should return true for empty string', () => {
      // Empty string is considered valid (no error state)
      expect(isValidUrl('')).toBe(true)
    })

    it('should return true for whitespace-only string', () => {
      // Whitespace-only is considered valid (no error state)
      expect(isValidUrl('   ')).toBe(true)
    })

    it('should return false for invalid URL', () => {
      expect(isValidUrl('not a url')).toBe(false)
    })

    it('should return false for malformed URL', () => {
      expect(isValidUrl('http://')).toBe(false)
    })

    it('should return false for URL without protocol', () => {
      expect(isValidUrl('example.com')).toBe(false)
    })

    it('should return false for partial URL', () => {
      expect(isValidUrl('://example.com')).toBe(false)
    })
  })

  describe('extractUrlProperties', () => {
    it('should extract all non-empty properties', () => {
      const url = new URL('https://user:pass@example.com:8080/path?key=value#hash')
      const allProperties: UrlProperty[] = [
        { title: 'Protocol', key: 'protocol' },
        { title: 'Username', key: 'username' },
        { title: 'Password', key: 'password' },
        { title: 'Hostname', key: 'hostname' },
        { title: 'Port', key: 'port' },
        { title: 'Path', key: 'pathname' },
        { title: 'Search', key: 'search' },
        { title: 'Hash', key: 'hash' },
      ]

      const result = extractUrlProperties(url, allProperties)

      expect(result).toHaveLength(8)
      expect(result.map(p => p.key)).toContain('protocol')
      expect(result.map(p => p.key)).toContain('username')
      expect(result.map(p => p.key)).toContain('password')
      expect(result.map(p => p.key)).toContain('hostname')
      expect(result.map(p => p.key)).toContain('port')
      expect(result.map(p => p.key)).toContain('pathname')
      expect(result.map(p => p.key)).toContain('search')
      expect(result.map(p => p.key)).toContain('hash')
    })

    it('should filter out empty properties', () => {
      const url = new URL('https://example.com/path')
      const allProperties: UrlProperty[] = [
        { title: 'Protocol', key: 'protocol' },
        { title: 'Username', key: 'username' },
        { title: 'Password', key: 'password' },
        { title: 'Hostname', key: 'hostname' },
        { title: 'Port', key: 'port' },
        { title: 'Path', key: 'pathname' },
        { title: 'Search', key: 'search' },
        { title: 'Hash', key: 'hash' },
      ]

      const result = extractUrlProperties(url, allProperties)

      // Should only include protocol, hostname, and pathname
      expect(result).toHaveLength(3)
      expect(result.map(p => p.key)).toContain('protocol')
      expect(result.map(p => p.key)).toContain('hostname')
      expect(result.map(p => p.key)).toContain('pathname')
      expect(result.map(p => p.key)).not.toContain('username')
      expect(result.map(p => p.key)).not.toContain('password')
      expect(result.map(p => p.key)).not.toContain('port')
      expect(result.map(p => p.key)).not.toContain('search')
      expect(result.map(p => p.key)).not.toContain('hash')
    })

    it('should handle URL with only protocol and hostname', () => {
      const url = new URL('https://example.com')
      const allProperties: UrlProperty[] = [
        { title: 'Protocol', key: 'protocol' },
        { title: 'Hostname', key: 'hostname' },
        { title: 'Port', key: 'port' },
      ]

      const result = extractUrlProperties(url, allProperties)

      expect(result).toHaveLength(2)
      expect(result.map(p => p.key)).toContain('protocol')
      expect(result.map(p => p.key)).toContain('hostname')
      expect(result.map(p => p.key)).not.toContain('port')
    })
  })

  describe('parseSearchParams', () => {
    it('should parse single query parameter', () => {
      const url = new URL('https://example.com?key=value')
      const result = parseSearchParams(url)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(['key', 'value'])
    })

    it('should parse multiple query parameters', () => {
      const url = new URL('https://example.com?foo=bar&baz=qux')
      const result = parseSearchParams(url)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual(['foo', 'bar'])
      expect(result[1]).toEqual(['baz', 'qux'])
    })

    it('should handle duplicate keys with array indexing', () => {
      const url = new URL('https://example.com?key=value1&key=value2')
      const result = parseSearchParams(url)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual(['key[0]', 'value1'])
      expect(result[1]).toEqual(['key[1]', 'value2'])
    })

    it('should handle multiple duplicate keys', () => {
      const url = new URL('https://example.com?key=value1&key=value2&key=value3')
      const result = parseSearchParams(url)

      expect(result).toHaveLength(3)
      expect(result[0]).toEqual(['key[0]', 'value1'])
      expect(result[1]).toEqual(['key[1]', 'value2'])
      expect(result[2]).toEqual(['key[2]', 'value3'])
    })

    it('should handle mixed single and duplicate keys', () => {
      const url = new URL('https://example.com?single=value&arr=val1&arr=val2&other=data')
      const result = parseSearchParams(url)

      expect(result).toHaveLength(4)
      expect(result[0]).toEqual(['single', 'value'])
      expect(result[1]).toEqual(['arr[0]', 'val1'])
      expect(result[2]).toEqual(['arr[1]', 'val2'])
      expect(result[3]).toEqual(['other', 'data'])
    })

    it('should handle complex URL with multiple duplicate keys', () => {
      const url = new URL('https://me:pwd@example.com:3000/path?key=value&keyarr=value1&keyarr=value2&otherarg=test#hash')
      const result = parseSearchParams(url)

      expect(result).toHaveLength(4)
      expect(result[0]).toEqual(['key', 'value'])
      expect(result[1]).toEqual(['keyarr[0]', 'value1'])
      expect(result[2]).toEqual(['keyarr[1]', 'value2'])
      expect(result[3]).toEqual(['otherarg', 'test'])
    })

    it('should return empty array for URL without query parameters', () => {
      const url = new URL('https://example.com')
      const result = parseSearchParams(url)

      expect(result).toHaveLength(0)
    })

    it('should handle empty parameter values', () => {
      const url = new URL('https://example.com?key=&other=value')
      const result = parseSearchParams(url)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual(['key', ''])
      expect(result[1]).toEqual(['other', 'value'])
    })

    it('should handle URL-encoded parameter values', () => {
      const url = new URL('https://example.com?message=hello%20world&special=%3D%26%3F')
      const result = parseSearchParams(url)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual(['message', 'hello world'])
      expect(result[1]).toEqual(['special', '=&?'])
    })

    it('should handle parameters with special characters in keys', () => {
      const url = new URL('https://example.com?user[name]=john&user[age]=30')
      const result = parseSearchParams(url)

      expect(result).toHaveLength(2)
      expect(result[0]![0]).toBe('user[name]')
      expect(result[0]![1]).toBe('john')
      expect(result[1]![0]).toBe('user[age]')
      expect(result[1]![1]).toBe('30')
    })

    it('should handle many duplicate keys', () => {
      const url = new URL('https://example.com?id=1&id=2&id=3&id=4&id=5')
      const result = parseSearchParams(url)

      expect(result).toHaveLength(5)
      expect(result[0]).toEqual(['id[0]', '1'])
      expect(result[1]).toEqual(['id[1]', '2'])
      expect(result[2]).toEqual(['id[2]', '3'])
      expect(result[3]).toEqual(['id[3]', '4'])
      expect(result[4]).toEqual(['id[4]', '5'])
    })
  })
})

