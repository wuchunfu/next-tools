/**
 * SVG renderer for regex visualization
 * Converts parsed regex AST to railroad diagram SVG
 */

import type { BBox, Metadata, RepeatSpec } from './types'
import { NodeType } from './types'
import {
  addClass,
  createCircle,
  createElement,
  createGroup,
  createPath,
  createRect,
  createText,
  moveToBack,
  translate,
} from './svg-utils'

// Shared temp SVG for measurements
let measureSvg: SVGSVGElement | null = null

function getMeasureSvg(): SVGSVGElement {
  if (!measureSvg) {
    measureSvg = createElement('svg')
    measureSvg.style.position = 'absolute'
    measureSvg.style.visibility = 'hidden'
    measureSvg.style.width = '0'
    measureSvg.style.height = '0'
    measureSvg.style.overflow = 'visible'
    document.body.appendChild(measureSvg)
  }
  return measureSvg
}

/**
 * Get bounding box of SVG element
 */
function getBBox(element: SVGGraphicsElement): BBox {
  const svg = getMeasureSvg()
  const clone = element.cloneNode(true) as SVGGraphicsElement
  svg.appendChild(clone)

  let rect: DOMRect
  try {
    rect = clone.getBBox()
  }
  catch {
    rect = new DOMRect(0, 0, 0, 0)
  }

  svg.removeChild(clone)

  return {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    x2: rect.x + rect.width,
    y2: rect.y + rect.height,
    cx: rect.x + rect.width / 2,
    cy: rect.y + rect.height / 2,
    ax: rect.x,
    ax2: rect.x + rect.width,
    ay: rect.y + rect.height / 2,
  }
}

/**
 * Normalize a bounding box
 */
function normalizeBBox(box: Partial<BBox>): BBox {
  const x = box.x ?? 0
  const y = box.y ?? 0
  const width = box.width ?? 0
  const height = box.height ?? 0

  return {
    x,
    y,
    width,
    height,
    x2: box.x2 ?? x + width,
    y2: box.y2 ?? y + height,
    cx: box.cx ?? x + width / 2,
    cy: box.cy ?? y + height / 2,
    ax: box.ax ?? x,
    ax2: box.ax2 ?? x + width,
    ay: box.ay ?? y + height / 2,
  }
}

/**
 * Flag labels for display
 */
const FLAG_LABELS: Record<string, string> = {
  i: 'Ignore Case',
  g: 'Global',
  m: 'Multiline',
  y: 'Sticky',
  u: 'Unicode',
  s: 'Dotall',
  d: 'Indices',
  v: 'Unicode Sets',
}

/**
 * Escape code labels
 */
const ESCAPE_LABELS: Record<string, string> = {
  b: 'word boundary',
  B: 'non-word boundary',
  d: 'digit',
  D: 'non-digit',
  f: 'form feed',
  n: 'line feed',
  r: 'carriage return',
  s: 'white space',
  S: 'non-white space',
  t: 'tab',
  v: 'vertical tab',
  w: 'word',
  W: 'non-word',
}

/**
 * Render state tracking
 */
interface RenderState {
  groupCounter: number
  container: SVGElement
}

/**
 * Rendered node result
 */
interface RenderedNode {
  element: SVGGElement
  bbox: BBox
  anchor?: { ax: number, ax2: number, ay: number }
}

/**
 * Render a labeled box (text inside a rectangle)
 */
function renderLabel(
  text: string | string[],
  options: { round?: number, className?: string } = {},
): RenderedNode {
  const group = createGroup('label')
  const rect = createRect(0, 0, 0, 0, options.round || 0, options.round || 0)
  const textEl = createText(text)

  if (options.className) {
    addClass(group, options.className)
  }

  group.appendChild(rect)
  group.appendChild(textEl)

  // Measure text to size rect
  const textBBox = getBBox(textEl)
  const margin = 5

  // Size rect to fit text
  const width = textBBox.width + 2 * margin
  const height = textBBox.height + 2 * margin
  rect.setAttribute('width', String(width))
  rect.setAttribute('height', String(height))

  // Center text inside rect
  // Use text-anchor: middle for horizontal centering
  textEl.setAttribute('text-anchor', 'middle')
  textEl.setAttribute('x', String(width / 2))
  // Use dominant-baseline: central for vertical centering
  textEl.setAttribute('dominant-baseline', 'central')
  textEl.setAttribute('y', String(height / 2))

  const bbox: BBox = {
    x: 0,
    y: 0,
    width,
    height,
    x2: width,
    y2: height,
    cx: width / 2,
    cy: height / 2,
    ax: 0,
    ax2: width,
    ay: height / 2,
  }

  return { element: group, bbox }
}

