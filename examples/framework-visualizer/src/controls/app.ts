import { IControl, postRender } from 'explicit-wire'

interface UnifiedVisualizer {
    animate(): Promise<void>
    reset(): void
    setSpeed(speed: number): void
}

function getVisualizer(): UnifiedVisualizer | null {
    return (window as any).unifiedVisualizer ?? null
}

function setVisualizer(visualizer: UnifiedVisualizer): void {
    (window as any).unifiedVisualizer = visualizer
}

export class App implements IControl {
    async render(): Promise<string> {
        postRender(async () => {
            const container = document.getElementById('unified-svg-container')
            if (container) {
                const { UnifiedFlowVisualizer } = await import('../visualizer/unified-flow')
                const visualizer = new UnifiedFlowVisualizer(container)
                setVisualizer(visualizer)
            }

            // Set up button handlers
            const animateBtn = document.getElementById('animate-btn')
            const speedSlow = document.getElementById('speed-slow')
            const speedNormal = document.getElementById('speed-normal')
            const speedFast = document.getElementById('speed-fast')

            animateBtn?.addEventListener('click', async () => {
                const viz = getVisualizer()
                if (viz) {
                    await viz.animate()
                }
            })

            const setSpeed = (speed: number, activeBtn: HTMLElement) => {
                const viz = getVisualizer()
                if (viz) {
                    viz.setSpeed(speed)
                }
                document.querySelectorAll('.speed-btn').forEach(btn => btn.classList.remove('active'))
                activeBtn.classList.add('active')
            }

            speedSlow?.addEventListener('click', () => setSpeed(0.5, speedSlow))
            speedNormal?.addEventListener('click', () => setSpeed(1, speedNormal))
            speedFast?.addEventListener('click', () => setSpeed(2, speedFast))
        })

        return `
            <div class="unified-container">
                <div class="viz-panel full-width">
                    <div class="viz-panel-header">
                        <h2>⚡ Complete Framework Lifecycle</h2>
                        <p>ViewManager → Control.render() → on() → MutationObserver → User Interaction</p>
                    </div>
                    <div class="viz-panel-content">
                        <div class="controls">
                            <button id="animate-btn" class="btn btn-primary">
                                ▶️ Animate Flow
                            </button>
                            <div class="speed-control">
                                <label>Speed:</label>
                                <button id="speed-slow" class="speed-btn">0.5x</button>
                                <button id="speed-normal" class="speed-btn active">1x</button>
                                <button id="speed-fast" class="speed-btn">2x</button>
                            </div>
                        </div>
                        <div id="unified-svg-container" class="svg-container-wide"></div>
                        
                        <div class="steps-grid">
                            <div class="step-indicator" id="step-1">
                                <div class="step-number">1</div>
                                <div class="step-content">
                                    <div class="step-title">ViewManager.replace()</div>
                                    <div class="step-description">Entry point for view updates</div>
                                </div>
                            </div>
                            <div class="step-indicator" id="step-2">
                                <div class="step-number">2</div>
                                <div class="step-content">
                                    <div class="step-title">Control.render()</div>
                                    <div class="step-description">Async method generates HTML string</div>
                                </div>
                            </div>
                            <div class="step-indicator" id="step-3">
                                <div class="step-number">3</div>
                                <div class="step-content">
                                    <div class="step-title">on() collects handler</div>
                                    <div class="step-description">Handler stored in collected.handlers</div>
                                </div>
                            </div>
                            <div class="step-indicator" id="step-4">
                                <div class="step-number">4</div>
                                <div class="step-content">
                                    <div class="step-title">HTML String → innerHTML</div>
                                    <div class="step-description">Direct DOM injection (no vDOM)</div>
                                </div>
                            </div>
                            <div class="step-indicator" id="step-5">
                                <div class="step-number">5</div>
                                <div class="step-content">
                                    <div class="step-title">MutationObserver</div>
                                    <div class="step-description">Detects element added to DOM</div>
                                </div>
                            </div>
                            <div class="step-indicator" id="step-6">
                                <div class="step-number">6</div>
                                <div class="step-content">
                                    <div class="step-title">Register handler</div>
                                    <div class="step-description">Move to state.handlers, add listener</div>
                                </div>
                            </div>
                            <div class="step-indicator" id="step-7">
                                <div class="step-number">7</div>
                                <div class="step-content">
                                    <div class="step-title">User clicks button</div>
                                    <div class="step-description">Event fires on document</div>
                                </div>
                            </div>
                            <div class="step-indicator" id="step-8">
                                <div class="step-number">8</div>
                                <div class="step-content">
                                    <div class="step-title">proxy() → handler()</div>
                                    <div class="step-description">Find by targetId, execute handler</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        `
    }
}
