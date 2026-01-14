/**
 * ICO file format implementation
 * Generates standard ICO files with configurable sizes
 */

export interface IcoSize {
    width: number
    height: number
    enabled: boolean
  }
  
  export const STANDARD_ICO_SIZES: IcoSize[] = [
    { width: 16, height: 16, enabled: true },
    { width: 24, height: 24, enabled: false },
    { width: 32, height: 32, enabled: true },
    { width: 48, height: 48, enabled: true },
    { width: 64, height: 64, enabled: false },
    { width: 128, height: 128, enabled: false },
    { width: 256, height: 256, enabled: true },
  ]
  
  interface IcoImageEntry {
    width: number
    height: number
    pngData: Uint8Array
  }
  
  /**
   * Resize an image to a specific dimension
   */
  async function resizeImage(
    sourceImage: HTMLImageElement,
    targetWidth: number,
    targetHeight: number,
  ): Promise<Uint8Array> {
    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight
  
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }
  
    // Use high-quality image smoothing
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
  
    // Draw the image resized to the target dimensions
    ctx.drawImage(sourceImage, 0, 0, targetWidth, targetHeight)
  
    // Convert canvas to PNG blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) {
            resolve(result)
          }
          else {
            reject(new Error('Failed to convert canvas to blob'))
          }
        },
        'image/png',
        1.0, // Maximum quality
      )
    })
  
    // Convert blob to Uint8Array
    const arrayBuffer = await blob.arrayBuffer()
    return new Uint8Array(arrayBuffer)
  }
  
  /**
   * Load image from file
   */
  function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
  
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve(img)
      }
  
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to load image'))
      }
  
      img.src = url
    })
  }
  
  /**
   * Create ICO file structure
   * Format specification: https://en.wikipedia.org/wiki/ICO_(file_format)
   */
  function createIcoFile(entries: IcoImageEntry[]): Uint8Array {
    if (entries.length === 0) {
      throw new Error('At least one size must be selected')
    }
  
    // Calculate total file size
    const headerSize = 6 // ICONDIR
    const directorySize = 16 * entries.length // ICONDIRENTRY for each image
    const imageDataSize = entries.reduce((sum, entry) => sum + entry.pngData.length, 0)
    const totalSize = headerSize + directorySize + imageDataSize
  
    const buffer = new Uint8Array(totalSize)
    const view = new DataView(buffer.buffer)
  
    let offset = 0
  
    // Write ICONDIR header
    view.setUint16(offset, 0, true) // Reserved (must be 0)
    offset += 2
    view.setUint16(offset, 1, true) // Type (1 = ICO, 2 = CUR)
    offset += 2
    view.setUint16(offset, entries.length, true) // Number of images
    offset += 2
  
    // Calculate offset for image data (after all directory entries)
    let imageDataOffset = headerSize + directorySize
  
    // Write ICONDIRENTRY for each image
    for (const entry of entries) {
      // Width (0 means 256)
      buffer[offset++] = entry.width === 256 ? 0 : entry.width
      // Height (0 means 256)
      buffer[offset++] = entry.height === 256 ? 0 : entry.height
      // Color palette (0 = no palette)
      buffer[offset++] = 0
      // Reserved (must be 0)
      buffer[offset++] = 0
      // Color planes (0 or 1)
      view.setUint16(offset, 1, true)
      offset += 2
      // Bits per pixel (32 for PNG)
      view.setUint16(offset, 32, true)
      offset += 2
      // Size of image data in bytes
      view.setUint32(offset, entry.pngData.length, true)
      offset += 4
      // Offset of image data from beginning of file
      view.setUint32(offset, imageDataOffset, true)
      offset += 4
  
      imageDataOffset += entry.pngData.length
    }
  
    // Write image data
    for (const entry of entries) {
      buffer.set(entry.pngData, offset)
      offset += entry.pngData.length
    }
  
    return buffer
  }
  
  /**
   * Generate ICO file from source image
   * @param sourceFile - Source image file (PNG, JPEG, etc.)
   * @param selectedSizes - Array of sizes to include in the ICO
   * @returns ICO file as Uint8Array
   */
  export async function generateIcoFile(
    sourceFile: File,
    selectedSizes: Array<{ width: number, height: number }>,
  ): Promise<Uint8Array> {
    if (selectedSizes.length === 0) {
      throw new Error('At least one size must be selected')
    }
  
    // Load source image
    const sourceImage = await loadImage(sourceFile)
  
    // Generate resized images for each size
    const entries: IcoImageEntry[] = []
  
    for (const size of selectedSizes) {
      const pngData = await resizeImage(sourceImage, size.width, size.height)
      entries.push({
        width: size.width,
        height: size.height,
        pngData,
      })
    }
  
    // Create ICO file
    return createIcoFile(entries)
  }
  
  /**
   * Download ICO file
   */
  export function downloadIcoFile(data: Uint8Array, filename: string) {
    const blob = new Blob([new Uint8Array(data)], { type: 'image/x-icon' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename.endsWith('.ico') ? filename : `${filename}.ico`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
  
  /**
   * Format file size for display
   */
  export function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`
    }
    else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`
    }
    else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    }
  }
  
  /**
   * Validate image file
   */
  export function validateImageFile(file: File): { valid: boolean, errorKey?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return {
        valid: false,
        errorKey: 'errorInvalidFileType',
      }
    }
  
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        valid: false,
        errorKey: 'errorFileTooLarge',
      }
    }
  
    return { valid: true }
  }
  