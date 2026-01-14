import { beforeEach, describe, expect, it } from 'vitest'
import {
  formatFileSize,
  STANDARD_ICO_SIZES,
  validateImageFile,
} from './ico-generator.service'

describe('ico-generator service', () => {
  describe('standard_ICO_sizes', () => {
    it('should contain standard ICO sizes', () => {
      expect(STANDARD_ICO_SIZES).toHaveLength(7)

      const sizes = STANDARD_ICO_SIZES.map(s => `${s.width}x${s.height}`)
      expect(sizes).toContain('16x16')
      expect(sizes).toContain('32x32')
      expect(sizes).toContain('48x48')
      expect(sizes).toContain('256x256')
    })

    it('should have 16x16, 32x32, 48x48, and 256x256 enabled by default', () => {
      const enabledSizes = STANDARD_ICO_SIZES.filter(s => s.enabled)
      expect(enabledSizes).toHaveLength(4)

      const enabledLabels = enabledSizes.map(s => `${s.width}×${s.height}`)
      expect(enabledLabels).toContain('16×16')
      expect(enabledLabels).toContain('32×32')
      expect(enabledLabels).toContain('48×48')
      expect(enabledLabels).toContain('256×256')
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B')
      expect(formatFileSize(512)).toBe('512 B')
      expect(formatFileSize(1023)).toBe('1023 B')
    })

    it('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1.00 KB')
      expect(formatFileSize(1536)).toBe('1.50 KB')
      expect(formatFileSize(10240)).toBe('10.00 KB')
    })

    it('should format megabytes correctly', () => {
      expect(formatFileSize(1048576)).toBe('1.00 MB')
      expect(formatFileSize(2097152)).toBe('2.00 MB')
      expect(formatFileSize(5242880)).toBe('5.00 MB')
    })
  })

  describe('validateImageFile', () => {
    let mockImageFile: File
    let mockNonImageFile: File
    let mockLargeFile: File

    beforeEach(() => {
      mockImageFile = new File(['test'], 'test.png', { type: 'image/png' })
      mockNonImageFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      mockLargeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.png', { type: 'image/png' })
    })

    it('should accept valid image files', () => {
      const result = validateImageFile(mockImageFile)
      expect(result.valid).toBe(true)
      expect(result.errorKey).toBeUndefined()
    })

    it('should reject non-image files', () => {
      const result = validateImageFile(mockNonImageFile)
      expect(result.valid).toBe(false)
      expect(result.errorKey).toBe('errorInvalidFileType')
    })

    it('should reject files larger than 10MB', () => {
      const result = validateImageFile(mockLargeFile)
      expect(result.valid).toBe(false)
      expect(result.errorKey).toBe('errorFileTooLarge')
    })

    it('should accept image/jpeg', () => {
      const jpegFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const result = validateImageFile(jpegFile)
      expect(result.valid).toBe(true)
    })

    it('should accept image/gif', () => {
      const gifFile = new File(['test'], 'test.gif', { type: 'image/gif' })
      const result = validateImageFile(gifFile)
      expect(result.valid).toBe(true)
    })

    it('should accept image/webp', () => {
      const webpFile = new File(['test'], 'test.webp', { type: 'image/webp' })
      const result = validateImageFile(webpFile)
      expect(result.valid).toBe(true)
    })
  })
})
