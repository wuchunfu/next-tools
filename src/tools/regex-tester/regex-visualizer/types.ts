/**
 * Types for the regex visualizer
 */

/**
 * Bounding box with anchor points for SVG element positioning
 */
export interface BBox {
  x: number
  y: number
  width: number
  height: number
  x2: number
  y2: number
  cx: number
  cy: number
  ax: number
  ax2: number
  ay: number
}

/**
 * Node types in the regex AST
 */
export enum NodeType {
  Root = 'root',
  Regexp = 'regexp',
  Match = 'match',
  MatchFragment = 'match-fragment',
  Literal = 'literal',
  Escape = 'escape',
  CharsetEscape = 'charset-escape',
  Charset = 'charset',
  CharsetRange = 'charset-range',
  Anchor = 'anchor',
  AnyCharacter = 'any-character',
  Subexp = 'subexp',
  Repeat = 'repeat',
}

/**
 * Parsed regex node metadata
 */
export interface Metadata {
  readonly type: NodeType | string
  readonly text: string
  readonly offset: number
  readonly elements: Metadata[]
  [key: string]: unknown
}

/**
 * SVG rendering options
 */
export interface RenderOptions {
  onChange?: (status: { progress: number }) => void
}

/**
 * Repeat specification interface
 */
export interface RepeatSpec {
  min: number
  max: number
  greedy: boolean
}
