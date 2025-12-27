export const markdownBodyClasses
  = 'prose max-w-none dark:prose-invert text-sm leading-relaxed '
  // Headings
    + '[&_h1]:mt-0 [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight '
    + '[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold '
    + '[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold '
    + '[&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold '
  // Paragraphs
    + '[&_p]:mt-0 [&_p]:mb-3 [&_p]:leading-relaxed '
  // Links
    + '[&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline '
  // Lists
    + '[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 '
    + '[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 '
    + '[&_li]:my-1 '
  // Inline code
  + '[&_p_code]:rounded-sm [&_p_code]:bg-muted [&_p_code]:px-1.5 [&_p_code]:py-0.5 [&_p_code]:text-xs [&_p_code]:font-mono '
  // Code blocks
  + '[&_pre]:m-0 [&_pre]:mt-3 [&_pre]:mb-4 [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted/40 [&_pre]:p-4 [&_pre]:text-xs [&_pre]:font-mono [&_pre]:overflow-auto '
  + '[&_pre_code]:bg-transparent [&_pre_code]:p-0 '
  // Blockquotes
  + '[&_blockquote]:mt-4 [&_blockquote]:mb-4 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:bg-primary/5 [&_blockquote]:px-4 [&_blockquote]:py-2 '
  + '[&_blockquote_p]:m-0 '
  // Horizontal rules
  + '[&_hr]:my-6 [&_hr]:border-border '
  // Tables
  + '[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-border [&_table]:rounded-lg '
  + '[&_thead]:bg-muted [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 [&_thead]:border-border '
  + '[&_thead_th]:px-3 [&_thead_th]:py-2 [&_thead_th]:text-left [&_thead_th]:text-sm [&_thead_th]:font-semibold [&_thead_th]:uppercase [&_thead_th]:tracking-wide [&_thead_th]:border-b [&_thead_th]:border-border [&_thead_th]:text-muted-foreground '
  + '[&_tbody_td]:px-3 [&_tbody_td]:py-2 [&_tbody_td]:align-top [&_tbody_td]:text-sm [&_tbody_td]:border-b [&_tbody_td]:border-border/70 [&_tbody_td]:text-foreground '
  // Images
  + '[&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-md [&_img]:border '
