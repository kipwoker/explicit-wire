import * as d3 from 'd3'

export interface AnimationConfig {
    speed: number // 1 = normal, 0.5 = slow, 2 = fast
}

export class AnimationEngine {
    private config: AnimationConfig

    constructor(config: AnimationConfig = { speed: 1 }) {
        this.config = config
    }

    setSpeed(speed: number) {
        this.config.speed = speed
    }

    private getDuration(baseMs: number): number {
        return baseMs / this.config.speed
    }

    async animateFlow(
        svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
        pathId: string,
        color: string = '#38ef7d'
    ): Promise<void> {
        return new Promise((resolve) => {
            const path = svg.select(`#${pathId}`)
            const pathNode = path.node() as SVGPathElement

            if (!pathNode) {
                resolve()
                return
            }

            const pathLength = pathNode.getTotalLength()

            // Create particle
            const particle = svg.append('circle')
                .attr('class', 'particle')
                .attr('r', 6)
                .attr('fill', color)
                .style('filter', `drop-shadow(0 0 8px ${color})`)

            // Animate along path
            particle.transition()
                .duration(this.getDuration(800))
                .ease(d3.easeLinear)
                .attrTween('transform', () => {
                    return (t: number) => {
                        const point = pathNode.getPointAtLength(t * pathLength)
                        return `translate(${point.x}, ${point.y})`
                    }
                })
                .on('end', () => {
                    particle.remove()
                    resolve()
                })
        })
    }

    async pulseNode(
        svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
        nodeId: string,
        color: string = '#667eea'
    ): Promise<void> {
        return new Promise((resolve) => {
            const node = svg.select(`#${nodeId}`)

            node.transition()
                .duration(this.getDuration(150))
                .style('filter', `drop-shadow(0 0 15px ${color})`)
                .transition()
                .duration(this.getDuration(150))
                .style('filter', 'none')
                .on('end', () => resolve())
        })
    }

    async highlightNode(
        svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
        nodeId: string,
        color: string = '#667eea'
    ): Promise<void> {
        return new Promise((resolve) => {
            const node = svg.select(`#${nodeId}`)

            node.transition()
                .duration(this.getDuration(300))
                .style('fill', color.replace(')', ', 0.6)').replace('rgb', 'rgba'))
                .style('stroke-width', '3')
                .style('filter', `drop-shadow(0 0 10px ${color})`)
                .on('end', () => resolve())
        })
    }

    async resetNode(
        svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
        nodeId: string,
        originalFill: string = 'rgba(102, 126, 234, 0.3)'
    ): Promise<void> {
        return new Promise((resolve) => {
            const node = svg.select(`#${nodeId}`)

            node.transition()
                .duration(this.getDuration(200))
                .style('fill', originalFill)
                .style('stroke-width', '2')
                .style('filter', 'none')
                .on('end', () => resolve())
        })
    }

    async moveElement(
        svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
        elementId: string,
        targetX: number,
        targetY: number
    ): Promise<void> {
        return new Promise((resolve) => {
            const element = svg.select(`#${elementId}`)

            element.transition()
                .duration(this.getDuration(500))
                .ease(d3.easeCubicInOut)
                .attr('transform', `translate(${targetX}, ${targetY})`)
                .on('end', () => resolve())
        })
    }

    async fadeIn(
        svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
        elementId: string
    ): Promise<void> {
        return new Promise((resolve) => {
            const element = svg.select(`#${elementId}`)

            element
                .style('opacity', 0)
                .transition()
                .duration(this.getDuration(300))
                .style('opacity', 1)
                .on('end', () => resolve())
        })
    }

    async fadeOut(
        svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
        elementId: string
    ): Promise<void> {
        return new Promise((resolve) => {
            const element = svg.select(`#${elementId}`)

            element.transition()
                .duration(this.getDuration(300))
                .style('opacity', 0)
                .on('end', () => resolve())
        })
    }

    async showCodeHighlight(
        container: HTMLElement,
        lineNumber: number
    ): Promise<void> {
        return new Promise((resolve) => {
            const lines = container.querySelectorAll('.code-line')
            lines.forEach((line, i) => {
                if (i === lineNumber) {
                    (line as HTMLElement).style.background = 'rgba(102, 126, 234, 0.3)'
                    ;(line as HTMLElement).style.transition = 'background 0.3s ease'
                } else {
                    (line as HTMLElement).style.background = 'transparent'
                }
            })
            setTimeout(resolve, this.getDuration(300))
        })
    }

    async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, this.getDuration(ms)))
    }

    async highlightStepIndicator(stepId: string): Promise<void> {
        return new Promise((resolve) => {
            const element = document.getElementById(stepId)
            if (element) {
                element.classList.add('active')
            }
            setTimeout(resolve, this.getDuration(100))
        })
    }

    async resetStepIndicator(stepId: string): Promise<void> {
        return new Promise((resolve) => {
            const element = document.getElementById(stepId)
            if (element) {
                element.classList.remove('active')
            }
            setTimeout(resolve, this.getDuration(100))
        })
    }

    resetAllStepIndicators(): void {
        for (let i = 1; i <= 8; i++) {
            const element = document.getElementById(`step-${i}`)
            if (element) {
                element.classList.remove('active')
            }
        }
    }
}
