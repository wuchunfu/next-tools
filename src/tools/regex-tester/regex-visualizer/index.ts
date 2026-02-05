/**
 * Regex Visualizer - Railroad diagram renderer for regular expressions
 *
 * This module provides visualization of regular expressions as railroad diagrams.
 * It parses regex patterns into an AST and renders them as SVG.
 */

import { parse } from './parser'
import { render } from './renderer'

export { parse } from './parser'
export { render } from './renderer'
export type { BBox, Metadata, RenderOptions, RepeatSpec } from './types'
export { NodeType } from './types'

/**
 * Render a regular expression as an SVG railroad diagram
 *
 * @param regex - The regex string or RegExp object to visualize
 * @param container - The SVG element to render into
 */
export function renderRegex(regex: string | RegExp, container: SVGSVGElement): void {
  const ast = parse(regex)
  render(ast, container)
}

/**
 * Create a new SVG element with the regex visualization
 *
 * @param regex - The regex string or RegExp object to visualize
 * @returns An SVG element containing the visualization
 */
export function generateSVG(regex: string | RegExp): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  renderRegex(regex, svg)
  return svg
}