/**
 * Render a literal node (quoted text)
 */
function renderLiteral(node: Metadata): RenderedNode {
  const literal = (node.literal as string) || node.text
  const text = ['\u201C', literal, '\u201D']

  const result = renderLabel(text, { round: 3 })
  addClass(result.element, 'literal')

  // Style quote marks
  const tspans = result.element.querySelectorAll('tspan')
  if (tspans.length >= 3) {
    addClass(tspans[0] as SVGElement, 'quote')
    addClass(tspans[2] as SVGElement, 'quote')
  }

  return result
}

/**
 * Render an escape node
 */
function renderEscape(node: Metadata): RenderedNode {
  let label = node.label as string

  if (!label) {
    // Build label from escape code
    const text = node.text
    if (text.startsWith('\\') && text.length > 1) {
      const code = text[1] as keyof typeof ESCAPE_LABELS
      label = ESCAPE_LABELS[code] || text
    }
    else {
      label = text
    }
  }

  const result = renderLabel(label, { round: 3 })
  addClass(result.element, node.type === NodeType.CharsetEscape ? 'charset-escape' : 'escape')

  return result
}

/**
 * Render an anchor node (^ or $)
 */
function renderAnchor(node: Metadata): RenderedNode {
  const label = node.text === '^' ? 'Start of line' : 'End of line'
  const result = renderLabel(label, { round: 3, className: 'anchor' })
  return result
}

/**
 * Render an any-character node (.)
 */
function renderAnyCharacter(): RenderedNode {
  const result = renderLabel('any character', { round: 3, className: 'any-character' })
  return result
}

/**
 * Render a charset range (e.g., a-z)
 */
function renderCharsetRange(node: Metadata, state: RenderState): RenderedNode {
  const group = createGroup('charset-range')
  const first = node.first as Metadata
  const last = node.last as Metadata

  const firstRendered = renderNode(first, state)
  const hyphen = createText('-')
  const lastRendered = renderNode(last, state)

  // Get bounding boxes
  const firstBBox = firstRendered.bbox
  const hyphenBBox = getBBox(hyphen)
  const lastBBox = lastRendered.bbox

  // Calculate max height for vertical centering
  const maxHeight = Math.max(firstBBox.height, hyphenBBox.height, lastBBox.height)
  const gap = 3

  // Position first
  translate(firstRendered.element, 0, (maxHeight - firstBBox.height) / 2)

  // Position hyphen - use dominant-baseline for vertical centering
  const hyphenX = firstBBox.width + gap + hyphenBBox.width / 2
  hyphen.setAttribute('text-anchor', 'middle')
  hyphen.setAttribute('dominant-baseline', 'central')
  hyphen.setAttribute('x', String(hyphenX))
  hyphen.setAttribute('y', String(maxHeight / 2))

  // Position last
  translate(lastRendered.element, firstBBox.width + gap + hyphenBBox.width + gap, (maxHeight - lastBBox.height) / 2)

  group.appendChild(firstRendered.element)
  group.appendChild(hyphen)
  group.appendChild(lastRendered.element)

  const width = firstBBox.width + gap + hyphenBBox.width + gap + lastBBox.width
  const height = maxHeight

  const bbox: BBox = {
    x: 0,
    y: 0,
    width,
    height,
    x2: width,
    y2: height,
    cx: width / 2,
    cy: height / 2,
    ax: 0,
    ax2: width,
    ay: height / 2,
  }

  return { element: group, bbox }
}

/**
 * Render a charset node ([...])
 */
