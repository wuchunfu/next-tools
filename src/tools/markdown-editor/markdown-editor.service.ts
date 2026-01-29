import MarkdownIt from 'markdown-it';
import TurndownService from 'turndown';
import type { Options } from 'turndown';
import { tables } from 'turndown-plugin-gfm';
import markdownItTaskLists from 'markdown-it-task-lists';
import markdownItMark from 'markdown-it-mark';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Underline } from '@tiptap/extension-underline';
import { Strike } from '@tiptap/extension-strike';
import { Highlight } from '@tiptap/extension-highlight';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Typography } from '@tiptap/extension-typography';
import { fileToBase64 } from '@/utils/base64';

// Initialize Markdown parser with GFM (GitHub Flavored Markdown) support
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true, // Enable line break support, single line break converts to <br>
});

// Add plugin support
md.use(markdownItTaskLists, { 
  enabled: true,
  label: false,  // Don't wrap content in label
  labelAfter: false  // Don't add label after checkbox
}); // Task lists
md.use(markdownItMark); // Highlight marks ==text==

// Override the task list rule to handle empty task items
const defaultTaskListRule = md.renderer.rules.list_item_open;
md.renderer.rules.list_item_open = function(tokens, idx, options, env, self) {
  const token = tokens[idx];
  if (!token) {
    return '';
  }
  // Check if this is a task list item
  if (token.attrGet('class') === 'task-list-item') {
    // Ensure it's always recognized as a task list item, even if empty
    return defaultTaskListRule ? defaultTaskListRule(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options);
  }
  return defaultTaskListRule ? defaultTaskListRule(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options);
};

// Initialize HTML to Markdown converter
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  strongDelimiter: '**',
  bulletListMarker: '-',
  blankReplacement: (content: string, node: HTMLElement) => {
    // Handle empty elements, especially empty paragraphs
    if (node.nodeName === 'P') {
      return '\n\n&nbsp;\n\n';
    }
    // Check if node is a block element
    const isBlock = node.nodeType === 1 && ['DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE', 'UL', 'OL', 'LI'].includes(node.nodeName);
    return isBlock ? '\n\n' : '';
  },
});

// Use only tables plugin, not full gfm
turndownService.use(tables);

// Custom paragraph rule: don't add extra line breaks for paragraphs inside list items
turndownService.addRule('paragraph', {
  filter: 'p',
  replacement: (content: string, node: HTMLElement) => {
    const htmlNode = node as HTMLElement;
    const parent = htmlNode.parentNode;
    // If paragraph is inside list item, don't add extra line breaks
    if (parent && (parent.nodeName === 'LI' || parent.nodeName === 'TD' || parent.nodeName === 'TH')) {
      return content;
    }
    
    // Check if it's an empty paragraph
    const isEmpty = !content || content.trim() === '';
    
    if (isEmpty) {
      // Empty paragraph, use &nbsp; placeholder
      return '\n\n&nbsp;\n\n';
    }
    
    return `\n\n${content}\n\n`;
  },
});

// Custom line break rule: preserve <br> tags as single line breaks
turndownService.addRule('lineBreak', {
  filter: 'br',
  replacement: () => '\n',
});

// Custom list item conversion rule
// Note: This rule should NOT match task list items, as they are handled by the 'taskList' rule
turndownService.addRule('listItem', {
  filter: (node: HTMLElement) => {
    // Only match regular list items, not task items
    return node.nodeName === 'LI' && 
           node.getAttribute('data-type') !== 'taskItem' &&
           !node.querySelector('input[type="checkbox"]');
  },
  replacement: (content: string, node: HTMLElement, options: Options) => {
    const htmlNode = node as HTMLElement;
    // Clean content, remove extra line breaks
    content = content
      .replace(/^\n+/, '') // Remove leading line breaks
      .replace(/\n+$/, '') // Remove trailing line breaks
      .trim();
    
    let prefix = `${options.bulletListMarker} `;
    const parent = htmlNode.parentNode;
    
    if (parent && parent.nodeName === 'OL') {
      const olParent = parent as HTMLOListElement;
      const start = olParent.getAttribute('start');
      const index = Array.prototype.indexOf.call(parent.children, htmlNode);
      prefix = `${start ? Number(start) + index : index + 1}. `;
    }
    
    // Handle nested lists
    const convertedContent = content.split('\n').map((line: string, i: number) => {
      return i === 0 ? line : `  ${line}`;
    }).join('\n');
    
    return `${prefix}${convertedContent}\n`;
  },
});

