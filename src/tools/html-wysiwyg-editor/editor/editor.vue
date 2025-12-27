<script setup lang="ts">
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'
import { tryOnBeforeUnmount, useVModel } from '@vueuse/core'

import { Separator } from '@/components/ui/separator'
import MenuBar from './menu-bar.vue'

const props = defineProps<{ html: string }>();
const emit = defineEmits(['update:html']);
const html = useVModel(props, 'html', emit);

const editor = new Editor({
  content: html.value,
  extensions: [StarterKit],
});

editor.on('update', ({ editor }) => emit('update:html', editor.getHTML()));

tryOnBeforeUnmount(() => {
  editor.destroy();
})

const contentClasses
  = 'rounded-md bg-card text-base leading-relaxed text-foreground '
    + '[&_.ProseMirror-focused]:outline-none '
    + '[&_.ProseMirror]:font-sans '
    + '[&_.ProseMirror>*+*]:mt-3 '
    + '[&_.ProseMirror_p]:m-0 '
    + '[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 '
    + '[&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:leading-tight '
    + '[&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:leading-tight '
    + '[&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:leading-tight '
    + '[&_.ProseMirror_h4]:text-lg [&_.ProseMirror_h4]:font-semibold [&_.ProseMirror_h4]:leading-tight '
  + '[&_.ProseMirror_h5]:text-base [&_.ProseMirror_h5]:font-semibold [&_.ProseMirror_h5]:leading-tight '
  + '[&_.ProseMirror_h6]:text-sm [&_.ProseMirror_h6]:font-semibold [&_.ProseMirror_h6]:uppercase [&_.ProseMirror_h6]:tracking-wide '
  + '[&_.ProseMirror_code]:bg-muted [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:text-[0.9em] '
  + '[&_.ProseMirror_pre]:bg-muted [&_.ProseMirror_pre]:font-mono [&_.ProseMirror_pre]:px-4 [&_.ProseMirror_pre]:py-3 [&_.ProseMirror_pre]:rounded-lg '
  + '[&_.ProseMirror_pre_code]:bg-transparent [&_.ProseMirror_pre_code]:p-0 [&_.ProseMirror_pre_code]:text-sm '
  + '[&_.ProseMirror_mark]:bg-[#faf594] '
  + '[&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:h-auto '
  + '[&_.ProseMirror_hr]:border-0 [&_.ProseMirror_hr]:border-t [&_.ProseMirror_hr]:border-muted-foreground/30 [&_.ProseMirror_hr]:my-5 '
  + '[&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:border-l-2 [&_.ProseMirror_blockquote]:border-muted-foreground/30 [&_.ProseMirror_blockquote]:text-muted-foreground [&_.ProseMirror_blockquote]:italic '
  + '[&_.ProseMirror_ul[data-type=\"taskList\"]]:list-none [&_.ProseMirror_ul[data-type=\"taskList\"]]:p-0 '
  + '[&_.ProseMirror_ul[data-type=\"taskList\"]_li]:flex [&_.ProseMirror_ul[data-type=\"taskList\"]_li]:items-center [&_.ProseMirror_ul[data-type=\"taskList\"]_li]:gap-2 '
  + '[&_.ProseMirror_ul[data-type=\"taskList\"]_li_label]:select-none'
</script>

<template>
  <div>
    <div class="sticky top-0 z-10 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div class="flex items-center gap-1 overflow-x-auto">
        <MenuBar :editor="editor" />
      </div>
      <Separator />
    </div>
    <div :class="contentClasses">
      <EditorContent :editor="editor" class="p-2" />
    </div>
  </div>
</template>