function renderCharset(node: Metadata, state: RenderState): RenderedNode {
  const group = createGroup('charset')
  const invert = node.invert as boolean
  const label = invert ? 'None of:' : 'One of:'
  const parts = (node.parts as Metadata[]) || node.elements

  // Create label text
  const labelText = createText(label)
  addClass(labelText, 'charset-label')
  const labelBBox = getBBox(labelText)

  // Render each part and calculate layout
  const renderedParts: RenderedNode[] = []
  let maxPartWidth = 0
  let totalPartHeight = 0
  const partGap = 5

  for (const part of parts) {
    const rendered = renderNode(part, state)
    renderedParts.push(rendered)
    maxPartWidth = Math.max(maxPartWidth, rendered.bbox.width)
    totalPartHeight += rendered.bbox.height
  }
  totalPartHeight += (renderedParts.length - 1) * partGap

  // Create parts container
  const partContainer = createGroup('charset-parts')

  // Position parts vertically, centered horizontally
  let yOffset = 0
  for (const rendered of renderedParts) {
    const xOffset = (maxPartWidth - rendered.bbox.width) / 2
    translate(rendered.element, xOffset, yOffset)
    partContainer.appendChild(rendered.element)
    yOffset += rendered.bbox.height + partGap
  }

  // Create box around parts - use content width only, not influenced by label width
  const padding = 5
  const boxWidth = maxPartWidth + padding * 2
  const boxHeight = totalPartHeight + padding * 2

  const box = createRect(0, 0, boxWidth, boxHeight, 3, 3)
  addClass(box, 'charset-box')

  // Position label
  translate(labelText, 0, labelBBox.height - 2)

  // Position box and parts - use fixed padding for consistent margins
  translate(box, 0, labelBBox.height + 2)
  translate(partContainer, padding, labelBBox.height + 2 + padding)

  group.appendChild(box)
  group.appendChild(labelText)
  group.appendChild(partContainer)

  const width = boxWidth
  const height = labelBBox.height + 2 + boxHeight

  const bbox: BBox = {
    x: 0,
    y: 0,
    width,
    height,
    x2: width,
    y2: height,
    cx: width / 2,
    cy: height / 2,
    ax: 0,
    ax2: width,
    ay: labelBBox.height + 2 + boxHeight / 2,
  }

  return { element: group, bbox, anchor: { ax: 0, ax2: width, ay: bbox.ay } }
}

/**
 * Get repeat label
 */
function getRepeatLabel(repeat: RepeatSpec): string | undefined {
  const { min, max } = repeat

  const formatTimes = (n: number) => n === 1 ? 'once' : `${n} times`

  if (min === max) {
    if (min === 0)
      return undefined
    return formatTimes(min - 1)
  }

  if (min <= 1 && max >= 2) {
    return `at most ${formatTimes(max - 1)}`
  }

  if (min >= 2) {
    if (max === -1) {
      return `${min - 1}+ times`
    }
    return `${min - 1}\u2026${formatTimes(max - 1)}`
  }

  return undefined
}

/**
 * Render a match fragment (content + optional repeat)
 */
