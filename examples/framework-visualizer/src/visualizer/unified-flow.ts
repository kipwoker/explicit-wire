import { AnimationEngine } from './animation-engine'
import { createSVG } from './unified-flow-svg'
import { drawAllNodes } from './unified-flow-nodes'
import { drawAllArrows } from './unified-flow-arrows'
import { drawLabelsAndLegend } from './unified-flow-legend'
import { drawStepNumbers } from './unified-flow-steps'
import { animateUnifiedFlow, resetAllNodes } from './unified-flow-animation'

/**
 * UnifiedFlowVisualizer - Displays the complete framework flow diagram
 * 
 * This visualizer shows the three main phases:
 * 1. Render Phase - ViewManager → Control → HTML String → DOM Injection
 * 2. Event Binding Phase - on() function → Collected Handlers → Mutation Observer → Registered Handlers
 * 3. Execution Phase - User Clicks → Proxy → Handler
 */
export class UnifiedFlowVisualizer {
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
    private animation: AnimationEngine
    private isAnimating: boolean = false
    private container: HTMLElement

    constructor(container: HTMLElement) {
        this.container = container
        this.animation = new AnimationEngine()
        this.svg = createSVG(container)
        this.drawInitialState()
    }

    /**
     * Draws the complete initial state of the flow diagram
     */
    private drawInitialState(): void {
        // Draw all nodes first
        drawAllNodes(this.svg)
        
        // Draw all arrows connecting the nodes
        drawAllArrows(this.svg)
        
        // Draw phase labels and legend
        drawLabelsAndLegend(this.svg)
        
        // Draw step numbers (on top)
        drawStepNumbers(this.svg)
    }

    /**
     * Sets the animation speed
     */
    setSpeed(speed: number): void {
        this.animation.setSpeed(speed)
    }

    /**
     * Runs the complete animation sequence
     */
    async animate(): Promise<void> {
        if (this.isAnimating) return
        this.isAnimating = true

        try {
            await animateUnifiedFlow(this.svg, this.animation)
        } finally {
            this.isAnimating = false
        }
    }

    /**
     * Resets all nodes to their initial state
     */
    reset(): void {
        resetAllNodes(this.svg)
    }

    /**
     * Cleans up the SVG element
     */
    destroy(): void {
        this.svg.selectAll('*').remove()
    }
}