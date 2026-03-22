import * as d3 from 'd3'
import { AnimationEngine } from './animation-engine'
import { ARROW_IDS, NODE_IDS, COLORS, STEP_INDICATOR_IDS } from './unified-flow-types'

/**
 * Defines the animation sequence for the unified flow diagram
 */
export async function animateUnifiedFlow(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    animation: AnimationEngine
): Promise<void> {
    // Reset all nodes first
    resetAllNodes(svg)
    animation.resetAllStepIndicators()
    
    // ===== RENDER PHASE =====
    
    // Step 1: ViewManager highlighted
    await animation.highlightNode(svg, NODE_IDS.viewManager, COLORS.render)
    await animation.highlightStepIndicator(STEP_INDICATOR_IDS.step1)
    await animation.delay(400)
    
    // Arrow from ViewManager to Control
    await animation.animateFlow(svg, ARROW_IDS.vmToControl, COLORS.render)
    
    // Step 2: Control highlighted, ViewManager reset
    await animation.highlightNode(svg, NODE_IDS.control, COLORS.render)
    await animation.resetNode(svg, NODE_IDS.viewManager)
    await animation.resetStepIndicator(STEP_INDICATOR_IDS.step1)
    await animation.highlightStepIndicator(STEP_INDICATOR_IDS.step2)
    await animation.delay(400)
    
    // ===== EVENT BINDING PHASE (parallel start) =====
    
    // Arrow from Control to on() function
    await animation.animateFlow(svg, ARROW_IDS.controlToOn, COLORS.eventBinding)
    
    // Step 3: on() function highlighted
    await animation.highlightNode(svg, NODE_IDS.onFunction, COLORS.eventBinding)
    await animation.resetStepIndicator(STEP_INDICATOR_IDS.step2)
    await animation.highlightStepIndicator(STEP_INDICATOR_IDS.step3)
    await animation.delay(300)
    
    // Arrow from on() to collected handlers
    await animation.animateFlow(svg, ARROW_IDS.onToCollected, COLORS.eventBinding)
    
    // Step 4: Collected handlers highlighted, on() reset
    await animation.highlightNode(svg, NODE_IDS.collectedHandlers, COLORS.eventBinding)
    await animation.resetNode(svg, NODE_IDS.onFunction)
    // Step 3 still active (collected handlers is part of on() flow)
    await animation.delay(400)
    
    // ===== RENDER PHASE (continuation) =====
    
    // Arrow from Control to HTML String
    await animation.animateFlow(svg, ARROW_IDS.controlToHtml, COLORS.render)
    
    // Step 5: HTML String highlighted, Control reset
    await animation.highlightNode(svg, NODE_IDS.htmlString, COLORS.render)
    await animation.resetNode(svg, NODE_IDS.control)
    await animation.resetStepIndicator(STEP_INDICATOR_IDS.step3)
    await animation.highlightStepIndicator(STEP_INDICATOR_IDS.step4)
    await animation.delay(400)
    
    // Arrow from HTML to DOM Injection
    await animation.animateFlow(svg, ARROW_IDS.htmlToDom, COLORS.domChanges)
    
    // Step 6: DOM Injection highlighted, HTML reset
    await animation.highlightNode(svg, NODE_IDS.domInjection, COLORS.domChanges)
    await animation.resetNode(svg, NODE_IDS.htmlString)
    // Step 4 still active (DOM injection is part of HTML → innerHTML)
    await animation.delay(400)
    
    // ===== EVENT BINDING PHASE (continuation) =====
    
    // Arrow from DOM to Mutation Observer
    await animation.animateFlow(svg, ARROW_IDS.domToObserver, COLORS.eventBinding)
    
    // Step 7: Mutation Observer pulse
    await animation.pulseNode(svg, NODE_IDS.mutationObserver, COLORS.eventBinding)
    await animation.resetNode(svg, NODE_IDS.domInjection)
    await animation.resetStepIndicator(STEP_INDICATOR_IDS.step4)
    await animation.highlightStepIndicator(STEP_INDICATOR_IDS.step5)
    await animation.delay(400)
    
    // Arrow from collected to observer
    await animation.animateFlow(svg, ARROW_IDS.collectedToObserver, COLORS.eventBinding)
    await animation.delay(200)
    
    // Arrow from observer to registered
    await animation.animateFlow(svg, ARROW_IDS.observerToRegistered, COLORS.execution)
    
    // Step 8: Registered handlers highlighted, collected and observer reset
    await animation.highlightNode(svg, NODE_IDS.registeredHandlers, COLORS.execution)
    await animation.resetNode(svg, NODE_IDS.collectedHandlers)
    await animation.resetNode(svg, NODE_IDS.mutationObserver)
    await animation.resetStepIndicator(STEP_INDICATOR_IDS.step5)
    await animation.highlightStepIndicator(STEP_INDICATOR_IDS.step6)
    await animation.delay(600)
    
    // ===== EXECUTION PHASE =====
    
    // Step 9: User Clicks highlighted
    await animation.highlightNode(svg, NODE_IDS.userClicks, COLORS.domChanges)
    await animation.resetStepIndicator(STEP_INDICATOR_IDS.step6)
    await animation.highlightStepIndicator(STEP_INDICATOR_IDS.step7)
    await animation.delay(400)
    
    // Arrow from registered to click
    await animation.animateFlow(svg, ARROW_IDS.registeredToClick, COLORS.execution)
    
    // Arrow from click to proxy
    await animation.animateFlow(svg, ARROW_IDS.clickToProxy, COLORS.execution)
    
    // Step 10: Proxy highlighted, User Clicks reset
    await animation.highlightNode(svg, NODE_IDS.proxy, COLORS.execution)
    await animation.resetNode(svg, NODE_IDS.userClicks)
    await animation.resetNode(svg, NODE_IDS.registeredHandlers)
    await animation.resetStepIndicator(STEP_INDICATOR_IDS.step7)
    await animation.highlightStepIndicator(STEP_INDICATOR_IDS.step8)
    await animation.delay(400)
    
    // Arrow from proxy to handler
    await animation.animateFlow(svg, ARROW_IDS.proxyToHandler, COLORS.execution)
    
    // Step 11: Handler highlighted, Proxy reset
    await animation.highlightNode(svg, NODE_IDS.handler, COLORS.execution)
    await animation.resetNode(svg, NODE_IDS.proxy)
    // Step 8 still active (proxy() → handler())
    await animation.delay(800)
}

