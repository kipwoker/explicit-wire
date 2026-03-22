import * as d3 from 'd3'
import { LAYOUT, COLORS, NODE_IDS } from './unified-flow-types'

/**
 * Creates a standard flow node group
 */
function createNodeGroup(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    id: string
): d3.Selection<SVGGElement, unknown, null, undefined> {
    return svg.append('g').attr('id', id)
}

/**
 * Draws a rectangle node with text
 */
function drawRectNode(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    x: number,
    y: number,
    mainText: string,
    subText: string,
    fillStyle?: string,
    strokeColor?: string
): void {
    const { width, height } = LAYOUT.node
    
    const rect = g.append('rect')
        .attr('class', 'flow-node')
        .attr('x', x)
        .attr('y', y)
        .attr('width', width)
        .attr('height', height)
        .attr('rx', 10)
    
    if (fillStyle) {
        rect.attr('style', `fill: ${fillStyle}; stroke: ${strokeColor || COLORS.render}`)
    }

    g.append('text')
        .attr('class', 'flow-text')
        .attr('x', x + width / 2)
        .attr('y', y + 25)
        .text(mainText)

    g.append('text')
        .attr('class', 'flow-subtext')
        .attr('x', x + width / 2)
        .attr('y', y + 45)
        .text(subText)
}

/**
 * Draws a handler pool node (special style)
 */
function drawHandlerPool(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    x: number,
    y: number,
    label: string,
    value: string,
    strokeColor?: string
): void {
    const { width, height } = LAYOUT.node
    
    g.append('rect')
        .attr('class', 'handler-pool')
        .attr('x', x)
        .attr('y', y)
        .attr('width', width)
        .attr('height', height)
        .attr('rx', 10)
        .attr('style', strokeColor ? `stroke: ${strokeColor}` : '')

    g.append('text')
        .attr('class', 'pool-label')
        .attr('x', x + width / 2)
        .attr('y', y + 22)
        .attr('text-anchor', 'middle')
        .text(label)

    g.append('text')
        .attr('x', x + width / 2)
        .attr('y', y + 42)
        .attr('text-anchor', 'middle')
        .attr('fill', COLORS.text.secondary)
        .attr('font-size', '11px')
        .text(value)
}

// ==================== SECTION DRAWING FUNCTIONS ====================

/**
 * Section 1: ViewManager node
 */
export function drawViewManagerNode(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    const g = createNodeGroup(svg, NODE_IDS.viewManager)
    drawRectNode(g, LAYOUT.columns.render, LAYOUT.rows.row1, 'ViewManager', 'replace()')
}

/**
 * Section 2: Control node
 */
export function drawControlNode(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    const g = createNodeGroup(svg, NODE_IDS.control)
    drawRectNode(g, LAYOUT.columns.render, LAYOUT.rows.row2, 'Control', 'render() async')
}

/**
 * Section 3: HTML String node
 */
export function drawHtmlStringNode(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    const g = createNodeGroup(svg, NODE_IDS.htmlString)
    drawRectNode(g, LAYOUT.columns.render, LAYOUT.rows.row3, 'HTML String', 'Generated')
}

/**
 * Section 4: DOM Injection node
 */
export function drawDomInjectionNode(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    const g = createNodeGroup(svg, NODE_IDS.domInjection)
    drawRectNode(
        g, 
        LAYOUT.columns.render, 
        LAYOUT.rows.row4, 
        'innerHTML', 
        'Injection',
        COLORS.fills.domChanges,
        COLORS.domChanges
    )
}

/**
 * Section 5: on() function node
 */
export function drawOnFunctionNode(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    const g = createNodeGroup(svg, NODE_IDS.onFunction)
    drawRectNode(
        g, 
        LAYOUT.columns.eventBinding, 
        LAYOUT.rows.row1, 
        "on('click','btn')", 
        'collects handler',
        COLORS.fills.eventBinding,
        COLORS.eventBinding
    )
}

/**
 * Section 6: Collected handlers pool
 */
export function drawCollectedHandlersNode(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    const g = createNodeGroup(svg, NODE_IDS.collectedHandlers)
    drawHandlerPool(g, LAYOUT.columns.eventBinding, LAYOUT.rows.row2, 'collected.handlers', '{ click: { btn: h } }')
}

/**
 * Section 7: Mutation Observer node (circular)
 */
export function drawMutationObserverNode(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    const g = createNodeGroup(svg, NODE_IDS.mutationObserver)
    const cx = LAYOUT.columns.eventBinding + LAYOUT.node.width / 2
    const cy = LAYOUT.rows.row3 + LAYOUT.node.height / 2
    
    g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 40)
        .attr('style', `fill: ${COLORS.fills.eventBinding}; stroke: ${COLORS.eventBinding}; stroke-width: 2`)

    g.append('text')
        .attr('x', cx)
        .attr('y', cy - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', COLORS.text.primary)
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text('Mutation')

    g.append('text')
        .attr('x', cx)
        .attr('y', cy + 12)
        .attr('text-anchor', 'middle')
        .attr('fill', COLORS.text.primary)
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text('Observer')
}

/**
 * Section 8: Registered handlers node
 */
export function drawRegisteredHandlersNode(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    const g = createNodeGroup(svg, NODE_IDS.registeredHandlers)
    drawHandlerPool(
        g, 
        LAYOUT.columns.eventBinding, 
        LAYOUT.rows.row4, 
        'state.handlers', 
        '{ click: { btn: h } }',
        COLORS.execution
    )
}

/**
 * Section 9: User Clicks node
 */
export function drawUserClicksNode(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    const g = createNodeGroup(svg, NODE_IDS.userClicks)
    drawRectNode(
        g, 
        LAYOUT.columns.execution, 
        LAYOUT.rows.row2, 
        'User Clicks', 
        'Button Event',
        COLORS.fills.domChanges,
        COLORS.domChanges
    )
}

/**
 * Section 10: Proxy node
 */
export function drawProxyNode(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    const g = createNodeGroup(svg, NODE_IDS.proxy)
    drawRectNode(
        g, 
        LAYOUT.columns.execution, 
        LAYOUT.rows.row3, 
        'proxy(event)', 
        'find by targetId',
        COLORS.fills.execution,
        COLORS.execution
    )
}

/**
 * Section 11: Handler node
 */
export function drawHandlerNode(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    const g = createNodeGroup(svg, NODE_IDS.handler)
    drawRectNode(
        g, 
        LAYOUT.columns.execution, 
        LAYOUT.rows.row4, 
        'handler(event)', 
        'your code runs!',
        COLORS.fills.execution,
        COLORS.execution
    )
}

/**
 * Draws all nodes in the diagram
 */
export function drawAllNodes(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    // Render phase nodes
    drawViewManagerNode(svg)
    drawControlNode(svg)
    drawHtmlStringNode(svg)
    drawDomInjectionNode(svg)
    
    // Event binding phase nodes
    drawOnFunctionNode(svg)
    drawCollectedHandlersNode(svg)
    drawMutationObserverNode(svg)
    drawRegisteredHandlersNode(svg)
    
    // Execution phase nodes
    drawUserClicksNode(svg)
    drawProxyNode(svg)
    drawHandlerNode(svg)
}