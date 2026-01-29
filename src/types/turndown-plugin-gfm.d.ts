declare module 'turndown-plugin-gfm' {
  import type TurndownService from 'turndown';

  export interface GfmOptions {
    strikethrough?: boolean;
    tables?: boolean;
    taskListItems?: boolean;
  }

  export function gfm(options?: GfmOptions): TurndownService.Plugin;
  export function strikethrough(): TurndownService.Plugin;
  export function tables(): TurndownService.Plugin;
  export function taskListItems(): TurndownService.Plugin;
}