/**
 * Resets all nodes to their initial state
 */
export function resetAllNodes(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    const nodeIds = Object.values(NODE_IDS)
    
    nodeIds.forEach(id => {
        const node = svg.select(`#${id}`)
        const rect = node.select('rect')
        const circle = node.select('circle')
        
        if (id === NODE_IDS.mutationObserver) {
            circle.style('fill', 'rgba(240, 147, 251, 0.3)')
                .style('stroke', COLORS.eventBinding)
                .style('stroke-width', '2')
        } else if (id === NODE_IDS.onFunction) {
            rect.style('fill', 'rgba(240, 147, 251, 0.3)')
                .style('stroke', COLORS.eventBinding)
        } else if (id === NODE_IDS.collectedHandlers || id === NODE_IDS.registeredHandlers) {
            rect.style('fill', 'rgba(255, 255, 255, 0.05)')
                .style('stroke', id === NODE_IDS.registeredHandlers ? COLORS.execution : 'rgba(255, 255, 255, 0.2)')
        } else if (id === NODE_IDS.domInjection || id === NODE_IDS.userClicks) {
            rect.style('fill', 'rgba(245, 87, 108, 0.3)')
                .style('stroke', COLORS.domChanges)
        } else if (id === NODE_IDS.proxy || id === NODE_IDS.handler) {
            rect.style('fill', 'rgba(56, 239, 125, 0.3)')
                .style('stroke', COLORS.execution)
        } else {
            rect.style('fill', 'rgba(102, 126, 234, 0.3)')
                .style('stroke', COLORS.render)
        }
        
        rect.style('stroke-width', '2')
            .style('filter', 'none')
    })
}