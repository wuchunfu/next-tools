<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { injectColorPickerContext } from './provider'

interface Props {
  class?: string
}

const props = defineProps<Props>()
const rootContext = injectColorPickerContext()

const isSupported = computed(() => typeof window !== 'undefined' && !!(window as any).EyeDropper)

function openEyeDropper() {
  const EyeDropperCtor = (window as any).EyeDropper
  const eyeDropper = new EyeDropperCtor()
  eyeDropper
    .open()
    .then((result: { sRGBHex: string }) => {
      rootContext.hexa.value = result.sRGBHex
    })
    .catch(() => {})
}
</script>

<template>
  <Button
    v-if="isSupported"
    variant="outline"
    size="icon"
    :class="props.class"
    :disabled="rootContext.disabled.value"
    @click="openEyeDropper"
  >
    <slot />
  </Button>
</template>
