<script setup lang="ts">
import DomPurify from 'dompurify';
import { marked } from 'marked';
import { markdownBodyClasses } from '@/utils/markdown'

const props = withDefaults(defineProps<{ markdown?: string }>(), { markdown: '' })
const { markdown } = toRefs(props)

// Configure marked renderer for links

const markedValue = computedAsync(() => marked(markdown.value), '');
const html = computed(() => DomPurify.sanitize(markedValue.value, { ADD_ATTR: ['target'] }))
</script>

<template>
  <div :class="markdownBodyClasses" v-html="html" />
</template>
