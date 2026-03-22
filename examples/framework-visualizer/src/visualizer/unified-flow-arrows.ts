import * as d3 from 'd3'
import { LAYOUT, ARROW_IDS, MARKER_IDS } from './unified-flow-types'

/**
 * Creates a straight arrow path
 */
function createStraightArrow(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    id: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    markerId: string
): void {
    svg.append('path')
        .attr('id', id)
        .attr('class', 'flow-arrow')
        .attr('d', `M${x1},${y1} L${x2},${y2}`)
        .attr('marker-end', `url(#${markerId})`)
}

/**
 * Creates a curved arrow path
 */
function createCurvedArrow(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    id: string,
    path: string,
    markerId: string
): void {
    svg.append('path')
        .attr('id', id)
        .attr('class', 'flow-arrow')
        .attr('d', path)
        .attr('marker-end', `url(#${markerId})`)
}

// ==================== ARROW DRAWING FUNCTIONS ====================

/**
 * Arrow: ViewManager to Control (vertical)
 */
export function drawArrowVmToControl(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    const x = LAYOUT.columns.render + LAYOUT.node.width / 2
    const y1 = LAYOUT.rows.row1 + LAYOUT.node.height
    const y2 = LAYOUT.rows.row2
    
    createStraightArrow(svg, ARROW_IDS.vmToControl, x, y1, x, y2, MARKER_IDS.blue)
}

/**
 * Arrow: Control to HTML String (vertical)
 */
export function drawArrowControlToHtml(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    const x = LAYOUT.columns.render + LAYOUT.node.width / 2
    const y1 = LAYOUT.rows.row2 + LAYOUT.node.height
    const y2 = LAYOUT.rows.row3
    
    createStraightArrow(svg, ARROW_IDS.controlToHtml, x, y1, x, y2, MARKER_IDS.blue)
}

/**
 * Arrow: HTML String to DOM Injection (vertical)
 */
export function drawArrowHtmlToDom(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    const x = LAYOUT.columns.render + LAYOUT.node.width / 2
    const y1 = LAYOUT.rows.row3 + LAYOUT.node.height
    const y2 = LAYOUT.rows.row4 - 1
    
    createStraightArrow(svg, ARROW_IDS.htmlToDom, x, y1, x, y2, MARKER_IDS.red)
}

/**
 * Arrow: Control to on() function (curved, horizontal)
 */
export function drawArrowControlToOn(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    const x1 = LAYOUT.columns.render + LAYOUT.node.width + 5
    const y1 = LAYOUT.rows.row2 + LAYOUT.node.height / 2
    const x2 = LAYOUT.columns.eventBinding - 5
    const y2 = LAYOUT.rows.row1 + LAYOUT.node.height / 2
    
    const cp1x = LAYOUT.columns.render + LAYOUT.node.width + 50
    const cp2x = LAYOUT.columns.eventBinding - 50
    
    const path = `M${x1},${y1} C${cp1x},${y1} ${cp2x},${y2} ${x2},${y2}`
    
    createCurvedArrow(svg, ARROW_IDS.controlToOn, path, MARKER_IDS.purple)
}

/**
 * Arrow: on() to Collected handlers (vertical)
 */
export function drawArrowOnToCollected(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    const x = LAYOUT.columns.eventBinding + LAYOUT.node.width / 2
    const y1 = LAYOUT.rows.row1 + LAYOUT.node.height
    const y2 = LAYOUT.rows.row2 - 1
    
    createStraightArrow(svg, ARROW_IDS.onToCollected, x, y1, x, y2, MARKER_IDS.purple)
}

/**
 * Arrow: DOM Injection to Mutation Observer (curved)
 */
