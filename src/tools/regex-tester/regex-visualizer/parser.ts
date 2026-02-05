/**
 * Regex parser that converts regex string to AST for visualization
 * This is a simplified parser that handles common regex patterns
 */

import type { Metadata, RepeatSpec } from './types'
import { NodeType } from './types'

/**
 * Parser state for tracking position during parsing
 */
interface ParserState {
  input: string
  pos: number
}

/**
 * Create a metadata node
 */
function createNode(
  type: NodeType | string,
  text: string,
  offset: number,
  elements: Metadata[] = [],
  extra: Record<string, unknown> = {},
): Metadata {
  return {
    type,
    text,
    offset,
    elements,
    ...extra,
  }
}

/**
 * Check if current character matches expected
 */
function peek(state: ParserState, offset = 0): string {
  return state.input[state.pos + offset] || ''
}

/**
 * Consume current character and advance position
 */
function consume(state: ParserState): string {
  return state.input[state.pos++] || ''
}

/**
 * Check if we're at the end of input
 */
function isEnd(state: ParserState): boolean {
  return state.pos >= state.input.length
}

/**
 * Parse escape sequence code mapping
 */
const ESCAPE_CODES: Record<string, [string, number, boolean]> = {
  b: ['word boundary', -1, false],
  B: ['non-word boundary', -1, false],
  d: ['digit', -1, false],
  D: ['non-digit', -1, false],
  f: ['form feed', 0x0C, true],
  n: ['line feed', 0x0A, true],
  r: ['carriage return', 0x0D, true],
  s: ['white space', -1, false],
  S: ['non-white space', -1, false],
  t: ['tab', 0x09, true],
  v: ['vertical tab', 0x0B, true],
  w: ['word', -1, false],
  W: ['non-word', -1, false],
  '1': ['Back reference (group = 1)', -1, false],
  '2': ['Back reference (group = 2)', -1, false],
  '3': ['Back reference (group = 3)', -1, false],
  '4': ['Back reference (group = 4)', -1, false],
  '5': ['Back reference (group = 5)', -1, false],
  '6': ['Back reference (group = 6)', -1, false],
  '7': ['Back reference (group = 7)', -1, false],
  '8': ['Back reference (group = 8)', -1, false],
  '9': ['Back reference (group = 9)', -1, false],
}

/**
 * Charset escape code mapping (differs from regular escapes)
 */
const CHARSET_ESCAPE_CODES: Record<string, [string, number, boolean]> = {
  ...ESCAPE_CODES,
  b: ['backspace', 0x08, true],
}

/**
 * Parse an escape sequence
 */
function parseEscape(state: ParserState, inCharset = false): Metadata {
  const startPos = state.pos
  consume(state) // consume '\'

  const code = consume(state)
  let label = ''
  let ordinal = -1
  let showHex = false

  const mapping = inCharset ? CHARSET_ESCAPE_CODES : ESCAPE_CODES

  if (mapping[code]) {
    const [lbl, ord, hex] = mapping[code]
    label = lbl
    ordinal = ord
    showHex = hex
  }
  else if (code === '0') {
    // Octal or null
    let arg = ''
    while (/[0-7]/.test(peek(state))) {
      arg += consume(state)
    }
    if (arg) {
      label = `octal: ${arg}`
      ordinal = Number.parseInt(arg, 8)
      showHex = true
    }
    else {
      label = 'null'
      ordinal = 0
      showHex = true
    }
  }
  else if (code === 'c') {
    // Control character
    const arg = consume(state)
    label = `ctrl-${arg.toUpperCase()}`
    ordinal = arg.toUpperCase().charCodeAt(0) - 64
    showHex = true
  }
  else if (code === 'x') {
    // Hex escape
    const arg = consume(state) + consume(state)
    label = `0x${arg.toUpperCase()}`
    ordinal = Number.parseInt(arg, 16)
    showHex = false
  }
  else if (code === 'u') {
    // Unicode escape
    let arg = ''
    if (peek(state) === '{') {
      // Unicode code point escape \u{XXXXX}
      consume(state) // consume '{'
      while (peek(state) !== '}' && !isEnd(state)) {
        arg += consume(state)
      }
      consume(state) // consume '}'
    }
    else {
      // Standard \uXXXX
      arg = consume(state) + consume(state) + consume(state) + consume(state)
    }
    label = `U+${arg.toUpperCase()}`
    ordinal = Number.parseInt(arg, 16)
    showHex = false
  }
  else {
    // Literal escape
    return createNode(
      NodeType.Literal,
      state.input.slice(startPos, state.pos),
      startPos,
      [],
      { literal: code },
    )
  }

  if (showHex && ordinal >= 0) {
    const hex = ordinal.toString(16).toUpperCase().padStart(2, '0')
    label = `${label} (0x${hex})`
  }

  return createNode(
    inCharset ? NodeType.CharsetEscape : NodeType.Escape,
    state.input.slice(startPos, state.pos),
    startPos,
    [],
    { label, ordinal },
  )
}

