import { jwtDecode, type JwtHeader, type JwtPayload } from 'jwt-decode'
import { isArray, isNil, isPlainObject, isString, map } from 'lodash-es'

type Translator = (key: string, defaultValue?: string) => string

export function decodeJwt({ jwt, t }: { jwt: string, t?: Translator }) {
  const translator = t || ((key: string, defaultValue?: string) => defaultValue || key)
  const rawHeader = jwtDecode<JwtHeader>(jwt, { header: true })
  const rawPayload = jwtDecode<JwtPayload>(jwt)

  const header = map(rawHeader, (value, claim) => parseClaims({ claim, value, t: translator }))
  const payload = map(rawPayload, (value, claim) => parseClaims({ claim, value, t: translator }))

  return {
    header,
    payload,
  }
}

function parseClaims({ claim, value, t }: { claim: string, value: unknown, t: Translator }) {
  const claimDescription = t(`tools.jwt-parser.claims.${claim}`, undefined)
  const formattedValue = isPlainObject(value) || isArray(value) ? JSON.stringify(value, null, 3) : String(value)
  const friendlyValue = getFriendlyValue({ claim, value, t })

  return {
    value: formattedValue,
    friendlyValue,
    claim,
    claimDescription,
  }
}

function getFriendlyValue({ claim, value, t }: { claim: string, value: unknown, t: Translator }) {
  if (['exp', 'nbf', 'iat'].includes(claim)) {
    return dateFormatter(value)
  }

  if (claim === 'alg' && isString(value)) {
    return t(`tools.jwt-parser.algorithms.${value}`, undefined)
  }

  return undefined
}

function dateFormatter(value: unknown) {
  if (isNil(value)) {
    return undefined
  }

  const date = new Date(Number(value) * 1000)
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
}
