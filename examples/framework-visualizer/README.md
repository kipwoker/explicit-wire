# Framework Visualizer Example

An interactive D3 visualization showing how explicit-wire's rendering and event systems work together under the hood.

## What It Does

Displays an animated diagram of the complete framework lifecycle, from initial view rendering through event subscription to user interaction handling. The visualization demonstrates the three main phases:

1. **Render Phase**: ViewManager → Control.render() → HTML String → DOM Injection
2. **Event Binding Phase**: on() function → Collected Handlers → MutationObserver → Registered Handlers
3. **Execution Phase**: User Clicks → proxy() → Handler

## What It Demonstrates

- **Control Implementation**: Building a control with `postRender()` for post-render initialization
- **D3 Integration**: Using D3.js for SVG-based interactive visualizations
- **Animation Engine**: Custom animation system with variable speed controls
- **Native Event System**: Using `addEventListener` directly instead of the `on()` function
- **Dynamic Imports**: Lazy-loading visualization modules for better performance

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser at `http://localhost:3007`

4. Click "Animate Flow" to watch the complete lifecycle animation, or adjust the speed with the 0.5x/1x/2x buttons

## Project Structure

```
framework-visualizer/
├── src/
│   ├── controls/
│   │   └── app.ts                    # Main control with visualization container
│   ├── visualizer/
│   │   ├── animation-engine.ts       # Animation timing and speed control
│   │   ├── unified-flow.ts           # Main visualizer orchestrator
│   │   ├── unified-flow-svg.ts       # SVG canvas setup
│   │   ├── unified-flow-nodes.ts     # Node rendering (ViewManager, Control, DOM, etc.)
│   │   ├── unified-flow-arrows.ts    # Connection arrows between nodes
│   │   ├── unified-flow-steps.ts     # Step number overlays
│   │   ├── unified-flow-legend.ts    # Phase labels and legend
│   │   ├── unified-flow-types.ts     # TypeScript interfaces
│   │   ├── unified-flow-animation.ts # Animation sequence logic
│   │   ├── render-flow.ts            # Render phase visualization
│   │   └── event-flow.ts             # Event binding phase visualization
│   ├── main.ts                       # App entry point
│   └── styles.css                    # Visualization styling
├── index.html
├── package.json
└── tsconfig.json
```

## Key Concepts

### Native Event System

```typescript
postRender(async () => {
    const animateBtn = document.getElementById('animate-btn')
    
    animateBtn?.addEventListener('click', async () => {
        const viz = getVisualizer()
        if (viz) {
            await viz.animate()
        }
    })
})
```

This example uses `postRender()` and native `addEventListener` instead of the `on()` function. This approach is simpler as it doesn't require `addEventHandlerStore` in FrameworkBuilder, but note that it lacks automatic lifecycle event listener deregistration — handlers persist if the view is replaced without manual cleanup.

### postRender Hook

```typescript
async render(): Promise<string> {
    postRender(async () => {
        // Initialize visualization after DOM injection
        const container = document.getElementById('unified-svg-container')
        if (container) {
            const { UnifiedFlowVisualizer } = await import('../visualizer/unified-flow')
            const visualizer = new UnifiedFlowVisualizer(container)
        }
    })

    return `<div id="unified-svg-container"></div>`
}
```

`postRender()` executes after the HTML string is injected into the DOM, allowing initialization of the D3 visualization.

### Animation Engine

```typescript
setSpeed(speed: number): void {
    this.animation.setSpeed(speed)
}

async animate(): Promise<void> {
    if (this.isAnimating) return
    this.isAnimating = true
    
    try {
        await animateUnifiedFlow(this.svg, this.animation)
    } finally {
        this.isAnimating = false
    }
}
```

The animation engine controls timing and allows variable speed playback of the framework lifecycle visualization.

### D3 Visualization Nodes

The visualization shows these framework components as animated nodes:

- **ViewManager**: Entry point for view updates
- **Control.render()**: Async method that generates HTML string
- **on()**: Collects event handlers during render
- **HTML String**: The raw markup output
- **innerHTML**: Direct DOM injection (no virtual DOM)
- **MutationObserver**: Detects when elements are added to DOM
- **State.handlers**: Registered event handlers
- **User Interaction**: Click events triggering handlers

## Limitations

This example uses native event subscriptions for simplicity. In production applications with view replacement, use the `on()` function with `addEventHandlerStore` to ensure automatic cleanup of event listeners when views are replaced, preventing behavior leaks.