function renderMatchFragment(node: Metadata, state: RenderState): RenderedNode {
  const content = node.content as Metadata
  const repeat = node.repeat as RepeatSpec | null

  // If no repeat, just render content
  if (!repeat || (repeat.min === 1 && repeat.max === 1)) {
    return renderNode(content, state)
  }

  const group = createGroup('match-fragment')

  // Render content
  const contentRendered = renderNode(content, state)
  const contentBBox = contentRendered.bbox

  const hasSkip = repeat.min === 0
  const hasLoop = repeat.max === -1 || repeat.max > 1

  // Offset content based on repeat type
  let offsetX = 0
  let offsetY = 0
  if (hasSkip) {
    offsetX = 15
    offsetY = 10
  }
  else if (hasLoop) {
    offsetX = 10
  }

  translate(contentRendered.element, offsetX, offsetY)
  group.appendChild(contentRendered.element)

  // Calculate content position after translation
  const contentX = offsetX
  const contentY = offsetY
  const contentAy = contentY + contentBBox.ay

  // Build paths
  const paths: string[] = []

  // Skip path (goes above content)
  if (hasSkip) {
    const vert = Math.max(0, contentBBox.ay - 10)
    const horiz = contentBBox.width - 10

    paths.push(
      `M0,${contentAy}q10,0 10,-10v${-vert}q0,-10 10,-10h${horiz}q10,0 10,10v${vert}q0,10 10,10`,
    )

    // Non-greedy arrow
    if (!repeat.greedy) {
      paths.push(`M10,${contentAy - 15}l5,5m-5,-5l-5,5`)
    }
  }

  // Loop path (goes below content)
  if (hasLoop) {
    const contentX2 = contentX + contentBBox.width
    const contentY2 = contentY + contentBBox.height
    const vert = contentY2 - contentAy - 10

    paths.push(
      `M${contentX},${contentAy}q-10,0 -10,10v${vert}q0,10 10,10h${contentBBox.width}q10,0 10,-10v${-vert}q0,-10 -10,-10`,
    )

    // Greedy arrow
    if (repeat.greedy) {
      paths.push(`M${contentX2 + 10},${contentAy + 15}l5,-5m-5,5l-5,-5`)
    }

    // Add horizontal connector lines from anchor points to loop entry/exit
    // Left side: from 0 to contentX
    paths.push(`M0,${contentAy}H${contentX}`)
    // Right side: from contentX2 to totalWidth
    const totalW = (hasSkip ? 15 : 10) + contentBBox.width + (hasSkip ? 15 : 10)
    paths.push(`M${contentX2},${contentAy}H${totalW}`)
  }

  if (paths.length > 0) {
    const pathEl = createPath(paths.join(''))
    group.appendChild(pathEl)
    moveToBack(pathEl)
  }

  // Add repeat label
  const labelStr = getRepeatLabel(repeat)
  let labelHeight = 0
  if (labelStr && hasLoop) {
    const label = createText(labelStr)
    addClass(label, 'repeat-label')
    const labelBBox = getBBox(label)

    // Position label just below the loop line, centered horizontally
    const totalW = (hasSkip ? 15 : 10) + contentBBox.width + (hasSkip ? 15 : 10)
    label.setAttribute('text-anchor', 'middle')
    label.setAttribute('x', String(totalW / 2))
    label.setAttribute('y', String(contentY + contentBBox.height + 5 + labelBBox.height))

    group.appendChild(label)
    labelHeight = labelBBox.height + 5
  }

  // Calculate final dimensions
  const totalWidth = (hasSkip ? 15 : 10) + contentBBox.width + (hasSkip ? 15 : 10)
  const totalHeight = (hasSkip ? 10 : 0) + contentBBox.height + (hasLoop ? 20 : 0) + labelHeight

  const bbox: BBox = {
    x: 0,
    y: 0,
    width: totalWidth,
    height: totalHeight,
    x2: totalWidth,
    y2: totalHeight,
    cx: totalWidth / 2,
    cy: totalHeight / 2,
    ax: 0,
    ax2: totalWidth,
    ay: contentAy,
  }

  return { element: group, bbox, anchor: { ax: 0, ax2: totalWidth, ay: contentAy } }
}

/**
 * Render a match (sequence of fragments)
 */
