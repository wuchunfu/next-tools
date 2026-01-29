declare module 'markdown-it-mark' {
  import type MarkdownIt from 'markdown-it';

  function markdownItMark(md: MarkdownIt): void;

  export = markdownItMark;
}

