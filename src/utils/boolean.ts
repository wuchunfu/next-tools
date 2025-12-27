export function isNotThrowing(cb: () => unknown): boolean {
  try {
    cb()
    return true
  }
  catch {
    return false
  }
}

export function booleanToHumanReadable(value: boolean, t?: (key: string) => string): string {
  // If translation function is provided, use it with global boolean keys
  if (t) {
    return value ? t('boolean.true') : t('boolean.false')
  }

  // Fallback to hardcoded English labels
  return value ? 'Yes' : 'No'
}
