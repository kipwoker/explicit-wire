import * as d3 from 'd3'
import { AnimationEngine } from './animation-engine'

export class EventFlowVisualizer {
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

        // Add arrowhead markers
        const defs = svg.append('defs')
        
        defs.append('marker')
            .attr('id', 'arrowhead-event')
            .attr('markerWidth', 10)
            .attr('markerHeight', 7)
            .attr('refX', 9)
            .attr('refY', 3.5)
            .attr('orient', 'auto')
            .append('polygon')
            .attr('points', '0 0, 10 3.5, 0 7')
            .attr('fill', '#667eea')

        defs.append('marker')
            .attr('id', 'arrowhead-green')
            .attr('markerWidth', 10)
            .attr('markerHeight', 7)
            .attr('refX', 9)
            .attr('refY', 3.5)
            .attr('orient', 'auto')
            .append('polygon')
            .attr('points', '0 0, 10 3.5, 0 7')
            .attr('fill', '#38ef7d')

        return svg
    }

    private drawInitialState(): void {
        const width = 400
        const height = 450

        // Title
        this.svg.append('text')
            .attr('x', width / 2)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .attr('fill', '#888')
            .attr('font-size', '12px')
            .text('Event Subscription Lifecycle')

        // Collected pool
        this.svg.append('rect')
            .attr('id', 'collected-pool')
            .attr('class', 'handler-pool')
            .attr('x', 20)
            .attr('y', 40)
            .attr('width', 170)
            .attr('height', 100)
            .attr('rx', 8)

        this.svg.append('text')
            .attr('class', 'pool-label')
            .attr('x', 105)
            .attr('y', 55)
            .attr('text-anchor', 'middle')
            .text('collected.handlers')

        // Registered pool
        this.svg.append('rect')
            .attr('id', 'registered-pool')
            .attr('class', 'handler-pool')
            .attr('x', 210)
            .attr('y', 40)
            .attr('width', 170)
            .attr('height', 100)
            .attr('rx', 8)

        this.svg.append('text')
            .attr('class', 'pool-label')
            .attr('x', 295)
            .attr('y', 55)
            .attr('text-anchor', 'middle')
            .text('state.handlers')

        // MutationObserver
        this.svg.append('circle')
            .attr('id', 'observer')
            .attr('cx', width / 2)
            .attr('cy', 200)
            .attr('r', 30)
            .attr('class', 'observer-icon')
            .attr('fill', 'rgba(240, 147, 251, 0.3)')
            .attr('stroke', '#f093fb')
            .attr('stroke-width', 2)

        this.svg.append('text')
            .attr('x', width / 2)
            .attr('y', 195)
            .attr('text-anchor', 'middle')
            .attr('fill', '#fff')
            .attr('font-size', '11px')
            .attr('font-weight', '600')
            .text('Mutation')

        this.svg.append('text')
            .attr('x', width / 2)
            .attr('y', 210)
            .attr('text-anchor', 'middle')
            .attr('fill', '#fff')
            .attr('font-size', '11px')
            .attr('font-weight', '600')
            .text('Observer')

        // Arrow from collected to observer
        this.svg.append('path')
            .attr('id', 'arrow-collected-observer')
            .attr('class', 'flow-arrow')
            .attr('d', `M105,140 Q105,170 ${width / 2 - 35},185`)
            .attr('marker-end', 'url(#arrowhead-event)')

        // Arrow from observer to registered
        this.svg.append('path')
            .attr('id', 'arrow-observer-registered')
            .attr('class', 'flow-arrow')
            .attr('d', `M${width / 2 + 35},185 Q295,170 295,140`)
            .attr('marker-end', 'url(#arrowhead-event)')

        // DOM section
        this.svg.append('rect')
            .attr('id', 'dom-container')
            .attr('x', 20)
            .attr('y', 260)
            .attr('width', 360)
            .attr('height', 80)
            .attr('fill', 'rgba(0, 0, 0, 0.2)')
            .attr('stroke', 'rgba(255, 255, 255, 0.1)')
            .attr('rx', 8)

        this.svg.append('text')
            .attr('x', width / 2)
            .attr('y', 280)
            .attr('text-anchor', 'middle')
            .attr('fill', '#888')
            .attr('font-size', '12px')
            .text('DOM')

        // DOM element
        this.svg.append('rect')
            .attr('id', 'dom-element')
            .attr('class', 'dom-node')
            .attr('x', 150)
            .attr('y', 295)
            .attr('width', 100)
            .attr('height', 35)
            .attr('rx', 4)

        this.svg.append('text')
            .attr('id', 'dom-element-text')
            .attr('x', 200)
            .attr('y', 317)
            .attr('text-anchor', 'middle')
            .attr('class', 'dom-text')
            .text('#my-button')

        // Arrow from registered to DOM
        this.svg.append('path')
            .attr('id', 'arrow-registered-dom')
            .attr('class', 'flow-arrow')
            .attr('d', `M295,140 L295,290 L250,290`)
            .attr('marker-end', 'url(#arrowhead-event)')

        // Event firing section
        this.svg.append('rect')
            .attr('id', 'event-container')
            .attr('x', 20)
            .attr('y', 360)
            .attr('width', 360)
            .attr('height', 80)
            .attr('fill', 'rgba(0, 0, 0, 0.2)')
            .attr('stroke', 'rgba(255, 255, 255, 0.1)')
            .attr('rx', 8)

        this.svg.append('text')
            .attr('x', width / 2)
            .attr('y', 380)
            .attr('text-anchor', 'middle')
            .attr('fill', '#888')
            .attr('font-size', '12px')
            .text('Event Flow')

        // Event nodes
        const eventNodes = [
            { id: 'event-click', x: 70, label: 'click', sublabel: 'document' },
            { id: 'event-proxy', x: 170, label: 'proxy()', sublabel: 'find handler' },
            { id: 'event-handler', x: 270, label: 'handler()', sublabel: 'execute' },
            { id: 'event-cleanup', x: 370, label: 'cleanup', sublabel: 'unregister' },
        ]

        eventNodes.forEach((node, i) => {
            const g = this.svg.append('g')
                .attr('id', node.id)
                .attr('transform', `translate(${node.x - 50}, 395)`)

            g.append('rect')
                .attr('class', 'flow-node')
                .attr('width', 80)
                .attr('height', 35)
                .attr('rx', 4)

            g.append('text')
                .attr('class', 'flow-text')
                .attr('x', 40)
                .attr('y', 15)
                .attr('font-size', '11px')
                .text(node.label)

            g.append('text')
                .attr('class', 'flow-subtext')
                .attr('x', 40)
                .attr('y', 28)
                .attr('font-size', '9px')
                .text(node.sublabel)

            // Arrow to next node
            if (i < eventNodes.length - 1) {
                this.svg.append('path')
                    .attr('id', `arrow-event-${i}`)
                    .attr('class', 'flow-arrow')
                    .attr('d', `M${node.x + 30},412 L${eventNodes[i + 1].x - 70},412`)
                    .attr('marker-end', 'url(#arrowhead-event)')
            }
        })

        // Arrow from DOM to event
        this.svg.append('path')
            .attr('id', 'arrow-dom-event')
            .attr('class', 'flow-arrow')
            .attr('d', `M200,330 L200,390`)
            .attr('marker-end', 'url(#arrowhead-green)')

        // Legend
        this.drawLegend()
    }

    private drawLegend(): void {
        const legend = this.svg.append('g')
            .attr('transform', 'translate(20, 160)')

        const items = [
            { color: 'rgba(102, 126, 234, 0.6)', label: 'Collected handlers' },
            { color: 'rgba(56, 239, 125, 0.6)', label: 'Registered handlers' },
            { color: 'rgba(240, 147, 251, 0.6)', label: 'MutationObserver' },
        ]

        items.forEach((item, i) => {
            legend.append('rect')
                .attr('x', 0)
                .attr('y', i * 20)
                .attr('width', 12)
                .attr('height', 12)
                .attr('rx', 2)
                .attr('fill', item.color)

            legend.append('text')
                .attr('x', 18)
                .attr('y', i * 20 + 10)
                .attr('fill', '#888')
                .attr('font-size', '10px')
                .text(item.label)
        })
    }

    setSpeed(speed: number): void {
        this.animation.setSpeed(speed)
    }

    async animate(): Promise<void> {
        if (this.isAnimating) return
        this.isAnimating = true

        try {
            // Reset state
            this.reset()

            // Step 1: on() collects handler
            await this.animation.highlightNode(this.svg, 'collected-pool', '#667eea')
            await this.animation.delay(600)

            // Step 2: MutationObserver detects element
            await this.animation.pulseNode(this.svg, 'observer', '#f093fb')
            await this.animation.delay(400)

            // Step 3: Flow from collected to observer
            await this.animation.animateFlow(this.svg, 'arrow-collected-observer', '#667eea')
            await this.animation.delay(300)

            // Step 4: Flow from observer to registered
            await this.animation.animateFlow(this.svg, 'arrow-observer-registered', '#38ef7d')
            await this.animation.highlightNode(this.svg, 'registered-pool', '#38ef7d')
            await this.animation.resetNode(this.svg, 'collected-pool')
            await this.animation.delay(600)

            // Step 5: Highlight DOM element
            await this.animation.highlightNode(this.svg, 'dom-element', '#667eea')
            await this.animation.delay(400)

            // Step 6: Flow to DOM
            await this.animation.animateFlow(this.svg, 'arrow-registered-dom', '#667eea')
            await this.animation.delay(400)

            // Step 7: Event fired
            await this.animation.highlightNode(this.svg, 'event-click', '#f5576c')
            await this.animation.delay(500)

            // Step 8: proxy()
            await this.animation.animateFlow(this.svg, 'arrow-event-0', '#f5576c')
            await this.animation.highlightNode(this.svg, 'event-proxy', '#f5576c')
            await this.animation.resetNode(this.svg, 'event-click')
            await this.animation.delay(500)

            // Step 9: handler()
            await this.animation.animateFlow(this.svg, 'arrow-event-1', '#38ef7d')
            await this.animation.highlightNode(this.svg, 'event-handler', '#38ef7d')
            await this.animation.resetNode(this.svg, 'event-proxy')
            await this.animation.delay(500)

            // Step 10: cleanup
            await this.animation.animateFlow(this.svg, 'arrow-event-2', '#546e7a')
            await this.animation.highlightNode(this.svg, 'event-cleanup', '#546e7a')
            await this.animation.resetNode(this.svg, 'event-handler')
            await this.animation.resetNode(this.svg, 'registered-pool')
            await this.animation.resetNode(this.svg, 'dom-element')
            await this.animation.delay(800)

        } finally {
            this.isAnimating = false
        }
    }

    reset(): void {
        const nodeIds = ['collected-pool', 'registered-pool', 'dom-element', 
                        'event-click', 'event-proxy', 'event-handler', 'event-cleanup', 'observer']
        
        nodeIds.forEach(id => {
            const node = this.svg.select(`#${id}`)
            if (id === 'observer') {
                node.style('fill', 'rgba(240, 147, 251, 0.3)')
                    .style('stroke', '#f093fb')
            } else if (id.includes('pool')) {
                node.style('fill', 'rgba(255, 255, 255, 0.05)')
                    .style('stroke', 'rgba(255, 255, 255, 0.2)')
            } else if (id === 'dom-element') {
                node.style('fill', 'rgba(255, 255, 255, 0.1)')
                    .style('stroke', 'rgba(255, 255, 255, 0.3)')
            } else {
                const rect = this.svg.select(`#${id} rect`)
                rect.style('fill', 'rgba(102, 126, 234, 0.3)')
                    .style('stroke', '#667eea')
            }
            node.style('stroke-width', '2')
                .style('filter', 'none')
        })
    }

    destroy(): void {
        this.svg.selectAll('*').remove()
    }
}