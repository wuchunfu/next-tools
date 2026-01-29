/**
 * File selection options
 */
export interface FileSelectionOptions {
  /**
   * Accept attribute for file input (e.g., "image/*", ".pdf", "image/png,image/jpeg")
   */
  accept?: string
  /**
   * Allow multiple file selection
   */
  multiple?: boolean
  /**
   * Capture attribute for mobile devices (e.g., "user", "environment")
   */
  capture?: string
}

/**
 * Open file picker dialog and return selected file(s)
 * @param options - File selection options
 * @returns Promise that resolves to selected File(s) or null if cancelled
 */
export function selectFile(options: FileSelectionOptions & { multiple: true }): Promise<FileList | null>
export function selectFile(options?: FileSelectionOptions): Promise<File | null>
export function selectFile(options: FileSelectionOptions = {}): Promise<File | FileList | null> {
  return new Promise((resolve) => {
    // Create file input element dynamically
    const input = document.createElement('input')
    input.type = 'file'
    
    // Set options
    if (options.accept) {
      input.accept = options.accept
    }
    if (options.multiple) {
      input.multiple = true
    }
    if (options.capture) {
      input.setAttribute('capture', options.capture)
    }
    
    // Handle file selection
    input.onchange = (event) => {
      const target = event.target as HTMLInputElement
      const files = target.files
      
      if (!files || files.length === 0) {
        resolve(null)
        return
      }
      
      if (options.multiple) {
        resolve(files)
      } else {
        const file = files[0]
        resolve(file || null)
      }
      
      // Clean up
      input.remove()
    }
    
    // Handle cancel (when dialog is closed without selecting)
    input.oncancel = () => {
      resolve(null)
      input.remove()
    }
    
    // Trigger file picker
    input.click()
  })
}

/**
 * Select image file(s)
 * @param multiple - Allow multiple file selection
 * @returns Promise that resolves to selected image File(s) or null if cancelled
 */
export function selectImageFile(multiple: true): Promise<FileList | null>
export function selectImageFile(multiple?: false): Promise<File | null>
export function selectImageFile(multiple = false): Promise<File | FileList | null> {
  return selectFile({
    accept: 'image/*',
    multiple,
  })
}

/**
 * Select video file(s)
 * @param multiple - Allow multiple file selection
 * @returns Promise that resolves to selected video File(s) or null if cancelled
 */
export function selectVideoFile(multiple: true): Promise<FileList | null>
export function selectVideoFile(multiple?: false): Promise<File | null>
export function selectVideoFile(multiple = false): Promise<File | FileList | null> {
  return selectFile({
    accept: 'video/*',
    multiple,
  })
}

/**
 * Select audio file(s)
 * @param multiple - Allow multiple file selection
 * @returns Promise that resolves to selected audio File(s) or null if cancelled
 */
export function selectAudioFile(multiple: true): Promise<FileList | null>
export function selectAudioFile(multiple?: false): Promise<File | null>
export function selectAudioFile(multiple = false): Promise<File | FileList | null> {
  return selectFile({
    accept: 'audio/*',
    multiple,
  })
}
