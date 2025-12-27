import type { ColorObject } from '@/components/color-picker/utils/types'

export function hexToColorObject(hex: string): ColorObject {
  const cleanHex = hex.replace('#', '')
  const hasAlpha = cleanHex.length === 8
  const r = Number.parseInt(cleanHex.slice(0, 2), 16)
  const g = Number.parseInt(cleanHex.slice(2, 4), 16)
  const b = Number.parseInt(cleanHex.slice(4, 6), 16)
  const a = hasAlpha ? Number.parseInt(cleanHex.slice(6, 8), 16) / 255 : 1

  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === r / 255) {
      h = ((g / 255 - b / 255) / delta) % 6;
    }
    else if (max === g / 255) {
      h = (b / 255 - r / 255) / delta + 2;
    }
    else { h = (r / 255 - g / 255) / delta + 4 }
    h = Math.round(h * 60)
    if (h < 0) { h += 360 }
  }

  const l = (max + min) / 2
  const sHSL = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))
  const v = max
  const sHSV = max === 0 ? 0 : delta / max

  return {
    rgb: { r, g, b },
    rgba: { r, g, b, a },
    hsl: { h, s: sHSL * 100, l: l * 100 },
    hsla: { h, s: sHSL * 100, l: l * 100, a },
    hsv: { h, s: sHSV * 100, v: v * 100 },
    hsva: { h, s: sHSV * 100, v: v * 100, a },
    hex: `#${cleanHex.slice(0, 6)}`,
    hexa: hex.startsWith('#') ? hex : `#${hex}`,
  }
}