/**
 * Parse a character set [...]
 */
function parseCharset(state: ParserState): Metadata {
  const startPos = state.pos
  consume(state) // consume '['

  let invert = false
  if (peek(state) === '^') {
    invert = true
    consume(state)
  }

  const parts: Metadata[] = []

  while (peek(state) !== ']' && !isEnd(state)) {
    let part: Metadata

    if (peek(state) === '\\') {
      part = parseEscape(state, true)
    }
    else {
      const char = consume(state)
      part = createNode(
        NodeType.Literal,
        char,
        state.pos - 1,
        [],
        { literal: char },
      )
    }

    // Check for range
    if (peek(state) === '-' && peek(state, 1) !== ']') {
      const rangeStart = state.pos
      consume(state) // consume '-'

      let last: Metadata
      if (peek(state) === '\\') {
        last = parseEscape(state, true)
      }
      else {
        const char = consume(state)
        last = createNode(
          NodeType.Literal,
          char,
          state.pos - 1,
          [],
          { literal: char },
        )
      }

      parts.push(createNode(
        NodeType.CharsetRange,
        state.input.slice(startPos, state.pos),
        rangeStart,
        [],
        { first: part, last },
      ))
    }
    else {
      parts.push(part)
    }
  }

  consume(state) // consume ']'

  return createNode(
    NodeType.Charset,
    state.input.slice(startPos, state.pos),
    startPos,
    parts,
    { invert, parts },
  )
}

/**
 * Parse a repeat specifier
 */
function parseRepeat(state: ParserState): RepeatSpec | null {
  const char = peek(state)

  if (char === '*') {
    consume(state)
    const greedy = peek(state) !== '?'
    if (!greedy)
      consume(state)
    return { min: 0, max: -1, greedy }
  }

  if (char === '+') {
    consume(state)
    const greedy = peek(state) !== '?'
    if (!greedy)
      consume(state)
    return { min: 1, max: -1, greedy }
  }

  if (char === '?') {
    consume(state)
    const greedy = peek(state) !== '?'
    if (!greedy)
      consume(state)
    return { min: 0, max: 1, greedy }
  }

  if (char === '{') {
    const startPos = state.pos
    consume(state) // consume '{'

    let minStr = ''
    while (/\d/.test(peek(state))) {
      minStr += consume(state)
    }

    let maxStr = minStr
    if (peek(state) === ',') {
      consume(state)
      maxStr = ''
      while (/\d/.test(peek(state))) {
        maxStr += consume(state)
      }
    }

    if (peek(state) !== '}') {
      // Invalid repeat, reset position
      state.pos = startPos
      return null
    }
    consume(state) // consume '}'

    const greedy = peek(state) !== '?'
    if (!greedy)
      consume(state)

    const min = Number.parseInt(minStr, 10) || 0
    const max = maxStr === '' ? -1 : Number.parseInt(maxStr, 10)

    return { min, max, greedy }
  }

  return null
}

/**
 * Parse a subexpression (group)
 */