export function drawArrowDomToObserver(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    const x1 = LAYOUT.columns.render + LAYOUT.node.width + 5
    const y1 = LAYOUT.rows.row4 + LAYOUT.node.height / 2
    const x2 = LAYOUT.columns.eventBinding - 30
    const y2 = LAYOUT.rows.row3 + LAYOUT.node.height / 2
    
    const cp1x = LAYOUT.columns.render + LAYOUT.node.width + 80
    const cp2x = LAYOUT.columns.eventBinding - 80
    
    const path = `M${x1},${y1} C${cp1x},${y1} ${cp2x},${y2} ${x2},${y2}`
    
    createCurvedArrow(svg, ARROW_IDS.domToObserver, path, MARKER_IDS.purple)
}

/**
 * Arrow: Collected handlers to Mutation Observer (vertical)
 */
export function drawArrowCollectedToObserver(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    const x = LAYOUT.columns.eventBinding + LAYOUT.node.width / 2
    const y1 = LAYOUT.rows.row2 + LAYOUT.node.height
    const y2 = LAYOUT.rows.row3 - 11
    
    createStraightArrow(svg, ARROW_IDS.collectedToObserver, x, y1, x, y2, MARKER_IDS.purple)
}

/**
 * Arrow: Mutation Observer to Registered handlers (vertical)
 */
export function drawArrowObserverToRegistered(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    const x = LAYOUT.columns.eventBinding + LAYOUT.node.width / 2
    const y1 = LAYOUT.rows.row3 + LAYOUT.node.height / 2 + 45
    const y2 = LAYOUT.rows.row4 - 2
    
    createStraightArrow(svg, ARROW_IDS.observerToRegistered, x, y1, x, y2, MARKER_IDS.green)
}

/**
 * Arrow: Registered handlers to User Clicks (curved)
 */
export function drawArrowRegisteredToClick(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    const x1 = LAYOUT.columns.eventBinding + LAYOUT.node.width + 5
    const y1 = LAYOUT.rows.row4 + LAYOUT.node.height / 2
    const x2 = LAYOUT.columns.execution - 5
    const y2 = LAYOUT.rows.row2 + LAYOUT.node.height / 2
    
    const cp1x = LAYOUT.columns.eventBinding + LAYOUT.node.width + 80
    const cp2x = LAYOUT.columns.execution - 80
    
    const path = `M${x1},${y1} C${cp1x},${y1} ${cp2x},${y2} ${x2},${y2}`
    
    createCurvedArrow(svg, ARROW_IDS.registeredToClick, path, MARKER_IDS.red)
}

/**
 * Arrow: User Clicks to Proxy (vertical)
 */
export function drawArrowClickToProxy(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    const x = LAYOUT.columns.execution + LAYOUT.node.width / 2
    const y1 = LAYOUT.rows.row2 + LAYOUT.node.height
    const y2 = LAYOUT.rows.row3 - 1
    
    createStraightArrow(svg, ARROW_IDS.clickToProxy, x, y1, x, y2, MARKER_IDS.green)
}

/**
 * Arrow: Proxy to Handler (vertical)
 */
export function drawArrowProxyToHandler(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    const x = LAYOUT.columns.execution + LAYOUT.node.width / 2
    const y1 = LAYOUT.rows.row3 + LAYOUT.node.height
    const y2 = LAYOUT.rows.row4 - 1
    
    createStraightArrow(svg, ARROW_IDS.proxyToHandler, x, y1, x, y2, MARKER_IDS.green)
}

/**
 * Draws all arrows in the diagram
 */
export function drawAllArrows(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    // Render phase arrows
    drawArrowVmToControl(svg)
    drawArrowControlToHtml(svg)
    drawArrowHtmlToDom(svg)
    
    // Event binding arrows
    drawArrowControlToOn(svg)
    drawArrowOnToCollected(svg)
    drawArrowDomToObserver(svg)
    drawArrowCollectedToObserver(svg)
    drawArrowObserverToRegistered(svg)
    
    // Execution arrows
    drawArrowRegisteredToClick(svg)
    drawArrowClickToProxy(svg)
    drawArrowProxyToHandler(svg)
}