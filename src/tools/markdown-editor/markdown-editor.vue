<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3';
import { useStorage, useMagicKeys, whenever } from '@vueuse/core';
import { FileEdit, FileText, Code2, Download, Trash2, Copy, Keyboard } from 'lucide-vue-next';
import { computed, watch, ref, nextTick } from 'vue';
import { useCopy } from '@/composable/copy';
import { useToolI18n } from '@/composable/useToolI18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Kbd } from '@/components/ui/kbd';
import { 
  getMarkdownFromHtml, 
  getHtmlFromMarkdown,
  getEditorExtensions,
  downloadMarkdown,
  formatShortcut,
  DEFAULT_MARKDOWN_CONTENT,
  EDITOR_CLASSES
} from './markdown-editor.service';
import { fileToBase64 } from '@/utils/base64';
import { selectImageFile } from '@/utils/file';

const { t } = useToolI18n();
const { copy } = useCopy({ createToast: true });

// Detect operating system
const isMac = computed(() => window.navigator.userAgent.toLowerCase().includes('mac'));

// ============================================
// Core Architecture: Markdown is the single source of truth
// ============================================

// Single source of truth: Markdown text
const markdown = useStorage('markdown-editor--content', DEFAULT_MARKDOWN_CONTENT);

// Current view mode
const viewMode = useStorage<'edit' | 'source' | 'split'>('markdown-editor--view-mode', 'edit');

// Flag: prevent circular updates
let isUpdatingFromEditor = false;

// ============================================
// Editor Initialization
// ============================================

// Get editor extensions from service layer
const editorExtensions = getEditorExtensions();

// Main editor (for "edit" mode)
const editor = useEditor({
  content: getHtmlFromMarkdown(markdown.value),
  extensions: editorExtensions,
  editorProps: {
    attributes: {
      class: 'prose prose-sm md:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-125 h-full p-4',
    },
  },
  onUpdate: ({ editor }) => {
    if (isUpdatingFromEditor) return;
    // Editor changes → Convert to Markdown → Update data source
    const html = editor.getHTML();
    markdown.value = getMarkdownFromHtml(html);
  },
});

// Split editor (for right side of "split" mode)
const splitEditor = useEditor({
  content: getHtmlFromMarkdown(markdown.value),
  extensions: editorExtensions,
  editorProps: {
    attributes: {
      class: 'prose prose-sm md:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-125 h-full p-4',
    },
  },
  onUpdate: ({ editor }) => {
    if (isUpdatingFromEditor) return;
    // Editor changes → Convert to Markdown → Update data source
    const html = editor.getHTML();
    markdown.value = getMarkdownFromHtml(html);
  },
});

// ============================================
// Data Synchronization Logic
// ============================================

// Watch Markdown data source changes and sync to editors
watch(markdown, (newMarkdown) => {
  const html = getHtmlFromMarkdown(newMarkdown);
  
  isUpdatingFromEditor = true;
  
  // Update main editor (if in edit mode and not focused)
  if (editor.value && viewMode.value === 'edit' && !editor.value.isFocused) {
    const currentHtml = editor.value.getHTML();
    // Only update if content actually changed to avoid unnecessary re-renders
    if (currentHtml !== html) {
      editor.value.commands.setContent(html, { emitUpdate: false });
    }
  }
  
  // Update split editor (if in split mode and not focused)
  if (splitEditor.value && viewMode.value === 'split' && !splitEditor.value.isFocused) {
    const currentHtml = splitEditor.value.getHTML();
    // Only update if content actually changed to avoid unnecessary re-renders
    if (currentHtml !== html) {
      splitEditor.value.commands.setContent(html, { emitUpdate: false });
    }
  }
  
  nextTick(() => {
    isUpdatingFromEditor = false;
  });
});