function parseSubexp(state: ParserState): Metadata {
  const startPos = state.pos
  consume(state) // consume '('

  let capture = ''
  if (peek(state) === '?') {
    consume(state)
    const next = peek(state)
    if (next === ':' || next === '=' || next === '!') {
      capture = `?${consume(state)}`
    }
    else if (next === '<') {
      // Named group or lookbehind
      consume(state)
      if (peek(state) === '=' || peek(state) === '!') {
        // Lookbehind
        capture = `?<${consume(state)}`
      }
      else {
        // Named group - skip the name
        let name = ''
        while (peek(state) !== '>' && !isEnd(state)) {
          name += consume(state)
        }
        consume(state) // consume '>'
        capture = `?<${name}>`
      }
    }
    else {
      // Unknown, treat as non-capturing
      capture = '?:'
    }
  }

  const regexp = parseRegexp(state)

  if (peek(state) === ')') {
    consume(state)
  }

  return createNode(
    NodeType.Subexp,
    state.input.slice(startPos, state.pos),
    startPos,
    [],
    { capture, regexp },
  )
}

/**
 * Parse a single match fragment (atom + optional repeat)
 */
function parseMatchFragment(state: ParserState): Metadata | null {
  const startPos = state.pos
  let content: Metadata | null = null

  const char = peek(state)

  if (char === '' || char === '|' || char === ')') {
    return null
  }

  if (char === '^' || char === '$') {
    consume(state)
    content = createNode(
      NodeType.Anchor,
      char,
      startPos,
    )
  }
  else if (char === '.') {
    consume(state)
    content = createNode(
      NodeType.AnyCharacter,
      '.',
      startPos,
    )
  }
  else if (char === '[') {
    content = parseCharset(state)
  }
  else if (char === '(') {
    content = parseSubexp(state)
  }
  else if (char === '\\') {
    content = parseEscape(state)
  }
  else if (!/[*+?{]/.test(char)) {
    consume(state)
    content = createNode(
      NodeType.Literal,
      char,
      startPos,
      [],
      { literal: char },
    )
  }

  if (!content) {
    return null
  }

  const repeat = parseRepeat(state)

  return createNode(
    NodeType.MatchFragment,
    state.input.slice(startPos, state.pos),
    startPos,
    [],
    { content, repeat },
  )
}

/**
 * Parse a match (sequence of fragments)
 */
function parseMatch(state: ParserState): Metadata {
  const startPos = state.pos
  const parts: Metadata[] = []

  while (!isEnd(state) && peek(state) !== '|' && peek(state) !== ')') {
    const fragment = parseMatchFragment(state)
    if (fragment) {
      parts.push(fragment)
    }
    else {
      break
    }
  }

  return createNode(
    NodeType.Match,
    state.input.slice(startPos, state.pos),
    startPos,
    parts,
    { parts },
  )
}

/**
 * Parse a regexp (alternation of matches)
 */
function parseRegexp(state: ParserState): Metadata {
  const startPos = state.pos
  const matches: Metadata[] = []

  matches.push(parseMatch(state))

  while (peek(state) === '|') {
    consume(state)
    matches.push(parseMatch(state))
  }

  return createNode(
    NodeType.Regexp,
    state.input.slice(startPos, state.pos),
    startPos,
    matches,
    { matches },
  )
}

/**
 * Parse flags from regex literal format /pattern/flags
 */
function parseFlags(regex: string): { pattern: string, flags: string } {
  if (regex.startsWith('/')) {
    const lastSlash = regex.lastIndexOf('/')
    if (lastSlash > 0) {
      return {
        pattern: regex.slice(1, lastSlash),
        flags: regex.slice(lastSlash + 1),
      }
    }
  }
  return { pattern: regex, flags: '' }
}

/**
 * Parse a regex string into an AST
 */
export function parse(regex: string | RegExp): Metadata {
  const regexStr = typeof regex === 'string' ? regex : regex.toString()
  const { pattern, flags } = parseFlags(regexStr)

  const state: ParserState = {
    input: pattern,
    pos: 0,
  }

  const regexp = parseRegexp(state)

  return createNode(
    NodeType.Root,
    regexStr,
    0,
    [],
    { regexp, flags },
  )
}
