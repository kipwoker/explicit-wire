import { IControl } from 'explicit-wire'

export class Footer implements IControl {
    async render(): Promise<string> {
        return `
            <footer class="footer">
                <div class="footer-content">
                    <div class="footer-section">
                        <h4>explicit-wire</h4>
                        <p>A lightweight UI library.</p>
                    </div>
                    <div class="footer-section">
                        <h4>Links</h4>
                        <ul>
                            <li><a href="/about">About</a></li>
                            <li><a href="/contact">Contact</a></li>
                            <li><a href="/privacy">Privacy</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h4>Connect</h4>
                        <div class="social-links">
                            <span>📧</span>
                            <span>🐦</span>
                            <span>🐙</span>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2026 explicit-wire. Built with ❤️</p>
                </div>
            </footer>
        `
    }
}