function renderMatch(node: Metadata, state: RenderState): RenderedNode {
  const group = createGroup('match')
  const parts = (node.parts as Metadata[]) || node.elements

  // Render each fragment
  const renderedParts: RenderedNode[] = []

  // Merge consecutive literals
  let i = 0
  while (i < parts.length) {
    const part = parts[i]
    if (!part) {
      i++
      continue
    }

    const content = part.content as Metadata | undefined

    // Check if we can merge literals
    if (content?.type === NodeType.Literal && !part.repeat) {
      let mergedText = (content.literal as string) || content.text
      let j = i + 1

      while (j < parts.length) {
        const nextPart = parts[j]
        if (!nextPart) {
          break
        }
        const nextContent = nextPart.content as Metadata | undefined
        if (nextContent?.type === NodeType.Literal && !nextPart.repeat) {
          mergedText += (nextContent.literal as string) || nextContent.text
          j++
        }
        else {
          break
        }
      }

      if (j > i + 1) {
        // Create merged literal
        const mergedNode: Metadata = {
          type: NodeType.Literal,
          text: mergedText,
          offset: content.offset,
          elements: [],
          literal: mergedText,
        }
        const rendered = renderLiteral(mergedNode)
        renderedParts.push(rendered)
        i = j
        continue
      }
    }

    const rendered = renderMatchFragment(part, state)
    renderedParts.push(rendered)
    i++
  }

  // Handle empty match (e.g., empty group)
  if (renderedParts.length === 0) {
    const placeholder = createPath('M0,0h10')
    group.appendChild(placeholder)
    return {
      element: group,
      bbox: normalizeBBox({ x: 0, y: 0, width: 10, height: 1 }),
    }
  }

  // Find max anchor-y for vertical alignment
  const maxAy = Math.max(...renderedParts.map(r => r.anchor?.ay ?? r.bbox.ay))

  // Position fragments horizontally, aligned by anchor-y
  let xOffset = 0
  const gap = 10
  const positionedParts: Array<{ rendered: RenderedNode, x: number, y: number }> = []

  for (const rendered of renderedParts) {
    const ay = rendered.anchor?.ay ?? rendered.bbox.ay
    const yOffset = maxAy - ay

    translate(rendered.element, xOffset, yOffset)
    group.appendChild(rendered.element)

    positionedParts.push({
      rendered,
      x: xOffset,
      y: yOffset,
    })

    xOffset += rendered.bbox.width + gap
  }

  // Calculate total dimensions
  const totalWidth = xOffset - gap
  const maxHeight = Math.max(...positionedParts.map(p => p.y + p.rendered.bbox.height))

  // Draw connector lines between fragments
  if (positionedParts.length > 1) {
    const connectorPaths: string[] = []
    for (let idx = 0; idx < positionedParts.length - 1; idx++) {
      const curr = positionedParts[idx]
      const next = positionedParts[idx + 1]
      if (curr && next) {
        const currAx2 = curr.x + (curr.rendered.anchor?.ax2 ?? curr.rendered.bbox.ax2)
        const nextAx = next.x + (next.rendered.anchor?.ax ?? next.rendered.bbox.ax)
        connectorPaths.push(`M${currAx2},${maxAy}H${nextAx}`)
      }
    }
    const connector = createPath(connectorPaths.join(''))
    group.appendChild(connector)
    moveToBack(connector)
  }

  // Calculate anchor points
  const firstPart = positionedParts[0]
  const lastPart = positionedParts[positionedParts.length - 1]
  const ax = firstPart ? firstPart.x + (firstPart.rendered.anchor?.ax ?? 0) : 0
  const ax2 = lastPart ? lastPart.x + (lastPart.rendered.anchor?.ax2 ?? lastPart.rendered.bbox.width) : totalWidth

  const bbox: BBox = {
    x: 0,
    y: 0,
    width: totalWidth,
    height: maxHeight,
    x2: totalWidth,
    y2: maxHeight,
    cx: totalWidth / 2,
    cy: maxHeight / 2,
    ax,
    ax2,
    ay: maxAy,
  }

  return {
    element: group,
    bbox,
    anchor: { ax, ax2, ay: maxAy },
  }
}

/**
 * Render a regexp (alternation of matches)
 */
