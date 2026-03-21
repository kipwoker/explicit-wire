import { IControl, preRender, postRender, setContext } from 'explicit-wire'
import twemoji from 'twemoji'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { Content } from './content'
import { Footer } from './footer'
import { sections } from '../main'

export class App implements IControl {
    private header: Header
    private sidebar: Sidebar
    private content: IControl
    private footer: Footer

    constructor(content?: IControl) {
        this.header = new Header()
        this.sidebar = new Sidebar({ sections })
        this.content = content ?? new Content()
        this.footer = new Footer()
    }

    async render(): Promise<string> {
        // Executes right before the HTML injection, but after the controls' render() methods have been called
        preRender(async () => {
            // Show big modal window PRE-RENDERING... and fade-off after 0.5 second
            const modal = document.createElement('div')
            modal.className = 'pre-render-modal'
            modal.innerHTML = `
                <div class="pre-render-modal-content">
                    <div class="pre-render-modal-title">PRE-RENDERING...</div>
                    <div class="pre-render-modal-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            `
            document.body.appendChild(modal)

            setTimeout(() => {
                modal.classList.add('fade-out')
                // Remove from DOM after fade animation completes
                setTimeout(() => {
                    if (modal.parentNode) {
                        modal.parentNode.removeChild(modal)
                    }
                }, 500)
            }, 500)
        })

        const twemojiEnabled = localStorage.getItem('twemojiEnabled') !== 'false'
        if (twemojiEnabled) {
            postRender(async () => { twemoji.parse(document.body) })
        }

        // Simulate some async work in preRender to demonstrate the difference between preRender and render
        setContext('appPreRenderTimestamp', new Date().toISOString())
        await new Promise(resolve => setTimeout(resolve, 1000))

        const headerHtml = await this.header.render()
        const sidebarHtml = await this.sidebar.render()
        const contentHtml = await this.content.render()
        const footerHtml = await this.footer.render()

        return `
            <div class="app-layout">
                ${headerHtml}
                <div class="app-body">
                    ${sidebarHtml}
                    ${contentHtml}
                </div>
                ${footerHtml}
            </div>
        `
    }
}
