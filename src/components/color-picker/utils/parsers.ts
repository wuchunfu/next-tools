import type { HSL, HSLA, HSV, HSVA, RGB, RGBA } from './types'

export function parseHex(hex: string): RGBA | null {
  const s = hex.trim()

  const m6 = s.match(/^#?(?<r>[A-F0-9]{2})(?<g>[A-F0-9]{2})(?<b>[A-F0-9]{2})$/i);
  if (m6?.groups) {
    const { r, g, b } = m6.groups
    return { r: Number.parseInt(r!, 16), g: Number.parseInt(g!, 16), b: Number.parseInt(b!, 16), a: 1 }
  }

  const m8 = s.match(/^#?(?<r>[A-F0-9]{2})(?<g>[A-F0-9]{2})(?<b>[A-F0-9]{2})(?<a>[A-F0-9]{2})$/i);
  if (m8?.groups) {
    const { r, g, b, a } = m8.groups
    return { r: Number.parseInt(r!, 16), g: Number.parseInt(g!, 16), b: Number.parseInt(b!, 16), a: Number.parseInt(a!, 16) / 255 }
  }

  const m3 = s.match(/^#?(?<r>[A-F0-9])(?<g>[A-F0-9])(?<b>[A-F0-9])$/i);
  if (m3?.groups) {
    const { r, g, b } = m3.groups as { r: string, g: string, b: string }
    const rr = r + r; const gg = g + g; const bb = b + b
    return { r: Number.parseInt(rr, 16), g: Number.parseInt(gg, 16), b: Number.parseInt(bb, 16), a: 1 }
  }

  const m4 = s.match(/^#?(?<r>[A-F0-9])(?<g>[A-F0-9])(?<b>[A-F0-9])(?<a>[A-F0-9])$/i);
  if (m4?.groups) {
    const { r, g, b, a } = m4.groups as { r: string, g: string, b: string, a: string }
    const rr = r + r; const gg = g + g; const bb = b + b; const aa = a + a
    return { r: Number.parseInt(rr, 16), g: Number.parseInt(gg, 16), b: Number.parseInt(bb, 16), a: Number.parseInt(aa, 16) / 255 }
  }

  return null
}

function baseParser(str: string) {
  const colorRegex = /^([a-z]{3,4})\(\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+)%?)\s*,\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+)%?)\s*,\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+)%?)(?:\s*,\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+)%?))?\s*\)$/i
  const match = str.match(colorRegex)
  if (!match) { return null }
  const [, type, c1, c2, c3, c4] = match
  return { type, values: [c1, c2, c3, c4].filter(Boolean) }
}

function parsedToPercentage(value: string): number {
  return value.endsWith('%') ? Number.parseFloat(value) / 100 : Number.parseFloat(value)
}

export function parseRGB(str: string): RGB {
  const parsed = baseParser(str)
  if (parsed && parsed.type?.toLowerCase() === 'rgb') {
    return { r: Number.parseInt(parsed.values[0] as string, 10), g: Number.parseInt(parsed.values[1] as string, 10), b: Number.parseInt(parsed.values[2] as string, 10) }
  }
  return { r: 255, g: 0, b: 0 }
}

export function parseRGBA(str: string): RGBA {
  const parsed = baseParser(str)
  if (parsed && parsed.type?.toLowerCase() === 'rgb') {
    return {
      r: Number.parseInt(parsed.values[0] as string, 10),
      g: Number.parseInt(parsed.values[1] as string, 10),
      b: Number.parseInt(parsed.values[2] as string, 10),
      a: parsed.values[3] ? Number.parseFloat(parsed.values[3] as string) : 1,
    }
  }
  return { r: 255, g: 0, b: 0, a: 1 }
}

export function parseHSL(str: string): HSL {
  const parsed = baseParser(str)
  if (parsed && parsed.type?.toLowerCase() === 'hsl') {
    return {
      h: Number.parseFloat(parsed.values[0] as string),
      s: parsedToPercentage(parsed.values[1] as string),
      l: parsedToPercentage(parsed.values[2] as string),
    }
  }
  return { h: 0, s: 0, l: 0 }
}

export function parseHSLA(str: string): HSLA {
  const parsed = baseParser(str)
  if (parsed && parsed.type?.toLowerCase() === 'hsla') {
    return {
      h: Number.parseFloat(parsed.values[0] as string),
      s: parsedToPercentage(parsed.values[1] as string),
      l: parsedToPercentage(parsed.values[2] as string),
      a: parsed.values[3] ? Number.parseFloat(parsed.values[3] as string) : 1,
    }
  }
  return { h: 0, s: 0, l: 0, a: 1 }
}

export function parseHSV(str: string): HSV {
  const parsed = baseParser(str)
  if (parsed && parsed.type?.toLowerCase() === 'hsv') {
    return {
      h: Number.parseFloat(parsed.values[0] as string),
      s: parsedToPercentage(parsed.values[1] as string),
      v: parsedToPercentage(parsed.values[2] as string),
    }
  }
  return { h: 0, s: 0, v: 0 }
}

export function parseHSVA(str: string): HSVA {
  const parsed = baseParser(str)
  if (parsed && parsed.type?.toLowerCase() === 'hsva') {
    return {
      h: Number.parseFloat(parsed.values[0] as string),
      s: parsedToPercentage(parsed.values[1] as string),
      v: parsedToPercentage(parsed.values[2] as string),
      a: parsed.values[3] ? Number.parseFloat(parsed.values[3] as string) : 1,
    }
  }
  return { h: 0, s: 0, v: 0, a: 1 }
}