// Custom table conversion rule, handle complex tables generated by TipTap
turndownService.addRule('cleanTable', {
  filter: 'table',
  replacement: (content: string, node: HTMLElement) => {
    // Extract table rows
    const rows: string[][] = [];
    const tableNode = node as HTMLTableElement;
    
    // Process table header
    const thead = tableNode.querySelector('thead');
    const theadRows = thead ? Array.from(thead.querySelectorAll('tr')) : [];
    
    // Process table body
    const tbody = tableNode.querySelector('tbody');
    const tbodyRows = tbody ? Array.from(tbody.querySelectorAll('tr')) : [];
    
    // If no thead, check if first row is all th
    let allRows = [...theadRows, ...tbodyRows];
    if (allRows.length === 0) {
      allRows = Array.from(tableNode.querySelectorAll('tr'));
    }
    
    allRows.forEach((tr) => {
      const cells: string[] = [];
      const cellNodes = Array.from(tr.querySelectorAll('th, td'));
      
      cellNodes.forEach((cell) => {
        // Get cell text, remove extra <p> tags
        let text = cell.textContent || '';
        text = text.trim().replace(/\n/g, ' ');
        cells.push(text);
      });
      
      if (cells.length > 0) {
        rows.push(cells);
      }
    });
    
    if (rows.length === 0) return '';
    
    const headerRow = rows[0];
    if (!headerRow) return '';
    
    // Build Markdown table
    let markdown = '\n';
    
    // First row (header)
    markdown += `| ${headerRow.join(' | ')} |\n`;
    
    // Separator line
    markdown += `|${headerRow.map(() => '---').join('|')}|\n`;
    
    // Remaining rows
    for (let i = 1; i < rows.length; i++) {
      const currentRow = rows[i];
      if (!currentRow) continue;
      
      // Ensure each row has same number of columns as header
      while (currentRow.length < headerRow.length) {
        currentRow.push('');
      }
      markdown += `| ${currentRow.join(' | ')} |\n`;
    }
    
    return `${markdown}\n`;
  },
});

// Add custom rule: support strikethrough
turndownService.addRule('strikethrough', {
  filter: ['del', 's'],
  replacement: (content: string) => `~~${content}~~`,
});

// Add custom rule: support underline
turndownService.addRule('underline', {
  filter: ['u'],
  replacement: (content: string) => `<u>${content}</u>`,
});

// Add custom rule: support highlight
turndownService.addRule('highlight', {
  filter: (node: HTMLElement) => {
    return node.nodeName === 'MARK' || 
           (node.nodeName === 'SPAN' && node.getAttribute('data-type') === 'highlight');
  },
  replacement: (content: string) => `==${content}==`,
});

// Add custom rule: support task lists
turndownService.addRule('taskList', {
  filter: (node: HTMLElement) => {
    const htmlNode = node as HTMLElement;
    return htmlNode.nodeName === 'LI' && 
           (htmlNode.getAttribute('data-type') === 'taskItem' ||
            htmlNode.querySelector('input[type="checkbox"]') !== null);
  },
  replacement: (content: string, node: HTMLElement) => {
    const htmlNode = node as HTMLElement;
    const checkbox = htmlNode.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
    if (!checkbox) return content;
    
    const isChecked = checkbox.checked || checkbox.hasAttribute('checked');
    const prefix = isChecked ? '[x]' : '[ ]';
    
    // Remove checkbox and label elements, keep only text content
    let textContent = content
      .replace(/<input[^>]*>/gi, '')
      .replace(/<label[^>]*>/gi, '')
      .replace(/<\/label>/gi, '')
      .replace(/^\n+/, '')
      .replace(/\n+$/, '')
      .trim();
    
    // If content is empty, add a space to ensure it's recognized as a task list
    if (!textContent) {
      textContent = ' ';
    }
    
    return `- ${prefix} ${textContent}\n`;
  },
});

