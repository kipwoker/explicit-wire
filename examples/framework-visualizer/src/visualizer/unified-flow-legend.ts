import * as d3 from 'd3'
import { LAYOUT, COLORS, LEGEND_ITEMS, PHASE_LABELS } from './unified-flow-types'

/**
 * Draws the phase labels at the top of each column
 */
export function drawPhaseLabels(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    PHASE_LABELS.forEach(label => {
        svg.append('text')
            .attr('x', label.x)
            .attr('y', 30)
            .attr('text-anchor', 'middle')
            .attr('fill', label.color)
            .attr('font-size', '16px')
            .attr('font-weight', 'bold')
            .text(label.text)
    })
}

/**
 * Draws the legend box with color indicators
 */
export function drawLegend(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    const { x: legendX, y: legendY } = LAYOUT.legend
    const boxWidth = 140
    const boxHeight = 110

    // Legend background
    svg.append('rect')
        .attr('x', legendX)
        .attr('y', legendY)
        .attr('width', boxWidth)
        .attr('height', boxHeight)
        .attr('fill', 'rgba(0, 0, 0, 0.4)')
        .attr('rx', 10)

    // Legend title
    svg.append('text')
        .attr('x', legendX + boxWidth / 2)
        .attr('y', legendY + 20)
        .attr('text-anchor', 'middle')
        .attr('fill', COLORS.text.primary)
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text('Legend')

    // Legend items
    LEGEND_ITEMS.forEach((item, i) => {
        const itemY = legendY + 35 + i * 18

        // Color indicator
        svg.append('rect')
            .attr('x', legendX + 15)
            .attr('y', itemY)
            .attr('width', 12)
            .attr('height', 12)
            .attr('rx', 2)
            .attr('fill', item.color)

        // Label text
        svg.append('text')
            .attr('x', legendX + 33)
            .attr('y', itemY + 10)
            .attr('fill', COLORS.text.subtext)
            .attr('font-size', '11px')
            .text(item.label)
    })
}

/**
 * Draws both phase labels and legend
 */
export function drawLabelsAndLegend(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    drawPhaseLabels(svg)
    drawLegend(svg)
}
