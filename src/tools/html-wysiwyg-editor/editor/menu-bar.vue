<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3';
import type { Component } from 'vue'
import {
  ArrowBack,
  ArrowForwardUp,
  Blockquote,
  Bold,
  ClearFormatting,
  Code,
  CodePlus,
  H1,
  H2,
  H3,
  H4,
  Italic,
  List,
  ListNumbers,
  Strikethrough,
  TextWrap,
} from '@vicons/tabler'

import { Separator } from '@/components/ui/separator'
import { useToolI18n } from '@/composable/useToolI18n'
import MenuBarItem from './menu-bar-item.vue'

const props = defineProps<{ editor: Editor }>();
const { editor } = toRefs(props);
const { t } = useToolI18n();

type MenuItem =
  | {
    icon: Component
    title: string
    action: () => void
    isActive?: () => boolean
    type: 'button'
  }
  | { type: 'divider' }

const items = computed<MenuItem[]>(() => [
  {
    type: 'button',
    icon: Bold,
    title: t('tools.html-wysiwyg-editor.toolbar.bold'),
    action: () => editor.value.chain().focus().toggleBold().run(),
    isActive: () => editor.value.isActive('bold'),
  },
  {
    type: 'button',
    icon: Italic,
    title: t('tools.html-wysiwyg-editor.toolbar.italic'),
    action: () => editor.value.chain().focus().toggleItalic().run(),
    isActive: () => editor.value.isActive('italic'),
  },
  {
    type: 'button',
    icon: Strikethrough,
    title: t('tools.html-wysiwyg-editor.toolbar.strike'),
    action: () => editor.value.chain().focus().toggleStrike().run(),
    isActive: () => editor.value.isActive('strike'),
  },
  {
    type: 'button',
    icon: Code,
    title: t('tools.html-wysiwyg-editor.toolbar.inline'),
    action: () => editor.value.chain().focus().toggleCode().run(),
    isActive: () => editor.value.isActive('code'),
  },
  { type: 'divider' },
  {
    type: 'button',
    icon: H1,
    title: t('tools.html-wysiwyg-editor.toolbar.h1'),
    action: () => editor.value.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: () => editor.value.isActive('heading', { level: 1 }),
  },
  {
    type: 'button',
    icon: H2,
    title: t('tools.html-wysiwyg-editor.toolbar.h2'),
    action: () => editor.value.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: () => editor.value.isActive('heading', { level: 2 }),
  },
  {
    type: 'button',
    icon: H3,
    title: t('tools.html-wysiwyg-editor.toolbar.h3'),
    action: () => editor.value.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: () => editor.value.isActive('heading', { level: 3 }),
  },
  {
    type: 'button',
    icon: H4,
    title: t('tools.html-wysiwyg-editor.toolbar.h4'),
    action: () => editor.value.chain().focus().toggleHeading({ level: 4 }).run(),
    isActive: () => editor.value.isActive('heading', { level: 4 }),
  },
  { type: 'divider' },
  {
    type: 'button',
    icon: List,
    title: t('tools.html-wysiwyg-editor.toolbar.bullet'),
    action: () => editor.value.chain().focus().toggleBulletList().run(),
    isActive: () => editor.value.isActive('bulletList'),
  },
  {
    type: 'button',
    icon: ListNumbers,
    title: t('tools.html-wysiwyg-editor.toolbar.ordered'),
    action: () => editor.value.chain().focus().toggleOrderedList().run(),
    isActive: () => editor.value.isActive('orderedList'),
  },
  {
    type: 'button',
    icon: CodePlus,
    title: t('tools.html-wysiwyg-editor.toolbar.codeBlock'),
    action: () => editor.value.chain().focus().toggleCodeBlock().run(),
    isActive: () => editor.value.isActive('codeBlock'),
  },
  {
    type: 'button',
    icon: Blockquote,
    title: t('tools.html-wysiwyg-editor.toolbar.blockquote'),
    action: () => editor.value.chain().focus().toggleBlockquote().run(),
    isActive: () => editor.value.isActive('blockquote'),
  },
  { type: 'divider' },
  {
    type: 'button',
    icon: TextWrap,
    title: t('tools.html-wysiwyg-editor.toolbar.hardBreak'),
    action: () => editor.value.chain().focus().setHardBreak().run(),
  },
  {
    type: 'button',
    icon: ClearFormatting,
    title: t('common.clear'),
    action: () => editor.value.chain().focus().clearNodes().unsetAllMarks().run(),
  },
  {
    type: 'button',
    icon: ArrowBack,
    title: t('tools.html-wysiwyg-editor.toolbar.undo'),
    action: () => editor.value.chain().focus().undo().run(),
  },
  {
    type: 'button',
    icon: ArrowForwardUp,
    title: t('tools.html-wysiwyg-editor.toolbar.redo'),
    action: () => editor.value.chain().focus().redo().run(),
  },
]);
</script>

<template>
  <div class="flex items-center gap-1 overflow-x-auto whitespace-nowrap p-2">
    <template v-for="(item, index) in items">
      <Separator
        v-if="item.type === 'divider'"
        :key="`divider${index}`"
        orientation="vertical"
        class="mx-1 h-6"
      />
      <MenuBarItem v-else-if="item.type === 'button'" :key="index" v-bind="item" />
    </template>
  </div>
</template>
