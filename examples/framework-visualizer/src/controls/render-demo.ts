import { IControl, postRender } from 'explicit-wire'
import { RenderFlowVisualizer } from '../visualizer/render-flow'

export class RenderDemo implements IControl {
    private visualizer: RenderFlowVisualizer | null = null

    async render(): Promise<string> {
        postRender(async () => {
            const container = document.getElementById('render-svg-container')
            if (container) {
                this.visualizer = new RenderFlowVisualizer(container)
            }

            // Set up button handlers
            const animateBtn = document.getElementById('render-animate-btn')
            const speedSlow = document.getElementById('speed-slow')
            const speedNormal = document.getElementById('speed-normal')
            const speedFast = document.getElementById('speed-fast')

            animateBtn?.addEventListener('click', async () => {
                if (this.visualizer) {
                    await this.visualizer.animate()
                }
            })

            const setSpeed = (speed: number, activeBtn: HTMLElement) => {
                if (this.visualizer) {
                    this.visualizer.setSpeed(speed)
                }
                document.querySelectorAll('.speed-btn').forEach(btn => btn.classList.remove('active'))
                activeBtn.classList.add('active')
            }

            speedSlow?.addEventListener('click', () => setSpeed(0.5, speedSlow))
            speedNormal?.addEventListener('click', () => setSpeed(1, speedNormal))
            speedFast?.addEventListener('click', () => setSpeed(2, speedFast))
        })

        return `
            <div class="viz-panel">
                <div class="viz-panel-header">
                    <h2>🔄 Render Flow</h2>
                    <p>How Control.render() becomes interactive UI</p>
                </div>
                <div class="viz-panel-content">
                    <div class="controls">
                        <button id="render-animate-btn" class="btn btn-primary">
                            ▶️ Animate Flow
                        </button>
                        <div class="speed-control">
                            <label>Speed:</label>
                            <button id="speed-slow" class="speed-btn">0.5x</button>
                            <button id="speed-normal" class="speed-btn active">1x</button>
                            <button id="speed-fast" class="speed-btn">2x</button>
                        </div>
                    </div>
                    <div id="render-svg-container" class="svg-container"></div>
                    
                    <div class="step-indicator" id="step-1">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <div class="step-title">Control.render()</div>
                            <div class="step-description">Async method returns HTML string</div>
                        </div>
                    </div>
                    <div class="step-indicator" id="step-2">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <div class="step-title">HTML String Generated</div>
                            <div class="step-description">Template literal with dynamic content</div>
                        </div>
                    </div>
                    <div class="step-indicator" id="step-3">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <div class="step-title">preRenderActions</div>
                            <div class="step-description">Execute setup tasks before DOM injection</div>
                        </div>
                    </div>
                    <div class="step-indicator" id="step-4">
                        <div class="step-number">4</div>
                        <div class="step-content">
                            <div class="step-title">innerHTML Injection</div>
                            <div class="step-description">Direct DOM update - no virtual DOM</div>
                        </div>
                    </div>
                    <div class="step-indicator" id="step-5">
                        <div class="step-number">5</div>
                        <div class="step-content">
                            <div class="step-title">postRenderActions</div>
                            <div class="step-description">Bind events via on() function</div>
                        </div>
                    </div>
                    <div class="step-indicator" id="step-6">
                        <div class="step-number">6</div>
                        <div class="step-content">
                            <div class="step-title">View Ready</div>
                            <div class="step-description">UI is interactive and responsive</div>
                        </div>
                    </div>

                    <div class="code-display">
                        <div class="code-line"><span class="keyword">async</span> <span class="function">render</span>(): <span class="keyword">Promise</span><<span class="keyword">string</span>> {</div>
                        <div class="code-line">  <span class="comment">// Step 1: Generate HTML</span></div>
                        <div class="code-line">  <span class="keyword">const</span> content = <span class="string">\`<button id="btn">Click</button>\`</span></div>
                        <div class="code-line"></div>
                        <div class="code-line">  <span class="comment">// Step 5: Bind events (runs after DOM injection)</span></div>
                        <div class="code-line">  <span class="function">postRender</span>(<span class="keyword">async</span> () => {</div>
                        <div class="code-line">    <span class="function">on</span>(<span class="string">'click'</span>, <span class="string">'btn'</span>, handler)</div>
                        <div class="code-line">  })</div>
                        <div class="code-line"></div>
                        <div class="code-line">  <span class="keyword">return</span> content</div>
                        <div class="code-line">}</div>
                    </div>
                </div>
            </div>
        `
    }
}