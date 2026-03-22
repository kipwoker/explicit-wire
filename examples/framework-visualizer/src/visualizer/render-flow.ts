import * as d3 from 'd3'
import { AnimationEngine } from './animation-engine'

export class RenderFlowVisualizer {
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
    private animation: AnimationEngine
    private isAnimating: boolean = false

    constructor(container: HTMLElement) {
        this.animation = new AnimationEngine()
        this.svg = this.createSVG(container)
        this.drawInitialState()
    }

    private createSVG(container: HTMLElement): d3.Selection<SVGSVGElement, unknown, null, undefined> {
        const width = container.clientWidth
        const height = container.clientHeight

        const svg = d3.select(container)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${width} ${height}`)

        // Add arrowhead marker
        svg.append('defs')
            .append('marker')
            .attr('id', 'arrowhead-render')
            .attr('markerWidth', 10)
            .attr('markerHeight', 7)
            .attr('refX', 9)
            .attr('refY', 3.5)
            .attr('orient', 'auto')
            .append('polygon')
            .attr('points', '0 0, 10 3.5, 0 7')
            .attr('fill', '#667eea')

        return svg
    }

    private drawInitialState(): void {
        const width = 400
        const height = 450
        const centerX = width / 2

        // Define node positions
        const nodes = [
            { id: 'node-control', x: centerX, y: 40, label: 'Control.render()', sublabel: 'async method' },
            { id: 'node-html', x: centerX, y: 110, label: 'HTML String', sublabel: '"<div>...</div>"' },
            { id: 'node-pre', x: centerX, y: 180, label: 'preRenderActions', sublabel: '[] → execute' },
            { id: 'node-dom', x: centerX, y: 250, label: 'innerHTML', sublabel: 'DOM injection' },
            { id: 'node-post', x: centerX, y: 320, label: 'postRenderActions', sublabel: 'bind events' },
            { id: 'node-done', x: centerX, y: 390, label: 'View Ready', sublabel: 'interactive' },
        ]

        // Draw arrows
        for (let i = 0; i < nodes.length - 1; i++) {
            this.svg.append('path')
                .attr('id', `arrow-${i}`)
                .attr('class', 'flow-arrow')
                .attr('d', `M${nodes[i].x},${nodes[i].y + 25} L${nodes[i + 1].x},${nodes[i + 1].y - 25}`)
                .attr('marker-end', 'url(#arrowhead-render)')
        }

        // Draw nodes
        nodes.forEach(node => {
            const g = this.svg.append('g')
                .attr('id', node.id)
                .attr('transform', `translate(${node.x}, ${node.y})`)

            g.append('rect')
                .attr('class', 'flow-node')
                .attr('x', -80)
                .attr('y', -25)
                .attr('width', 160)
                .attr('height', 50)

            g.append('text')
                .attr('class', 'flow-text')
                .attr('y', -5)
                .text(node.label)

            g.append('text')
                .attr('class', 'flow-subtext')
                .attr('y', 15)
                .text(node.sublabel)
        })
    }

    setSpeed(speed: number): void {
        this.animation.setSpeed(speed)
    }

    async animate(): Promise<void> {
        if (this.isAnimating) return
        this.isAnimating = true

        try {
            // Reset all nodes
            const nodeIds = ['node-control', 'node-html', 'node-pre', 'node-dom', 'node-post', 'node-done']
            for (const id of nodeIds) {
                await this.animation.resetNode(this.svg, id)
            }

            // Step 1: Control.render()
            await this.animation.highlightNode(this.svg, 'node-control', '#667eea')
            await this.animation.delay(500)

            // Step 2: HTML String generated
            await this.animation.animateFlow(this.svg, 'arrow-0', '#667eea')
            await this.animation.highlightNode(this.svg, 'node-html', '#667eea')
            await this.animation.resetNode(this.svg, 'node-control')
            await this.animation.delay(500)

            // Step 3: preRenderActions
            await this.animation.animateFlow(this.svg, 'arrow-1', '#f093fb')
            await this.animation.highlightNode(this.svg, 'node-pre', '#f093fb')
            await this.animation.resetNode(this.svg, 'node-html')
            await this.animation.delay(500)

            // Step 4: DOM injection
            await this.animation.animateFlow(this.svg, 'arrow-2', '#f5576c')
            await this.animation.highlightNode(this.svg, 'node-dom', '#f5576c')
            await this.animation.resetNode(this.svg, 'node-pre')
            await this.animation.delay(500)

            // Step 5: postRenderActions
            await this.animation.animateFlow(this.svg, 'arrow-3', '#f093fb')
            await this.animation.highlightNode(this.svg, 'node-post', '#f093fb')
            await this.animation.resetNode(this.svg, 'node-dom')
            await this.animation.delay(500)

            // Step 6: Done
            await this.animation.animateFlow(this.svg, 'arrow-4', '#38ef7d')
            await this.animation.highlightNode(this.svg, 'node-done', '#38ef7d')
            await this.animation.resetNode(this.svg, 'node-post')
            await this.animation.delay(800)

            // Keep final state highlighted
        } finally {
            this.isAnimating = false
        }
    }

    reset(): void {
        const nodeIds = ['node-control', 'node-html', 'node-pre', 'node-dom', 'node-post', 'node-done']
        nodeIds.forEach(id => {
            const node = this.svg.select(`#${id} rect`)
            node.style('fill', 'rgba(102, 126, 234, 0.3)')
                .style('stroke', '#667eea')
                .style('stroke-width', '2')
                .style('filter', 'none')
        })
    }

    destroy(): void {
        this.svg.selectAll('*').remove()
    }
}