// Watch view mode changes and sync editor content
watch(viewMode, (newMode) => {
  const html = getHtmlFromMarkdown(markdown.value);
  
  isUpdatingFromEditor = true;
  
  if (newMode === 'edit' && editor.value) {
    editor.value.commands.setContent(html, { emitUpdate: false });
  } else if (newMode === 'split' && splitEditor.value) {
    splitEditor.value.commands.setContent(html, { emitUpdate: false });
  }
  
  nextTick(() => {
    isUpdatingFromEditor = false;
  });
});

// ============================================
// Computed Properties and Utility Functions
// ============================================

// TipTap editor style classes (imported from service)
const editorClasses = EDITOR_CLASSES;

function handleClear() {
  markdown.value = '';
  editor.value?.commands.setContent('');
  splitEditor.value?.commands.setContent('');
}

// Download Markdown file (using service function)
function handleDownload() {
  downloadMarkdown(markdown.value);
}

// Copy Markdown
function handleCopyMarkdown() {
  copy(markdown.value);
}

// ============================================
// Keyboard Shortcuts
// ============================================

// Get active editor based on view mode
const activeEditor = computed(() => {
  if (viewMode.value === 'edit') return editor.value;
  if (viewMode.value === 'split') return splitEditor.value;
  return null;
});