// Add custom rule: support images (including base64)
turndownService.addRule('image', {
  filter: 'img',
  replacement: (_content: string, node: HTMLElement) => {
    const imgNode = node as HTMLImageElement;
    const alt = imgNode.alt || '';
    const src = imgNode.src || '';
    const title = imgNode.title || '';
    
    const titlePart = title ? ` "${title}"` : '';
    return `![${alt}](${src}${titlePart})`;
  },
});

/**
 * Convert Markdown to HTML
 */
export function getHtmlFromMarkdown(markdown: string): string {
  try {
    // Preprocessing: protect multiple consecutive line breaks
    // Convert multiple line breaks to empty paragraphs instead of <br> tags
    let processedMarkdown = markdown.replace(/\n{3,}/g, (match) => {
      const count = match.length - 2; // Subtract 2 line breaks for paragraph separation
      // Each extra line break converts to an empty paragraph
      return `\n\n${'<p></p>\n\n'.repeat(count)}`;
    });
    
    // Preprocessing: Handle empty task list items
    // markdown-it-task-lists doesn't recognize "- [ ]" or "- [x]" without content as task lists
    // So we add a zero-width space to make it recognizable
    processedMarkdown = processedMarkdown.replace(/^- \[([ x])\]\s*$/gm, '- [$1] \u200B');
    processedMarkdown = processedMarkdown.replace(/^- \[([ x])\]\s*\n/gm, '- [$1] \u200B\n');
    
    let html = md.render(processedMarkdown);
    
    // Post-processing: Convert markdown-it task list HTML to TipTap format
    // markdown-it generates: <ul class="contains-task-list"><li class="task-list-item enabled"><input class="task-list-item-checkbox" type="checkbox" id="..."><label class="task-list-item-label" for="...">content</label></li></ul>
    // TipTap expects: <ul data-type="taskList"><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>content</p></div></li></ul>
    
    // Step 1: Replace ul class with data-type
    html = html.replace(
      /<ul class="contains-task-list">/g,
      '<ul data-type="taskList">',
    );
    
    // Step 2: Replace li with task-list-item class
    html = html.replace(
      /<li class="task-list-item enabled">/g,
      '<li data-checked="false" data-type="taskItem">',
    );
    
    html = html.replace(
      /<li class="task-list-item enabled checked">/g,
      '<li data-checked="true" data-type="taskItem">',
    );
    
    // Step 3: Replace the checkbox and content structure
    // From: <li class="task-list-item enabled"><input class="task-list-item-checkbox" type="checkbox"> content with <strong>html</strong></li>
    // To: <li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>content with <strong>html</strong></p></div></li>
    
    // First, handle unchecked items
    html = html.replace(
      /<li data-checked="false" data-type="taskItem"><input class="task-list-item-checkbox" type="checkbox">([\s\S]*?)<\/li>/g,
      (_match, content) => {
        // Trim the content and check if it's just a space or zero-width space (empty task item)
        const trimmedContent = content.trim().replace(/\u200B/g, '');
        if (!trimmedContent || trimmedContent === ' ') {
          return '<li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p></p></div></li>';
        }
        // Remove zero-width space from content
        const cleanContent = content.replace(/\u200B/g, '').trim();
        return `<li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>${cleanContent}</p></div></li>`;
      },
    );
    
    // Then, handle checked items
    html = html.replace(
      /<li data-checked="true" data-type="taskItem"><input class="task-list-item-checkbox" type="checkbox" checked>([\s\S]*?)<\/li>/g,
      (_match, content) => {
        // Trim the content and check if it's just a space or zero-width space (empty task item)
        const trimmedContent = content.trim().replace(/\u200B/g, '');
        if (!trimmedContent || trimmedContent === ' ') {
          return '<li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked><span></span></label><div><p></p></div></li>';
        }
        // Remove zero-width space from content
        const cleanContent = content.replace(/\u200B/g, '').trim();
        return `<li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked><span></span></label><div><p>${cleanContent}</p></div></li>`;
      },
    );
    
    return html;
  } catch (error) {
    console.error('Error converting Markdown to HTML:', error);
    return markdown;
  }
}

/**
 * Convert HTML to Markdown
 */
