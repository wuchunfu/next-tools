export interface HSV { h: number, s: number, v: number }
export type HSVA = HSV & { a: number }
export interface RGB { r: number, g: number, b: number }
export type RGBA = RGB & { a: number }
export interface HSL { h: number, s: number, l: number }
export type HSLA = HSL & { a: number }
export type Hex = string
export type Hexa = string
export type Format = 'hex' | 'hexa' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'hsv' | 'hsva' | 'object'
export interface ColorObject {
  rgb: RGB
  rgba: RGBA
  hsl: HSL
  hsla: HSLA
  hsv: HSV
  hsva: HSVA
  hex: Hex
  hexa: Hexa
}