// Setup keyboard shortcuts
const keys = useMagicKeys({
  passive: false,
  onEventFired(e) {
    const isCmdPressed = isMac.value ? e.metaKey : e.ctrlKey;
    const isShiftPressed = e.shiftKey;
    
    // Only prevent default for keydown events
    if (e.type !== 'keydown') return;
    
    // Prevent default for all our custom shortcuts
    if (isCmdPressed) {
      // Single key shortcuts
      if (['s', 'b', 'i', 'u', 'z', 'l'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return;
      }
      
      // Number keys (headings)
      if (['0', '1', '2', '3', '4', '5', '6'].includes(e.key)) {
        e.preventDefault();
        return;
      }
      
      // Shift combinations (only for task list and redo)
      if (isShiftPressed) {
        if (['x', 'z'].includes(e.key.toLowerCase())) {
          e.preventDefault();
          return;
        }
      }
      
      // Alt/Option combinations (on Mac, altKey corresponds to Option key)
      if (e.altKey) {
        if (['x', 'h', 'c', 'q', 'u', 'o', 't'].includes(e.key.toLowerCase())) {
          e.preventDefault();
          
        }
      }
    }
  },
});

// ============================================
// Text Formatting Shortcuts
// ============================================

// Bold: Ctrl/Cmd + B
whenever(() => isMac.value ? keys['meta+b']?.value : keys['ctrl+b']?.value, () => {
  activeEditor.value?.chain().focus().toggleBold().run();
});

// Italic: Ctrl/Cmd + I
whenever(() => isMac.value ? keys['meta+i']?.value : keys['ctrl+i']?.value, () => {
  activeEditor.value?.chain().focus().toggleItalic().run();
});

// Underline: Ctrl/Cmd + U
whenever(() => isMac.value ? keys['meta+u']?.value : keys['ctrl+u']?.value, () => {
  activeEditor.value?.chain().focus().toggleUnderline().run();
});

// Strikethrough: Ctrl/Cmd + Shift + X
whenever(() => isMac.value ? keys['meta+shift+x']?.value : keys['ctrl+shift+x']?.value, () => {
  activeEditor.value?.chain().focus().toggleStrike().run();
});

// Highlight: Ctrl/Cmd + Alt + H
whenever(() => {
  const key = isMac.value ? (keys['meta+option+h']?.value || keys['meta+alt+h']?.value) : keys['ctrl+alt+h']?.value;
  return key ?? false;
}, () => {
  activeEditor.value?.chain().focus().toggleHighlight().run();
});

// Link: Ctrl/Cmd + L
whenever(() => isMac.value ? keys['meta+l']?.value : keys['ctrl+l']?.value, () => {
  openLinkDialog();
});

// ============================================
// Paragraph Formatting Shortcuts
// ============================================

// Paragraph (clear heading): Ctrl/Cmd + 0
whenever(() => isMac.value ? keys['meta+0']?.value : keys['ctrl+0']?.value, () => {
  activeEditor.value?.chain().focus().setParagraph().run();
});

// Heading shortcuts: Ctrl/Cmd + 1-6
whenever(() => isMac.value ? keys['meta+1']?.value : keys['ctrl+1']?.value, () => {
  activeEditor.value?.chain().focus().toggleHeading({ level: 1 }).run();
});
whenever(() => isMac.value ? keys['meta+2']?.value : keys['ctrl+2']?.value, () => {
  activeEditor.value?.chain().focus().toggleHeading({ level: 2 }).run();
});
whenever(() => isMac.value ? keys['meta+3']?.value : keys['ctrl+3']?.value, () => {
  activeEditor.value?.chain().focus().toggleHeading({ level: 3 }).run();
});
whenever(() => isMac.value ? keys['meta+4']?.value : keys['ctrl+4']?.value, () => {
  activeEditor.value?.chain().focus().toggleHeading({ level: 4 }).run();
});
whenever(() => isMac.value ? keys['meta+5']?.value : keys['ctrl+5']?.value, () => {
  activeEditor.value?.chain().focus().toggleHeading({ level: 5 }).run();
});
whenever(() => isMac.value ? keys['meta+6']?.value : keys['ctrl+6']?.value, () => {
  activeEditor.value?.chain().focus().toggleHeading({ level: 6 }).run();
});
// Code block: Ctrl/Cmd + Alt + C (Mac: Cmd + Option + C)
whenever(() => {
  const key = isMac.value ? keys['meta+option+c']?.value : keys['ctrl+alt+c']?.value;
  return key ?? false;
}, () => {
  activeEditor.value?.chain().focus().toggleCodeBlock().run();
});

// Quote: Ctrl/Cmd + Alt + Q
whenever(() => {
  const key = isMac.value ? (keys['meta+option+q']?.value || keys['meta+alt+q']?.value) : keys['ctrl+alt+q']?.value;
  return key ?? false;
}, () => {
  activeEditor.value?.chain().focus().toggleBlockquote().run();
});

// ============================================
// List Shortcuts
// ============================================

// Bullet list: Ctrl/Cmd + Alt + U
whenever(() => {
  const key = isMac.value ? (keys['meta+option+u']?.value || keys['meta+alt+u']?.value) : keys['ctrl+alt+u']?.value;
  return key ?? false;
}, () => {
  activeEditor.value?.chain().focus().toggleBulletList().run();
});

// Ordered list: Ctrl/Cmd + Alt + O
whenever(() => {
  const key = isMac.value ? (keys['meta+option+o']?.value || keys['meta+alt+o']?.value) : keys['ctrl+alt+o']?.value;
  return key ?? false;
}, () => {
  activeEditor.value?.chain().focus().toggleOrderedList().run();
});

// Task list: Ctrl/Cmd + Alt + X
whenever(() => {
  const key = isMac.value ? (keys['meta+option+x']?.value || keys['meta+alt+x']?.value) : keys['ctrl+alt+x']?.value;
  return key ?? false;
}, () => {
  activeEditor.value?.chain().focus().toggleTaskList().run();
});

// ============================================
// Table Shortcuts
// ============================================

// Insert table: Ctrl/Cmd + Alt + T (Mac: Cmd + Option + T)
whenever(() => {
  const key = isMac.value ? keys['meta+option+t']?.value : keys['ctrl+alt+t']?.value;
  return key ?? false;
}, () => {
  openTableDialog();
});

// ============================================
// Action Shortcuts
// ============================================

// Download: Ctrl/Cmd + S
whenever(() => isMac.value ? keys['meta+s']?.value : keys['ctrl+s']?.value, () => {
  handleDownload();
});

// Undo: Ctrl/Cmd + Z
whenever(() => isMac.value ? keys['meta+z']?.value : keys['ctrl+z']?.value, () => {
  activeEditor.value?.chain().focus().undo().run();
});

// Redo: Ctrl/Cmd + Shift + Z
whenever(() => isMac.value ? keys['meta+shift+z']?.value : keys['ctrl+shift+z']?.value, () => {
  activeEditor.value?.chain().focus().redo().run();
});

// ============================================
// Dialog States and Handlers
// ============================================

// Link Dialog
const isLinkDialogOpen = ref(false);
const linkUrl = ref('');
const linkText = ref('');

function openLinkDialog() {
  // Get selected text if any
  const { from, to } = activeEditor.value?.state.selection || {};
  if (from !== undefined && to !== undefined && from !== to) {
    linkText.value = activeEditor.value?.state.doc.textBetween(from, to) || '';
  } else {
    linkText.value = '';
  }
  
  // Get current link if cursor is on a link
  const attrs = activeEditor.value?.getAttributes('link');
  linkUrl.value = attrs?.href || '';
  
  isLinkDialogOpen.value = true;
}

function handleLinkSubmit() {
  if (!linkUrl.value) return;
  
  if (linkText.value) {
    // Insert link with text
    activeEditor.value?.chain().focus().insertContent(`<a href="${linkUrl.value}">${linkText.value}</a>`).run();
  } else {
    // Just set link on selected text
    activeEditor.value?.chain().focus().setLink({ href: linkUrl.value }).run();
  }
  
  // Reset and close
  linkUrl.value = '';
  linkText.value = '';
  isLinkDialogOpen.value = false;
}

// Table Dialog
const isTableDialogOpen = ref(false);
const tableRows = ref(3);
const tableCols = ref(3);

function openTableDialog() {
  tableRows.value = 3;
  tableCols.value = 3;
  isTableDialogOpen.value = true;
}

function handleTableSubmit() {
  if (tableRows.value < 1 || tableCols.value < 1) return;
  
  activeEditor.value?.chain().focus().insertTable({ 
    rows: tableRows.value, 
    cols: tableCols.value, 
    withHeaderRow: true 
  }).run();
  
  isTableDialogOpen.value = false;
}

// Image Upload
async function openImageDialog() {
  try {
    const file = await selectImageFile();
    
    if (!file) {
      // User cancelled the selection
      return;
    }
    
    // Convert image to base64 and insert
    const base64 = await fileToBase64(file);
    activeEditor.value?.chain().focus().setImage({ src: base64 }).run();
  } catch (error) {
    console.error('Error uploading image:', error);
  }
}

// ============================================
// Shortcut Menu Actions
// ============================================

// Menu action handlers
const handleBold = () => activeEditor.value?.chain().focus().toggleBold().run();
const handleItalic = () => activeEditor.value?.chain().focus().toggleItalic().run();
const handleUnderline = () => activeEditor.value?.chain().focus().toggleUnderline().run();
const handleStrikethrough = () => activeEditor.value?.chain().focus().toggleStrike().run();
const handleHighlight = () => activeEditor.value?.chain().focus().toggleHighlight().run();
const handleLink = () => openLinkDialog();
const handleHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) => activeEditor.value?.chain().focus().toggleHeading({ level }).run();
const handleCodeBlock = () => activeEditor.value?.chain().focus().toggleCodeBlock().run();
const handleQuote = () => activeEditor.value?.chain().focus().toggleBlockquote().run();
const handleBulletList = () => activeEditor.value?.chain().focus().toggleBulletList().run();
const handleOrderedList = () => activeEditor.value?.chain().focus().toggleOrderedList().run();
const handleTaskList = () => activeEditor.value?.chain().focus().toggleTaskList().run();
const handleInsertTable = () => openTableDialog();
const handleInsertImage = () => openImageDialog();
const handleUndo = () => activeEditor.value?.chain().focus().undo().run();
const handleRedo = () => activeEditor.value?.chain().focus().redo().run();
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card>
      <CardContent class="space-y-4">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <Tabs v-model="viewMode" class="w-full md:w-auto">
            <TabsList class="w-full md:w-auto grid grid-cols-3 md:inline-flex">
              <TabsTrigger value="edit" class="gap-2">
                <FileEdit class="h-4 w-4" />
                <span class="hidden md:inline">{{ t('common.edit', 'Edit') }}</span>
              </TabsTrigger>
              <TabsTrigger value="source" class="gap-2">
                <FileText class="h-4 w-4" />
                <span class="hidden md:inline">{{ t('common.source', 'Source') }}</span>
              </TabsTrigger>
              <TabsTrigger value="split" class="gap-2">
                <Code2 class="h-4 w-4" />
                <span class="hidden md:inline">{{ t('common.split', 'Split') }}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div class="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="outline" size="sm" class="gap-2">
                  <Keyboard class="h-4 w-4" />
                  {{ t('tools.markdown-editor.insert.title', 'Insert') }}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-56">
                <DropdownMenuLabel>{{ t('tools.markdown-editor.insert.editing', 'Text Format') }}</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem @click="handleBold">
                    {{ t('tools.markdown-editor.insert.bold', 'Bold') }}
                    <DropdownMenuShortcut>{{ formatShortcut(isMac ? '⌘' : 'Ctrl', 'B') }}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleItalic">
                    {{ t('tools.markdown-editor.insert.italic', 'Italic') }}
                    <DropdownMenuShortcut>{{ formatShortcut(isMac ? '⌘' : 'Ctrl', 'I') }}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleUnderline">
                    {{ t('tools.markdown-editor.insert.underline', 'Underline') }}
                    <DropdownMenuShortcut>{{ formatShortcut(isMac ? '⌘' : 'Ctrl', 'U') }}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleStrikethrough">
                    {{ t('tools.markdown-editor.insert.strikethrough', 'Strikethrough') }}
                    <DropdownMenuShortcut>{{ formatShortcut(isMac ? '⌘' : 'Ctrl', '⇧', 'X') }}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleHighlight">
                    {{ t('tools.markdown-editor.insert.highlight', 'Highlight') }}
                    <DropdownMenuShortcut>{{ formatShortcut(isMac ? '⌘' : 'Ctrl', '⌥', 'H') }}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleLink">
                    {{ t('tools.markdown-editor.insert.link', 'Link') }}
                    <DropdownMenuShortcut>{{ formatShortcut(isMac ? '⌘' : 'Ctrl', 'L') }}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel>{{ t('tools.markdown-editor.insert.paragraph', 'Paragraph') }}</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem @click="() => activeEditor?.chain().focus().setParagraph().run()">
                    {{ t('tools.markdown-editor.insert.paragraph', 'Paragraph') }}
                    <DropdownMenuShortcut>{{ formatShortcut(isMac ? '⌘' : 'Ctrl', '0') }}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleHeading(1)">
                    {{ t('tools.markdown-editor.insert.heading1', 'Heading 1') }}
                    <DropdownMenuShortcut>{{ formatShortcut(isMac ? '⌘' : 'Ctrl', '1') }}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleHeading(2)">
                    {{ t('tools.markdown-editor.insert.heading2', 'Heading 2') }}
                    <DropdownMenuShortcut>{{ formatShortcut(isMac ? '⌘' : 'Ctrl', '2') }}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleHeading(3)">
                    {{ t('tools.markdown-editor.insert.heading3', 'Heading 3') }}
                    <DropdownMenuShortcut>{{ formatShortcut(isMac ? '⌘' : 'Ctrl', '3') }}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleHeading(4)">
                    {{ t('tools.markdown-editor.insert.heading4', 'Heading 4') }}
                    <DropdownMenuShortcut>{{ formatShortcut(isMac ? '⌘' : 'Ctrl', '4') }}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleHeading(5)">
                    {{ t('tools.markdown-editor.insert.heading5', 'Heading 5') }}
                    <DropdownMenuShortcut>{{ formatShortcut(isMac ? '⌘' : 'Ctrl', '5') }}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleHeading(6)">
                    {{ t('tools.markdown-editor.insert.heading6', 'Heading 6') }}
                    <DropdownMenuShortcut>{{ formatShortcut(isMac ? '⌘' : 'Ctrl', '6') }}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleCodeBlock">
                    {{ t('tools.markdown-editor.insert.codeBlock', 'Code Block') }}
                    <DropdownMenuShortcut>{{ formatShortcut(isMac ? '⌘' : 'Ctrl', '⌥', 'C') }}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleQuote">
                    {{ t('tools.markdown-editor.insert.quote', 'Quote') }}
                    <DropdownMenuShortcut>{{ formatShortcut(isMac ? '⌘' : 'Ctrl', '⌥', 'Q') }}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel>{{ t('tools.markdown-editor.insert.list', 'List') }}</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem @click="handleBulletList">
                    {{ t('tools.markdown-editor.insert.bulletList', 'Bullet List') }}
                    <DropdownMenuShortcut>{{ formatShortcut(isMac ? '⌘' : 'Ctrl', '⌥', 'U') }}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleOrderedList">
                    {{ t('tools.markdown-editor.insert.orderedList', 'Ordered List') }}
                    <DropdownMenuShortcut>{{ formatShortcut(isMac ? '⌘' : 'Ctrl', '⌥', 'O') }}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleTaskList">
                    {{ t('tools.markdown-editor.insert.taskList', 'Task List') }}
                    <DropdownMenuShortcut>{{ formatShortcut(isMac ? '⌘' : 'Ctrl', '⌥', 'X') }}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel>{{ t('tools.markdown-editor.insert.table', 'Table') }}</DropdownMenuLabel>
                <DropdownMenuItem @click="handleInsertTable">
                  {{ t('tools.markdown-editor.insert.insertTable', 'Insert Table') }}
                  <DropdownMenuShortcut>{{ formatShortcut(isMac ? '⌘' : 'Ctrl', '⌥', 'T') }}</DropdownMenuShortcut>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel>{{ t('tools.markdown-editor.insert.image', 'Image') }}</DropdownMenuLabel>
                <DropdownMenuItem @click="handleInsertImage">
                  {{ t('tools.markdown-editor.insert.insertImage', 'Insert Image') }}
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel>{{ t('tools.markdown-editor.insert.actions', 'Actions') }}</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem @click="handleDownload">
                    {{ t('tools.markdown-editor.insert.download', 'Download') }}
                    <DropdownMenuShortcut>{{ formatShortcut(isMac ? '⌘' : 'Ctrl', 'S') }}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleUndo">
                    {{ t('tools.markdown-editor.insert.undo', 'Undo') }}
                    <DropdownMenuShortcut>{{ formatShortcut(isMac ? '⌘' : 'Ctrl', 'Z') }}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleRedo">
                    {{ t('tools.markdown-editor.insert.redo', 'Redo') }}
                    <DropdownMenuShortcut>{{ formatShortcut(isMac ? '⌘' : 'Ctrl', '⇧', 'Z') }}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" size="sm" class="gap-2" @click="handleCopyMarkdown">
              <Copy class="h-4 w-4" />
              {{ t('common.copy', 'Copy') }}
            </Button>
            <Button variant="outline" size="sm" class="gap-2" @click="handleDownload">
              <Download class="h-4 w-4" />
              {{ t('common.download', 'Download') }}
              <span class="ml-1 hidden items-center gap-1 text-xs text-muted-foreground/80 md:flex">
                <Kbd class="text-xs">{{ isMac ? '⌘' : 'Ctrl' }}</Kbd>
                <span>+</span>
                <Kbd class="text-xs">S</Kbd>
              </span>
            </Button>
            <Button variant="outline" size="sm" class="gap-2" :disabled="!markdown" @click="handleClear">
              <Trash2 class="h-4 w-4" />
              {{ t('common.clear', 'Clear') }}
            </Button>
          </div>
        </div>

        <!-- Editor Area -->
        <div :class="['border rounded-lg overflow-hidden bg-background', editorClasses]">
          <!-- WYSIWYG Edit Mode -->
          <div v-if="viewMode === 'edit'" class="min-h-125">
            <EditorContent :editor="editor" class="h-full" />
          </div>

          <!-- Source Mode - Display raw Markdown -->
          <div v-else-if="viewMode === 'source'" class="min-h-125">
            <Textarea
              v-model="markdown"
              class="min-h-125 font-mono text-sm border-0 focus-visible:ring-0 resize-none"
              placeholder="Enter your Markdown here..."
            />
          </div>

          <!-- Split Mode - Left: source edit, Right: WYSIWYG edit -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 divide-x divide-y md:divide-y-0 min-h-125">
            <div class="overflow-auto">
              <Textarea
                v-model="markdown"
                class="min-h-125 font-mono text-sm border-0 focus-visible:ring-0 resize-none h-full"
                placeholder="Enter your Markdown here..."
              />
            </div>
            <div class="overflow-auto">
              <EditorContent :editor="splitEditor" class="h-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Link Dialog -->
    <Dialog v-model:open="isLinkDialogOpen">
      <DialogContent class="md:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ t('tools.markdown-editor.insert.link', 'Insert Link') }}</DialogTitle>
          <DialogDescription>
            {{ t('tools.markdown-editor.linkDialog.description', 'Enter the URL and optional link text') }}
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="grid gap-2">
            <Label for="link-url">{{ t('tools.markdown-editor.linkDialog.url', 'URL') }}</Label>
            <Input
              id="link-url"
              v-model="linkUrl"
              placeholder="https://example.com"
              @keydown.enter="handleLinkSubmit"
            />
          </div>
          <div class="grid gap-2">
            <Label for="link-text">{{ t('tools.markdown-editor.linkDialog.text', 'Link Text (optional)') }}</Label>
            <Input
              id="link-text"
              v-model="linkText"
              :placeholder="t('tools.markdown-editor.linkDialog.textPlaceholder', 'Click here')"
              @keydown.enter="handleLinkSubmit"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isLinkDialogOpen = false">
            {{ t('tools.markdown-editor.linkDialog.cancel', 'Cancel') }}
          </Button>
          <Button :disabled="!linkUrl" @click="handleLinkSubmit">
            {{ t('tools.markdown-editor.linkDialog.insert', 'Insert') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Table Dialog -->
    <Dialog v-model:open="isTableDialogOpen">
      <DialogContent class="md:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ t('tools.markdown-editor.insert.insertTable', 'Insert Table') }}</DialogTitle>
          <DialogDescription>
            {{ t('tools.markdown-editor.tableDialog.description', 'Specify the number of rows and columns') }}
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="grid gap-2">
            <Label for="table-rows">{{ t('tools.markdown-editor.tableDialog.rows', 'Rows') }}</Label>
            <Input
              id="table-rows"
              v-model.number="tableRows"
              type="number"
              min="1"
              max="20"
              @keydown.enter="handleTableSubmit"
            />
          </div>
          <div class="grid gap-2">
            <Label for="table-cols">{{ t('tools.markdown-editor.tableDialog.columns', 'Columns') }}</Label>
            <Input
              id="table-cols"
              v-model.number="tableCols"
              type="number"
              min="1"
              max="10"
              @keydown.enter="handleTableSubmit"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isTableDialogOpen = false">
            {{ t('tools.markdown-editor.tableDialog.cancel', 'Cancel') }}
          </Button>
          <Button :disabled="tableRows < 1 || tableCols < 1" @click="handleTableSubmit">
            {{ t('tools.markdown-editor.tableDialog.insert', 'Insert') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
