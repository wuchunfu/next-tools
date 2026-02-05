/**
 * SVG utility functions for creating and manipulating SVG elements
 */

import type { BBox } from './types'

const SVG_NS = 'http://www.w3.org/2000/svg'

/**
 * Create an SVG element with optional attributes
 */
export function createElement<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number> = {},
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag)
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, String(value))
  }
  return el
}

/**
 * Create an SVG group element
 */
export function createGroup(className?: string): SVGGElement {
  const g = createElement('g')
  if (className) {
    g.setAttribute('class', className)
  }
  return g
}

/**
 * Create an SVG rect element
 */
export function createRect(
  x: number,
  y: number,
  width: number,
  height: number,
  rx = 0,
  ry = 0,
): SVGRectElement {
  return createElement('rect', { x, y, width, height, rx, ry })
}

/**
 * Create an SVG circle element
 */
export function createCircle(cx: number, cy: number, r: number): SVGCircleElement {
  return createElement('circle', { cx, cy, r })
}

/**
 * Create an SVG path element
 */
export function createPath(d: string): SVGPathElement {
  return createElement('path', { d })
}

/**
 * Create an SVG text element
 * @param content - Text content (string or array of inline spans)
 * @param x - X position
 * @param y - Y position
 * @param multiline - If true, array items are rendered as separate lines. If false (default), they're inline.
 */
export function createText(
  content: string | string[],
  x = 0,
  y = 0,
  multiline = false,
): SVGTextElement {
  const text = createElement('text', { x, y })
  const items = Array.isArray(content) ? content : [content]

  if (multiline) {
    // Render as multiple lines
    items.forEach((line, i) => {
      const tspan = createElement('tspan')
      tspan.textContent = line
      if (i > 0) {
        tspan.setAttribute('x', String(x))
        tspan.setAttribute('dy', '1.2em')
      }
      text.appendChild(tspan)
    })
  }
  else {
    // Render inline (all items on same line)
    items.forEach((item) => {
      const tspan = createElement('tspan')
      tspan.textContent = item
      text.appendChild(tspan)
    })
  }

  return text
}

/**
 * Get bounding box of an SVG element
 */
export function getBBox(element: SVGGraphicsElement): BBox {
  // Ensure element is in DOM for getBBox to work
  const wasInDoc = element.ownerDocument.contains(element)
  let tempParent: SVGSVGElement | null = null

  if (!wasInDoc) {
    // Create temporary SVG to measure
    tempParent = createElement('svg')
    tempParent.style.position = 'absolute'
    tempParent.style.visibility = 'hidden'
    tempParent.style.width = '0'
    tempParent.style.height = '0'
    tempParent.appendChild(element.cloneNode(true))
    document.body.appendChild(tempParent)
  }

  let bbox: DOMRect
  try {
    bbox = wasInDoc ? element.getBBox() : (tempParent!.firstChild as SVGGraphicsElement).getBBox()
  }
  catch {
    // Fallback for empty elements
    bbox = new DOMRect(0, 0, 0, 0)
  }

  if (tempParent) {
    document.body.removeChild(tempParent)
  }

  return normalizeBBox({
    x: bbox.x,
    y: bbox.y,
    width: bbox.width,
    height: bbox.height,
    x2: bbox.x + bbox.width,
    y2: bbox.y + bbox.height,
    cx: bbox.x + bbox.width / 2,
    cy: bbox.y + bbox.height / 2,
    ax: bbox.x,
    ax2: bbox.x + bbox.width,
    ay: bbox.y + bbox.height / 2,
  })
}

/**
 * Normalize a bounding box to ensure all anchor properties exist
 */
export function normalizeBBox(box: Partial<BBox>): BBox {
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
 * Apply translation transform to an element
 */
export function translate(element: SVGElement, tx: number, ty: number): void {
  const currentTransform = element.getAttribute('transform') || ''
  const newTransform = `translate(${tx}, ${ty})`

  // Remove existing translate and prepend new one
  const withoutTranslate = currentTransform.replace(/translate\([^)]*\)\s*/g, '')
  element.setAttribute('transform', `${newTransform} ${withoutTranslate}`.trim())
}

/**
 * Get the transform matrix of an element
 */
export function getTransformMatrix(element: SVGGraphicsElement): DOMMatrix {
  try {
    return element.getCTM() || new DOMMatrix()
  }
  catch {
    return new DOMMatrix()
  }
}

/**
 * Transform a point using an element's matrix
 */
export function transformPoint(
  x: number,
  y: number,
  matrix: DOMMatrix,
): { x: number, y: number } {
  const point = new DOMPoint(x, y)
  const transformed = point.matrixTransform(matrix)
  return { x: transformed.x, y: transformed.y }
}

/**
 * Get bbox with transform applied
 */
export function getBBoxWithTransform(element: SVGGraphicsElement): BBox {
  const bbox = getBBox(element)
  const matrix = getTransformMatrix(element)

  if (matrix.isIdentity) {
    return bbox
  }

  const p1 = transformPoint(bbox.x, bbox.y, matrix)
  const p2 = transformPoint(bbox.x2, bbox.y2, matrix)

  const x = Math.min(p1.x, p2.x)
  const y = Math.min(p1.y, p2.y)
  const x2 = Math.max(p1.x, p2.x)
  const y2 = Math.max(p1.y, p2.y)

  return normalizeBBox({
    x,
    y,
    width: x2 - x,
    height: y2 - y,
    x2,
    y2,
    cx: (x + x2) / 2,
    cy: (y + y2) / 2,
    ax: bbox.ax + (matrix.e || 0),
    ax2: bbox.ax2 + (matrix.e || 0),
    ay: bbox.ay + (matrix.f || 0),
  })
}

/**
 * Space nodes horizontally with their vertical centers aligned
 */
export function spaceHorizontal(
  nodes: Array<{ element: SVGElement, bbox: BBox }>,
  padding: number,
): void {
  if (nodes.length === 0)
    return

  // Find the maximum vertical anchor point
  const verticalCenter = Math.max(...nodes.map(n => n.bbox.ay))

  // Position items with padding and align anchors
  let offset = 0
  for (const node of nodes) {
    translate(node.element, offset - node.bbox.x, verticalCenter - node.bbox.ay)
    offset += node.bbox.width + padding
  }
}

/**
 * Space nodes vertically with their horizontal centers aligned
 */
export function spaceVertical(
  nodes: Array<{ element: SVGElement, bbox: BBox }>,
  padding: number,
): void {
  if (nodes.length === 0)
    return

  // Find the maximum horizontal center
  const horizontalCenter = Math.max(...nodes.map(n => n.bbox.cx))

  // Position items with padding and align centers
  let offset = 0
  for (const node of nodes) {
    translate(node.element, horizontalCenter - node.bbox.cx, offset - node.bbox.y)
    offset += node.bbox.height + padding
  }
}

/**
 * Add a class to an SVG element
 */
export function addClass(element: SVGElement, className: string): void {
  const current = element.getAttribute('class') || ''
  if (!current.split(' ').includes(className)) {
    element.setAttribute('class', `${current} ${className}`.trim())
  }
}

/**
 * Move element to the back (first child)
 */
export function moveToBack(element: Element): void {
  const parent = element.parentNode
  if (parent && parent.firstChild !== element) {
    parent.insertBefore(element, parent.firstChild)
  }
}
