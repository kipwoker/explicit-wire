import { IControl, postRender } from 'explicit-wire'
import { EventFlowVisualizer } from '../visualizer/event-flow'

export class EventDemo implements IControl {
    private visualizer: EventFlowVisualizer | null = null

    async render(): Promise<string> {
        postRender(async () => {
            const container = document.getElementById('event-svg-container')
            if (container) {
                this.visualizer = new EventFlowVisualizer(container)
            }

            // Set up button handlers
            const animateBtn = document.getElementById('event-animate-btn')
            const speedSlow = document.getElementById('event-speed-slow')
            const speedNormal = document.getElementById('event-speed-normal')
            const speedFast = document.getElementById('event-speed-fast')

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
                    <h2>⚡ Event Subscription</h2>
                    <p>How on() uses MutationObserver for automatic cleanup</p>
                </div>
                <div class="viz-panel-content">
                    <div class="controls">
                        <button id="event-animate-btn" class="btn btn-success">
                            ▶️ Animate Flow
                        </button>
                        <div class="speed-control">
                            <label>Speed:</label>
                            <button id="event-speed-slow" class="speed-btn">0.5x</button>
                            <button id="event-speed-normal" class="speed-btn active">1x</button>
                            <button id="event-speed-fast" class="speed-btn">2x</button>
                        </div>
                    </div>
                    <div id="event-svg-container" class="svg-container"></div>
                    
                    <div class="step-indicator" id="event-step-1">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <div class="step-title">on() Called</div>
                            <div class="step-description">Handler collected, waiting for element</div>
                        </div>
                    </div>
                    <div class="step-indicator" id="event-step-2">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <div class="step-title">MutationObserver</div>
                            <div class="step-description">Detects element added to DOM</div>
                        </div>
                    </div>
                    <div class="step-indicator" id="event-step-3">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <div class="step-title">Register Handler</div>
                            <div class="step-description">Move from collected to state</div>
                        </div>
                    </div>
                    <div class="step-indicator" id="event-step-4">
                        <div class="step-number">4</div>
                        <div class="step-content">
                            <div class="step-title">Event Listener</div>
                            <div class="step-description">Add document listener if needed</div>
                        </div>
                    </div>
                    <div class="step-indicator" id="event-step-5">
                        <div class="step-number">5</div>
                        <div class="step-content">
                            <div class="step-title">Event Fires</div>
                            <div class="step-description">proxy() finds handler by targetId</div>
                        </div>
                    </div>
                    <div class="step-indicator" id="event-step-6">
                        <div class="step-number">6</div>
                        <div class="step-content">
                            <div class="step-title">Auto Cleanup</div>
                            <div class="step-description">Element removed → handler unregistered</div>
                        </div>
                    </div>

                    <div class="legend">
                        <div class="legend-item">
                            <div class="legend-color collected"></div>
                            <span>Collected (waiting for element)</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color registered"></div>
                            <span>Registered (active)</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color observer"></div>
                            <span>MutationObserver</span>
                        </div>
                    </div>

                    <div class="code-display">
                        <div class="code-line"><span class="comment">// Step 1: Collect handler</span></div>
                        <div class="code-line"><span class="function">on</span>(<span class="string">'click'</span>, <span class="string">'my-button'</span>, <span class="keyword">async</span> (event) => {</div>
                        <div class="code-line">  <span class="comment">// Step 5: Execute on click</span></div>
                        <div class="code-line">  <span class="keyword">await</span> <span class="function">handleClick</span>(event)</div>
                        <div class="code-line">})</div>
                        <div class="code-line"></div>
                        <div class="code-line"><span class="comment">// Steps 2-4: MutationObserver handles</span></div>
                        <div class="code-line"><span class="comment">// element detection & registration</span></div>
                        <div class="code-line"></div>
                        <div class="code-line"><span class="comment">// Step 6: View replaced → auto cleanup</span></div>
                        <div class="code-line"><span class="comment">// No memory leaks!</span></div>
                    </div>
                </div>
            </div>
        `
    }
}