function renderRegexp(node: Metadata, state: RenderState): RenderedNode {
  const group = createGroup('regexp')
  const matches = (node.matches as Metadata[]) || node.elements

  // Single match - just render it
  const firstMatch = matches[0]
  if (matches.length === 1 && firstMatch) {
    const rendered = renderMatch(firstMatch, state)
    group.appendChild(rendered.element)
    return {
      element: group,
      bbox: rendered.bbox,
      anchor: rendered.anchor,
    }
  }

  // Multiple matches - alternation
  // Render each match first
  const renderedMatches: RenderedNode[] = []
  let maxWidth = 0

  for (const match of matches) {
    const rendered = renderMatch(match, state)
    renderedMatches.push(rendered)
    maxWidth = Math.max(maxWidth, rendered.bbox.width)
  }

  // Position matches vertically, center-aligned
  const gap = 10
  let yOffset = 0
  const sideMargin = 20 // Space for curved connectors on each side
  const positionedMatches: Array<{ rendered: RenderedNode, y: number, ay: number }> = []

  for (const rendered of renderedMatches) {
    const xOffset = sideMargin + (maxWidth - rendered.bbox.width) / 2
    translate(rendered.element, xOffset, yOffset)
    group.appendChild(rendered.element)

    const ay = yOffset + (rendered.anchor?.ay ?? rendered.bbox.ay)
    positionedMatches.push({ rendered, y: yOffset, ay })

    yOffset += rendered.bbox.height + gap
  }

  const totalHeight = yOffset - gap
  const totalWidth = maxWidth + sideMargin * 2

  // Calculate center vertical position (average of first and last anchor points)
  const firstAy = positionedMatches[0]?.ay ?? 0
  const lastAy = positionedMatches[positionedMatches.length - 1]?.ay ?? totalHeight
  const centerY = (firstAy + lastAy) / 2

  // Draw curved connectors
  const paths: string[] = []

  for (let i = 0; i < positionedMatches.length; i++) {
    const match = positionedMatches[i]
    if (!match) continue

    const matchAy = match.ay
    const matchAx = sideMargin + (maxWidth - match.rendered.bbox.width) / 2 + (match.rendered.anchor?.ax ?? 0)
    const matchAx2 = sideMargin + (maxWidth - match.rendered.bbox.width) / 2 + (match.rendered.anchor?.ax2 ?? match.rendered.bbox.width)

    // Connector from left side to match
    const diffY = matchAy - centerY
    if (Math.abs(diffY) < 5) {
      // Nearly straight line
      paths.push(`M0,${centerY}H${matchAx}`)
    }
    else {
      // Curved connector
      const curveRadius = Math.min(10, Math.abs(diffY))
      const curveDir = diffY > 0 ? 1 : -1
      paths.push(`M0,${centerY}q${curveRadius},0 ${curveRadius},${curveDir * curveRadius}V${matchAy - curveDir * curveRadius}q0,${curveDir * curveRadius} ${curveRadius},${curveDir * curveRadius}H${matchAx}`)
    }

    // Connector from match to right side
    if (Math.abs(diffY) < 5) {
      paths.push(`M${matchAx2},${matchAy}H${totalWidth}`)
    }
    else {
      const curveRadius = Math.min(10, Math.abs(diffY))
      const curveDir = diffY > 0 ? 1 : -1
      paths.push(`M${matchAx2},${matchAy}H${totalWidth - 2 * curveRadius}q${curveRadius},0 ${curveRadius},${-curveDir * curveRadius}V${centerY + curveDir * curveRadius}q0,${-curveDir * curveRadius} ${curveRadius},${-curveDir * curveRadius}`)
    }
  }

  if (paths.length > 0) {
    const pathEl = createPath(paths.join(''))
    group.appendChild(pathEl)
    moveToBack(pathEl)
  }

  const bbox: BBox = {
    x: 0,
    y: 0,
    width: totalWidth,
    height: totalHeight,
    x2: totalWidth,
    y2: totalHeight,
    cx: totalWidth / 2,
    cy: totalHeight / 2,
    ax: 0,
    ax2: totalWidth,
    ay: centerY,
  }

  return {
    element: group,
    bbox,
    anchor: { ax: 0, ax2: totalWidth, ay: centerY },
  }
}

/**
 * Render a subexp (group)
 */