export function getMarkdownFromHtml(html: string): string {
  try {
    let markdown = turndownService.turndown(html);
    
    // Post-processing: replace &nbsp; placeholders with empty lines
    // Empty paragraph <p></p> is converted to \n\n&nbsp;\n\n
    // Replace with \n\n\n (3 line breaks = 1 empty line)
    markdown = markdown
      .replace(/\n\n&nbsp;\n\n/g, '\n\n\n')    // Empty paragraph = 3 line breaks
      .replace(/\n&nbsp;\n/g, '\n')            // Single line break mode
      .replace(/&nbsp;/g, '');                 // Remaining &nbsp;
    
    // Fix escaped brackets in task lists
    // TurndownService may escape [ and ] as \[ and \]
    // We need to unescape them for task list syntax: - [ ] or - [x]
    markdown = markdown.replace(/^- \\\[([ x])\\\]/gm, '- [$1]');
    
    // Clean up extra line breaks at start and end
    markdown = markdown.trim();
    
    return markdown;
  } catch (error) {
    console.error('Error converting HTML to Markdown:', error);
    return html;
  }
}

// ============================================
// TipTap Extensions
// ============================================

/**
 * Custom TipTap extension: Auto-convert bullet list to task list
 * When user types "[ ]" or "[x]" in a bullet list, automatically convert it to a task list
 */
export const TaskListAutoConvert = Extension.create({
  name: 'taskListAutoConvert',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('taskListAutoConvert'),
        appendTransaction: (transactions, oldState, newState) => {
          // Check if there was a text input
          const docChanged = transactions.some(tr => tr.docChanged);
          if (!docChanged) return null;

          const { tr } = newState;
          let modified = false;

          // Iterate through the document to find bullet list items with task list syntax
          newState.doc.descendants((node, pos) => {
            // Check if this is a list item in a bullet list (not already a task item)
            if (node.type.name === 'listItem' && node.attrs.checked === undefined) {
              // Get the text content of the first paragraph in the list item
              const firstChild = node.firstChild;
              if (firstChild && firstChild.type.name === 'paragraph') {
                const text = firstChild.textContent;
                
                // Check if text starts with [ ] or [x] (task list syntax)
                const taskMatch = text.match(/^\s*\[([ x])\]\s*/i);
                if (taskMatch?.[1]) {
                  // Check if parent is a bullet list
                  const $pos = newState.doc.resolve(pos);
                  const parent = $pos.parent;
                  const parentPos = $pos.before($pos.depth);
                  
                  if (parent.type.name === 'bulletList') {
                    // Convert to task list
                    const isChecked = taskMatch[1].toLowerCase() === 'x';
                    const matchLength = taskMatch[0].length;
                    const textAfterCheckbox = text.substring(matchLength);
                    
                    // Find the task list and task item node types
                    const taskListType = newState.schema.nodes.taskList;
                    const taskItemType = newState.schema.nodes.taskItem;
                    const paragraphType = newState.schema.nodes.paragraph;
                    
                    if (taskListType && taskItemType && paragraphType) {
                      // Create new task item with the text after checkbox
                      const paragraphNode = paragraphType.create(
                        null,
                        textAfterCheckbox ? newState.schema.text(textAfterCheckbox) : null
                      );
                      
                      const taskItemNode = taskItemType.create(
                        { checked: isChecked },
                        paragraphNode
                      );
                      
                      // Check if this is the only item in the bullet list
                      if (parent.childCount === 1) {
                        // Replace the entire bullet list with a task list
                        const taskListNode = taskListType.create(null, taskItemNode);
                        
                        tr.replaceWith(parentPos, parentPos + parent.nodeSize, taskListNode);
                        
                        // Calculate cursor position: parentPos + taskList(1) + taskItem(1) + paragraph(1) + text length
                        const textLength = textAfterCheckbox.length;
                        const cursorPos = parentPos + 3 + textLength;
                        
                        // Use TextSelection to set cursor at the end of text
                        tr.setSelection(TextSelection.create(tr.doc, cursorPos));
                      } else {
                        // Multiple items: just replace this list item with task item
                        // and wrap it in a task list
                        const taskListNode = taskListType.create(null, taskItemNode);
                        
                        tr.replaceWith(pos, pos + node.nodeSize, taskListNode);
                        
                        // Calculate cursor position
                        const textLength = textAfterCheckbox.length;
                        const cursorPos = pos + 3 + textLength;
                        
                        // Use TextSelection to set cursor at the end of text
                        tr.setSelection(TextSelection.create(tr.doc, cursorPos));
                      }
                      
                      modified = true;
                    }
                  }
                }
              }
            }
          });

          return modified ? tr : null;
        },
      }),
    ];
  },
});

