import { IControl, on, getContext, Navigator } from 'explicit-wire'
import { goToRoot } from '../main'

export class Content implements IControl {
    async render(): Promise<string> {
        const isAuthenticated = getContext<boolean>('isAuthenticated') ?? false
        const twemojiEnabled = localStorage.getItem('twemojiEnabled') !== 'false'
        const preRenderTimestamp = getContext<string>('appPreRenderTimestamp')
        const renderTimestamp = new Date().toISOString()

        for (const id of ['composition-card', 'dynamic-menu-card', 'responsive-layout-card']) {
            on('click', id, async (e: Event) => {
                const target = e.target as HTMLElement
                const card = target.closest(`#${id}`) as HTMLElement
                if (card) {
                    card.classList.toggle('expanded')
                }
            })
        }

        on('click', 'twemoji-toggle', async () => {
            const currentState = localStorage.getItem('twemojiEnabled') !== 'false'
            localStorage.setItem('twemojiEnabled', String(!currentState))
            await goToRoot()
        })

        return `
            <main class="content">
                <div class="content-header">
                    <h1 class="content-title">Welcome to Layout Shell Example</h1>
                    <p class="content-subtitle">Demonstrating control composition in explicit-wire</p>
                </div>

                <div class="content-body">
                    <div class="feature-cards">
                        <div class="feature-card" id="composition-card">
                            <div class="card-icon">🧩</div>
                            <h3>Control Composition</h3>
                            <p>Compose multiple controls into a single layout. Each control manages its own state and rendering.</p>
                        </div>
                        <div class="feature-card" id="dynamic-menu-card">
                            <div class="card-icon">🔄</div>
                            <h3>Dynamic Menu</h3>
                            <p>The header menu changes based on authentication state. Login to see more options!</p>
                        </div>
                        <div class="feature-card" id="responsive-layout-card">
                            <div class="card-icon">📱</div>
                            <h3>Responsive Layout</h3>
                            <p>The layout adapts to different screen sizes with CSS Grid.</p>
                        </div>
                    </div>

                    <div class="auth-status">
                        <h3>Authentication Status</h3>
                        <div class="status-badge ${isAuthenticated ? 'authenticated' : 'not-authenticated'}">
                            ${isAuthenticated ? '✅ Authenticated' : '🔒 Not Authenticated'}
                        </div>
                        <p>${isAuthenticated
                            ? 'You are logged in! Check the header and sidebar for additional options.'
                            : 'Click "Login" in the header to see the dynamic menu change.'}
                        </p>
                    </div>

                    <div class="emojis-showcase">
                        <div class="emojis-header">
                            <h3>Twemoji Integration</h3>
                            <button id="twemoji-toggle" class="toggle-btn ${twemojiEnabled ? 'enabled' : 'disabled'}">
                                ${twemojiEnabled ? '✓ Enabled' : '✗ Disabled'}
                            </button>
                        </div>
                        <p>The emojis in this layout are processed by twemoji for consistent cross-platform rendering.</p>
                        <div class="emoji-grid">
                            <span class="emoji-item">🎉</span>
                            <span class="emoji-item">🚀</span>
                            <span class="emoji-item">💡</span>
                            <span class="emoji-item">🎯</span>
                            <span class="emoji-item">⭐</span>
                            <span class="emoji-item">🔥</span>
                        </div>
                    </div>

                    <div class="timestamps-showcase">
                        <h3>Layout Pre-Render vs Render Timestamps</h3>
                        <p>Demonstrates when app.render() vs render() execute:</p>
                        <div class="timestamp-comparison">
                            <div class="timestamp-item">
                                <span class="timestamp-label">App Pre-Render:</span>
                                <code class="timestamp-value">${preRenderTimestamp ?? 'Not available'}</code>
                            </div>
                            <div class="timestamp-item">
                                <span class="timestamp-label">Render (Content):</span>
                                <code class="timestamp-value">${renderTimestamp}</code>
                            </div>
                        </div>
                        <p class="timestamp-note">The pre-render timestamp is captured before the control renders, simulating an API fetch.</p>
                    </div>
                </div>
            </main>
        `
    }
}