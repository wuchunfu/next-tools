<script setup lang="ts">
import { onMounted, ref } from 'vue'

export interface ShadowRootExpose {
  shadow_root: ShadowRoot|null
}

const props = defineProps<{
  mode?: 'open' | 'closed'
}>()

const emit = defineEmits<{
  mounted: [shadowRoot: ShadowRoot]
}>()

const containerRef = ref<HTMLElement>()
let shadowRoot: ShadowRoot | null = null

// Expose shadow root with lazy getter (available after onMounted)
defineExpose<ShadowRootExpose>({
  get shadow_root() {
    return shadowRoot
  }
})

onMounted(() => {
  if (containerRef.value && !containerRef.value.shadowRoot) {
    shadowRoot = containerRef.value.attachShadow({
      mode: props.mode || 'open'
    })
    emit('mounted', shadowRoot)
  }
})
</script>

<template>
  <div ref="containerRef">
    <slot />
  </div>
</template>