function renderSubexp(node: Metadata, state: RenderState): RenderedNode {
  const capture = node.capture as string
  const regexp = node.regexp as Metadata

  // Non-capturing group - just render content
  if (capture === '?:') {
    return renderRegexp(regexp, state)
  }

  const group = createGroup('subexp')

  // Determine label
  let label: string
  if (capture === '?=') {
    label = 'positive lookahead'
  }
  else if (capture === '?!') {
    label = 'negative lookahead'
  }
  else if (capture === '?<=') {
    label = 'positive lookbehind'
  }
  else if (capture === '?<!') {
    label = 'negative lookbehind'
  }
  else if (capture?.startsWith('?<') && capture.endsWith('>')) {
    // Named group
    const name = capture.slice(2, -1)
    state.groupCounter++
    label = `group #${state.groupCounter} (${name})`
  }
  else {
    state.groupCounter++
    label = `group #${state.groupCounter}`
  }

  // Render nested regexp
  const regexpRendered = renderRegexp(regexp, state)
  const contentBBox = regexpRendered.bbox

  // Create label and measure it
  const labelText = createText(label)
  addClass(labelText, 'subexp-label')
  const labelBBox = getBBox(labelText)

  // Calculate box dimensions
  const padding = 10
  const boxWidth = Math.max(contentBBox.width + padding * 2, labelBBox.width + 5)
  const boxHeight = contentBBox.height + padding * 2

  // Create box
  const box = createRect(0, 0, boxWidth, boxHeight, 3, 3)
  addClass(box, 'subexp-box')

  // Position label
  translate(labelText, 0, labelBBox.height - 2)

  // Position box
  translate(box, 0, labelBBox.height + 2)

  // Position content inside box (centered)
  const contentX = (boxWidth - contentBBox.width) / 2
  const contentY = labelBBox.height + 2 + padding
  translate(regexpRendered.element, contentX, contentY)

  group.appendChild(box)
  group.appendChild(labelText)
  group.appendChild(regexpRendered.element)

  const width = boxWidth
  const height = labelBBox.height + 2 + boxHeight

  // Calculate anchor points relative to the content inside
  const contentAy = contentY + (regexpRendered.anchor?.ay ?? contentBBox.ay)
  const contentAx = contentX + (regexpRendered.anchor?.ax ?? 0)
  const contentAx2 = contentX + (regexpRendered.anchor?.ax2 ?? contentBBox.width)

  const bbox: BBox = {
    x: 0,
    y: 0,
    width,
    height,
    x2: width,
    y2: height,
    cx: width / 2,
    cy: height / 2,
    ax: contentAx,
    ax2: contentAx2,
    ay: contentAy,
  }

  return {
    element: group,
    bbox,
    anchor: { ax: contentAx, ax2: contentAx2, ay: contentAy },
  }
}

/**
 * Render a root node (entire regex)
 */
function renderRoot(node: Metadata, state: RenderState): RenderedNode {
  const group = createGroup('root')
  const flags = node.flags as string
  const regexp = node.regexp as Metadata

  // Render flags label
  let flagHeight = 0
  if (flags) {
    const flagLabels = [...new Set(flags.split(''))]
      .sort()
      .map(f => FLAG_LABELS[f])
      .filter(Boolean)

    if (flagLabels.length > 0) {
      const flagText = createText(`Flags: ${flagLabels.join(', ')}`)
      const flagBBox = getBBox(flagText)
      translate(flagText, 0, flagBBox.height)
      group.appendChild(flagText)
      flagHeight = flagBBox.height + 10
    }
  }

  // Render regexp
  const regexpRendered = renderRegexp(regexp, state)
  const contentBBox = regexpRendered.bbox

  // Position regexp below flags with margin for start/end decorations
  const margin = 15
  translate(regexpRendered.element, margin, flagHeight)
  group.appendChild(regexpRendered.element)

  // Calculate anchor y after positioning
  const contentAy = flagHeight + (regexpRendered.anchor?.ay ?? contentBBox.ay)

  // Add decorative elements (start and end circles with lines)
  const endX = margin + contentBBox.width + margin

  const decorPath = createPath(
    `M0,${contentAy}H${margin + (regexpRendered.anchor?.ax ?? 0)}M${margin + (regexpRendered.anchor?.ax2 ?? contentBBox.width)},${contentAy}H${endX}`,
  )
  const startCircle = createCircle(0, contentAy, 5)
  const endCircle = createCircle(endX, contentAy, 5)

  group.appendChild(decorPath)
  group.appendChild(startCircle)
  group.appendChild(endCircle)

  const width = endX + 5
  const height = flagHeight + contentBBox.height

  const bbox: BBox = {
    x: 0,
    y: 0,
    width,
    height,
    x2: width,
    y2: height,
    cx: width / 2,
    cy: height / 2,
    ax: 0,
    ax2: width,
    ay: contentAy,
  }

  return { element: group, bbox }
}

