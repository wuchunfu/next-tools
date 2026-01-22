/**
 * URL Parser Service
 * 
 * Provides business logic for parsing URLs and extracting components.
 * Handles query parameter parsing with support for duplicate keys.
 */

export interface UrlProperty {
  title: string
  key: keyof URL
}

export interface ParsedUrl {
  url: URL
  properties: UrlProperty[]
  searchParams: Array<[string, string]>
}

/**
 * Parse a URL string and extract its components
 * 
 * @param urlString - URL string to parse
 * @returns Parsed URL object with components, or undefined if invalid
 */
export function parseUrl(urlString: string): URL | undefined {
  if (!urlString.trim()) {
    return undefined
  }

  try {
    return new URL(urlString)
  } catch {
    return undefined
  }
}

/**
 * Validate if a string is a valid URL
 * 
 * @param urlString - String to validate
 * @returns True if valid URL, false otherwise
 */
export function isValidUrl(urlString: string): boolean {
  if (!urlString.trim()) {
    return true // Empty string is considered valid (no error state)
  }

  try {
    const url = new URL(urlString)
    void url // Use the URL object to avoid no-new linting error
    return true
  }
  catch {
    return false
  }
}

/**
 * Extract non-empty URL properties from a parsed URL
 * 
 * @param url - Parsed URL object
 * @param allProperties - All possible URL properties to check
 * @returns Array of properties that have non-empty values
 */
export function extractUrlProperties(
  url: URL,
  allProperties: UrlProperty[],
): UrlProperty[] {
  return allProperties.filter(({ key }) => {
    const value = url[key] as string
    return value && value.trim() !== ''
  })
}

/**
 * Parse URL search parameters with support for duplicate keys
 * 
 * When a query parameter appears multiple times (e.g., key=value1&key=value2),
 * this function returns them as key[0], key[1], etc.
 * 
 * @param url - Parsed URL object
 * @returns Array of [key, value] tuples with indexed keys for duplicates
 * 
 * @example
 * Input: ?key=value&keyarr=value1&keyarr=value2
 * Output: [['key', 'value'], ['keyarr[0]', 'value1'], ['keyarr[1]', 'value2']]
 */
export function parseSearchParams(url: URL): Array<[string, string]> {
  const params: Array<[string, string]> = []
  const keyCount = new Map<string, number>()

  // First pass: collect all parameters and count occurrences
  for (const [key, value] of url.searchParams.entries()) {
    const count = keyCount.get(key) || 0
    keyCount.set(key, count + 1)

    // Add index if the key is duplicated
    const displayKey = count > 0 ? `${key}[${count}]` : key
    params.push([displayKey, value])
  }

  // Second pass: add [0] index to first occurrence of duplicate keys
  const finalParams: Array<[string, string]> = []
  const processedKeys = new Set<string>()

  for (const [key, value] of params) {
    const baseKey = key.replace(/\[\d+\]$/, '')
    const totalCount = keyCount.get(baseKey) || 0

    if (totalCount > 1 && !processedKeys.has(baseKey)) {
      // First occurrence of this duplicate key, add [0] index
      processedKeys.add(baseKey)
      finalParams.push([`${baseKey}[0]`, value])
    } else {
      finalParams.push([key, value])
    }
  }

  return finalParams
}

