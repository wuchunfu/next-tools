import type { CountryCode, NumberType } from 'libphonenumber-js/types'
import countries from 'i18n-iso-countries'

const typeToLabel: Record<NonNullable<NumberType>, string> = {
  MOBILE: 'Mobile',
  FIXED_LINE: 'Fixed line',
  FIXED_LINE_OR_MOBILE: 'Fixed line or mobile',
  PERSONAL_NUMBER: 'Personal number',
  PREMIUM_RATE: 'Premium rate',
  SHARED_COST: 'Shared cost',
  TOLL_FREE: 'Toll free',
  UAN: 'Universal access number',
  VOICEMAIL: 'Voicemail',
  VOIP: 'VoIP',
  PAGER: 'Pager',
}

export function formatTypeToHumanReadable(type: NumberType, t?: (key: string) => string): string | undefined {
  if (!type) {
    return undefined
  }

  // If translation function is provided, use it with tool-specific keys
  if (t) {
    return t(`tools.phone-parser-and-formatter.types.${type}`)
  }

  // Fallback to hardcoded English labels
  return typeToLabel[type]
}

export function getFullCountryName(countryCode: string | undefined, lang = 'en') {
  if (!countryCode) {
    return undefined
  }

  return countries.getName(countryCode, lang)
}

export function getDefaultCountryCode({
  locale = window.navigator.language,
  defaultCode = 'US',
}: { locale?: string, defaultCode?: CountryCode } = {}): CountryCode {
  const countryCode = locale.split('-')[1]?.toUpperCase()

  if (!countryCode) {
    return defaultCode
  }

  // Check if the country code is valid
  return countries.isValid(countryCode) ? (countryCode as CountryCode) : defaultCode
}