/**
 * Render a node based on its type
 */
function renderNode(node: Metadata, state: RenderState): RenderedNode {
  switch (node.type) {
    case NodeType.Root:
      return renderRoot(node, state)
    case NodeType.Regexp:
      return renderRegexp(node, state)
    case NodeType.Match:
      return renderMatch(node, state)
    case NodeType.MatchFragment:
      return renderMatchFragment(node, state)
    case NodeType.Literal:
      return renderLiteral(node)
    case NodeType.Escape:
    case NodeType.CharsetEscape:
      return renderEscape(node)
    case NodeType.Anchor:
      return renderAnchor(node)
    case NodeType.AnyCharacter:
      return renderAnyCharacter()
    case NodeType.Charset:
      return renderCharset(node, state)
    case NodeType.CharsetRange:
      return renderCharsetRange(node, state)
    case NodeType.Subexp:
      return renderSubexp(node, state)
    default:
      // Unknown node type - render as literal
      return renderLabel(node.text, { round: 3 })
  }
}

/**
 * Main render function
 */
export function render(ast: Metadata, container: SVGSVGElement): void {
  const state: RenderState = {
    groupCounter: 0,
    container,
  }

  // Clear container
  while (container.firstChild) {
    container.removeChild(container.firstChild)
  }

  // Add styles
  const defs = createElement('defs')
  const style = createElement('style')
  style.textContent = getStyles()
  defs.appendChild(style)
  container.appendChild(defs)

  // Render AST
  const rendered = renderNode(ast, state)
  container.appendChild(rendered.element)

  // Set SVG size
  const bbox = getBBox(rendered.element)
  translate(rendered.element, 10 - bbox.x, 10 - bbox.y)

  container.setAttribute('width', String(bbox.width + 20))
  container.setAttribute('height', String(bbox.height + 20))
}

/**
 * Get CSS styles for the visualization
 */
function getStyles(): string {
  return `
    svg {
      background-color: transparent;
    }

    .root text,
    .root tspan {
      font: 12px Arial, sans-serif;
    }

    .root path {
      fill-opacity: 0;
      stroke-width: 2px;
      stroke: currentColor;
    }

    .root circle {
      fill: #6b6659;
      stroke-width: 2px;
      stroke: currentColor;
    }

    .anchor text,
    .any-character text {
      fill: #fff;
    }

    .anchor rect,
    .any-character rect {
      fill: #6b6659;
    }

    .escape text,
    .charset-escape text,
    .literal text {
      fill: #000;
    }

    .escape rect,
    .charset-escape rect {
      fill: #bada55;
    }

    .literal rect {
      fill: #dae9e5;
    }

    .charset .charset-box {
      fill: #cbcbba;
    }

    .subexp-label,
    .charset-label,
    .repeat-label {
      font-size: 10px;
      fill: #000;
    }

    .repeat-label {
      cursor: help;
    }

    .subexp-label,
    .charset-label {
      dominant-baseline: text-after-edge;
    }

    .subexp .subexp-box {
      stroke: #bfbfbf;
      stroke-dasharray: 6, 2;
      stroke-width: 2px;
      fill-opacity: 0;
    }

    .quote {
      fill: #8c8c8c;
    }

    /* Dark mode support (class-based via useDark) */
    html.dark .root path {
      stroke: #e5e5e5;
    }

    html.dark .root circle {
      fill: #9a9a8a;
      stroke: #e5e5e5;
    }

    html.dark .escape text,
    html.dark .charset-escape text,
    html.dark .literal text {
      fill: #1a1a1a;
    }

    html.dark .anchor rect,
    html.dark .any-character rect {
      fill: #8a8a7a;
    }

    html.dark .subexp .subexp-box {
      stroke: #888;
    }

    /* Labels without rect background need light color for contrast */
    html.dark .subexp-label,
    html.dark .charset-label,
    html.dark .repeat-label {
      fill: #e5e5e5;
    }
  `
}
