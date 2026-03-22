import * as d3 from 'd3'
import { STEP_NUMBERS } from './unified-flow-types'

/**
 * Draws the step number circles and labels
 */
export function drawStepNumbers(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    STEP_NUMBERS.forEach(step => {
        // Step circle background
        svg.append('circle')
            .attr('cx', step.x)
            .attr('cy', step.y)
            .attr('r', 12)
            .attr('fill', step.color)

        // Step number text
        svg.append('text')
            .attr('x', step.x)
            .attr('y', step.y + 4)
            .attr('text-anchor', 'middle')
            .attr('fill', '#fff')
            .attr('font-size', '11px')
            .attr('font-weight', 'bold')
            .text(step.num)
    })
}