/**
 * Custom TipTap extension: Handle image paste
 * When user pastes an image, convert it to base64 and insert into editor
 */
export const ImagePasteHandler = Extension.create({
  name: 'imagePasteHandler',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imagePasteHandler'),
        props: {
          handlePaste: (view, event) => {
            const items = event.clipboardData?.items;
            if (!items) return false;

            // Check if there are any image files in clipboard
            for (let i = 0; i < items.length; i++) {
              const item = items[i];
              if (!item) continue;

              if (item.type.indexOf('image') === 0) {
                event.preventDefault();
                
                const file = item.getAsFile();
                if (!file) continue;

                // Convert image to base64 and insert
                fileToBase64(file).then((base64) => {
                  const { schema } = view.state;
                  const node = schema.nodes.image?.create({
                    src: base64,
                  });
                  
                  if (node) {
                    const transaction = view.state.tr.replaceSelectionWith(node);
                    view.dispatch(transaction);
                  }
                }).catch((error) => {
                  console.error('Error converting image to base64:', error);
                });

                return true;
              }
            }

            return false;
          },
          handleDrop: (view, event) => {
            const files = event.dataTransfer?.files;
            if (!files || files.length === 0) return false;

            // Check if there are any image files
            const imageFiles = Array.from(files).filter(file => file.type.indexOf('image') === 0);
            if (imageFiles.length === 0) return false;

            event.preventDefault();

            // Get drop position
            const coordinates = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });

            if (!coordinates) return true;

            // Convert all images to base64 and insert
            imageFiles.forEach((file) => {
              fileToBase64(file).then((base64) => {
                const { schema } = view.state;
                const node = schema.nodes.image?.create({
                  src: base64,
                });
                
                if (node) {
                  const transaction = view.state.tr.insert(coordinates.pos, node);
                  view.dispatch(transaction);
                }
              }).catch((error) => {
                console.error('Error converting image to base64:', error);
              });
            });

            return true;
          },
        },
      }),
    ];
  },
});

/**
 * Get TipTap editor extensions configuration
 */
export function getEditorExtensions() {
  return [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
      hardBreak: {
        keepMarks: true,
      },
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Underline,
    Strike,
    Highlight.configure({
      multicolor: true,
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
    }),
    Image.configure({
      inline: true,
      allowBase64: true,
    }),
    Typography,
    TaskListAutoConvert,
    ImagePasteHandler,
  ];
}

// ============================================
// Utility Functions
// ============================================

/**
 * Download markdown content as a file
 */
