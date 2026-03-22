import * as d3 from 'd3'
import { MARKER_IDS, COLORS } from './unified-flow-types'

/**
 * Creates the SVG element with arrowhead markers
 */
export function createSVG(container: HTMLElement): d3.Selection<SVGSVGElement, unknown, null, undefined> {
    const width = container.clientWidth
    const height = container.clientHeight

    const svg = d3.select(container)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)

    // Add arrowhead markers
    const defs = svg.append('defs')
    
    createArrowMarker(defs, MARKER_IDS.blue, COLORS.render)
    createArrowMarker(defs, MARKER_IDS.green, COLORS.execution)
    createArrowMarker(defs, MARKER_IDS.purple, COLORS.eventBinding)
    createArrowMarker(defs, MARKER_IDS.red, COLORS.domChanges)

    return svg
}

/**
 * Creates a single arrowhead marker
 */
function createArrowMarker(
    defs: d3.Selection<SVGDefsElement, unknown, null, undefined>,
    id: string,
    color: string
): void {
    defs.append('marker')
        .attr('id', id)
        .attr('markerWidth', 10)
        .attr('markerHeight', 7)
        .attr('refX', 9)
        .attr('refY', 3.5)
        .attr('orient', 'auto')
        .append('polygon')
        .attr('points', '0 0, 10 3.5, 0 7')
        .attr('fill', color)
}