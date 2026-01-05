import type { HSL, HSLA, HSV, HSVA, RGB, RGBA } from './utils/types'
import { inject, provide } from 'vue'
import type { InjectionKey, Ref } from 'vue'

export interface ColorPickerRootContext {
  alpha: Ref<number>
  hsv: Ref<HSV>
  hsva: Ref<HSVA>
  hsl: Ref<HSL>
  hsla: Ref<HSLA>
  rgb: Ref<RGB>
  rgba: Ref<RGBA>
  hex: Ref<string>
  hexa: Ref<string>
  disabled: Ref<boolean>
  isAlphaEnabled: Ref<boolean>
  commitValue: () => void
}

const key = Symbol('ColorPickerRoot') as InjectionKey<ColorPickerRootContext>;

export function provideColorPickerContext(ctx: ColorPickerRootContext) {
  provide(key, ctx);
  return ctx;
}

export function injectColorPickerContext() {
  const ctx = inject(key);
  if (!ctx) {
    throw new Error('ColorPicker components must be used within ColorPickerRoot');
  }
  return ctx;
}