export function downloadMarkdown(content: string, filename?: string): void {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `document-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Format keyboard shortcut keys for display
 */
export function formatShortcut(...keys: string[]): string {
  return keys.join('+');
}

// ============================================
// Constants
// ============================================

/**
 * Default markdown content for new editor
 */
export const DEFAULT_MARKDOWN_CONTENT = `# Welcome to Markdown Editor

Start writing your **Markdown** content here!

## Features

- **Bold** and *italic* text
- Lists and checkboxes
- Code blocks
- And much more!

\`\`\`javascript
const hello = "world";
console.log(hello);
\`\`\`
`;

/**
 * Editor CSS classes for styling
 */
export const EDITOR_CLASSES = 
  // Base editor styles
  '[&_.ProseMirror]:outline-none '
  // Empty editor placeholder
  + '[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground/40 '
  + '[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] '
  + '[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left '
  + '[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 '
  + '[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none '
  // Headings
  + '[&_.ProseMirror_h1]:mt-0 [&_.ProseMirror_h1]:mb-4 [&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h1]:tracking-tight '
  + '[&_.ProseMirror_h2]:mt-8 [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-semibold '
  + '[&_.ProseMirror_h3]:mt-6 [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-semibold '
  + '[&_.ProseMirror_h4]:mt-4 [&_.ProseMirror_h4]:mb-2 [&_.ProseMirror_h4]:text-lg [&_.ProseMirror_h4]:font-semibold '
  // Paragraphs
  + '[&_.ProseMirror_p]:mt-0 [&_.ProseMirror_p]:mb-3 [&_.ProseMirror_p]:leading-relaxed '
  // Links
  + '[&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline-offset-4 hover:[&_.ProseMirror_a]:underline '
  // Lists
  + '[&_.ProseMirror_ul]:my-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 '
  + '[&_.ProseMirror_ol]:my-2 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 '
  + '[&_.ProseMirror_li]:my-1 '
  + '[&_.ProseMirror_ul_ul]:list-[circle] '
  + '[&_.ProseMirror_ul_ul_ul]:list-[square] '
  + '[&_.ProseMirror_ol_ol]:list-[lower-alpha] '
  // Task lists
  + '[&_.ProseMirror_ul[data-type="taskList"]]:list-none [&_.ProseMirror_ul[data-type="taskList"]]:pl-0 '
  + '[&_.ProseMirror_ul[data-type="taskList"]_li]:flex [&_.ProseMirror_ul[data-type="taskList"]_li]:items-start [&_.ProseMirror_ul[data-type="taskList"]_li]:gap-2 '
  // Label wrapper styling
  + '[&_.ProseMirror_ul[data-type="taskList"]_label]:flex [&_.ProseMirror_ul[data-type="taskList"]_label]:items-center [&_.ProseMirror_ul[data-type="taskList"]_label]:h-6 '
  // Checkbox styling to match project design system
  + '[&_.ProseMirror_ul[data-type="taskList"]_input[type="checkbox"]]:appearance-none '
  + '[&_.ProseMirror_ul[data-type="taskList"]_input[type="checkbox"]]:size-4 '
  + '[&_.ProseMirror_ul[data-type="taskList"]_input[type="checkbox"]]:shrink-0 '
  + '[&_.ProseMirror_ul[data-type="taskList"]_input[type="checkbox"]]:rounded-[4px] '
  + '[&_.ProseMirror_ul[data-type="taskList"]_input[type="checkbox"]]:border '
  + '[&_.ProseMirror_ul[data-type="taskList"]_input[type="checkbox"]]:border-input '
  + '[&_.ProseMirror_ul[data-type="taskList"]_input[type="checkbox"]]:shadow-xs '
  + '[&_.ProseMirror_ul[data-type="taskList"]_input[type="checkbox"]]:transition-all '
  + '[&_.ProseMirror_ul[data-type="taskList"]_input[type="checkbox"]]:cursor-pointer '
  + '[&_.ProseMirror_ul[data-type="taskList"]_input[type="checkbox"]]:outline-none '
  // Checked state
  + '[&_.ProseMirror_ul[data-type="taskList"]_input[type="checkbox"]:checked]:bg-primary '
  + '[&_.ProseMirror_ul[data-type="taskList"]_input[type="checkbox"]:checked]:border-primary '
  + '[&_.ProseMirror_ul[data-type="taskList"]_input[type="checkbox"]:checked]:bg-[url("data:image/svg+xml,%3csvg%20viewBox=%270%200%2016%2016%27%20fill=%27white%27%20xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath%20d=%27M12.207%205.793a1%201%200%200%201%200%201.414l-5%205a1%201%200%200%201-1.414%200l-2-2a1%201%200%200%201%201.414-1.414L6.5%2010.086l4.293-4.293a1%201%200%200%201%201.414%200z%27/%3e%3c/svg%3e")] '
  + '[&_.ProseMirror_ul[data-type="taskList"]_input[type="checkbox"]:checked]:bg-center '
  + '[&_.ProseMirror_ul[data-type="taskList"]_input[type="checkbox"]:checked]:bg-no-repeat '
  // Focus state
  + '[&_.ProseMirror_ul[data-type="taskList"]_input[type="checkbox"]]:focus-visible:border-ring '
  + '[&_.ProseMirror_ul[data-type="taskList"]_input[type="checkbox"]]:focus-visible:ring-[3px] '
  + '[&_.ProseMirror_ul[data-type="taskList"]_input[type="checkbox"]]:focus-visible:ring-ring/50 '
  // Hover state
  + '[&_.ProseMirror_ul[data-type="taskList"]_input[type="checkbox"]]:hover:border-ring/60 '
  // Disabled state
  + '[&_.ProseMirror_ul[data-type="taskList"]_input[type="checkbox"]]:disabled:cursor-not-allowed '
  + '[&_.ProseMirror_ul[data-type="taskList"]_input[type="checkbox"]]:disabled:opacity-50 '
  // Inline code
  + '[&_.ProseMirror_code]:rounded-sm [&_.ProseMirror_code]:bg-muted [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:text-xs [&_.ProseMirror_code]:font-mono '
  // Code blocks
  + '[&_.ProseMirror_pre]:m-0 [&_.ProseMirror_pre]:mt-3 [&_.ProseMirror_pre]:mb-4 [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre]:border [&_.ProseMirror_pre]:border-border [&_.ProseMirror_pre]:bg-muted/40 [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_pre]:text-xs [&_.ProseMirror_pre]:font-mono [&_.ProseMirror_pre]:overflow-auto '
  + '[&_.ProseMirror_pre_code]:bg-transparent [&_.ProseMirror_pre_code]:p-0 '
  // Blockquotes
  + '[&_.ProseMirror_blockquote]:mt-4 [&_.ProseMirror_blockquote]:mb-4 [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-primary/40 [&_.ProseMirror_blockquote]:bg-primary/5 [&_.ProseMirror_blockquote]:px-4 [&_.ProseMirror_blockquote]:py-2 '
  + '[&_.ProseMirror_blockquote_p]:m-0 '
  // Horizontal rules
  + '[&_.ProseMirror_hr]:my-6 [&_.ProseMirror_hr]:border-border '
  // Tables
  + '[&_.ProseMirror_table]:my-4 [&_.ProseMirror_table]:w-full [&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:border [&_.ProseMirror_table]:border-border [&_.ProseMirror_table]:table-fixed [&_.ProseMirror_table]:overflow-hidden '
  + '[&_.ProseMirror_th]:px-3 [&_.ProseMirror_th]:py-2 [&_.ProseMirror_th]:text-left [&_.ProseMirror_th]:text-sm [&_.ProseMirror_th]:font-semibold [&_.ProseMirror_th]:uppercase [&_.ProseMirror_th]:tracking-wide [&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-border [&_.ProseMirror_th]:bg-muted [&_.ProseMirror_th]:text-muted-foreground [&_.ProseMirror_th]:min-w-[1em] [&_.ProseMirror_th]:box-border [&_.ProseMirror_th]:relative '
  + '[&_.ProseMirror_td]:px-3 [&_.ProseMirror_td]:py-2 [&_.ProseMirror_td]:align-top [&_.ProseMirror_td]:text-sm [&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-border [&_.ProseMirror_td]:text-foreground [&_.ProseMirror_td]:min-w-[1em] [&_.ProseMirror_td]:box-border [&_.ProseMirror_td]:relative '
  + '[&_.ProseMirror_th_p]:m-0 [&_.ProseMirror_td_p]:m-0 '
  // TipTap table special features
  + '[&_.ProseMirror_.selectedCell:after]:z-[2] [&_.ProseMirror_.selectedCell:after]:absolute [&_.ProseMirror_.selectedCell:after]:content-[""] [&_.ProseMirror_.selectedCell:after]:inset-0 [&_.ProseMirror_.selectedCell:after]:bg-primary/10 [&_.ProseMirror_.selectedCell:after]:pointer-events-none '
  + '[&_.ProseMirror_.column-resize-handle]:absolute [&_.ProseMirror_.column-resize-handle]:right-[-1px] [&_.ProseMirror_.column-resize-handle]:top-0 [&_.ProseMirror_.column-resize-handle]:bottom-0 [&_.ProseMirror_.column-resize-handle]:w-px [&_.ProseMirror_.column-resize-handle]:bg-primary [&_.ProseMirror_.column-resize-handle]:pointer-events-none [&_.ProseMirror_.column-resize-handle]:z-10 '
  // Images
  + '[&_.ProseMirror_img]:my-2 [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded-md [&_.ProseMirror_img]:border '
  // Text formatting
  + '[&_.ProseMirror_mark]:bg-primary/20 [&_.ProseMirror_mark]:px-1 [&_.ProseMirror_mark]:py-0.5 [&_.ProseMirror_mark]:rounded '
  + '[&_.ProseMirror_u]:underline [&_.ProseMirror_u]:decoration-1 '
  + '[&_.ProseMirror_s]:line-through [&_.ProseMirror_del]:line-through ';
