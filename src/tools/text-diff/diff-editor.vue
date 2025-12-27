<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { editor as monacoEditor } from 'monaco-editor';
import { cn } from '@/lib/utils';
import { useStyleStore } from '@/stores/style.store';

const props = withDefaults(defineProps<{ options?: monacoEditor.IDiffEditorOptions, class?: HTMLAttributes['class'] }>(), { options: () => ({}), class: '' })
const { options, class: className } = toRefs(props)

const editorContainer = ref<HTMLElement | null>(null)
let editor: monacoEditor.IStandaloneDiffEditor | null = null

monacoEditor.defineTheme('next-tools-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#00000000',
  },
})

monacoEditor.defineTheme('next-tools-light', {
  base: 'vs',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#00000000',
  },
})

const styleStore = useStyleStore()

watch(
  () => styleStore.isDarkTheme,
  isDarkTheme => monacoEditor.setTheme(isDarkTheme ? 'next-tools-dark' : 'next-tools-light'),
  { immediate: true },
)

watch(
  () => options.value,
  options => editor?.updateOptions(options),
  { immediate: true, deep: true },
)

useResizeObserver(editorContainer, () => {
  editor?.layout()
});

onMounted(() => {
  if (!editorContainer.value) {
    return
  }

  editor = monacoEditor.createDiffEditor(editorContainer.value, {
    originalEditable: true,
    minimap: {
      enabled: false,
    },
  })

  editor.setModel({
    original: monacoEditor.createModel('', 'txt'),
    modified: monacoEditor.createModel('', 'txt'),
  })
});
</script>

<template>
  <div ref="editorContainer" :class="cn('h-120', className)" />
</template>
