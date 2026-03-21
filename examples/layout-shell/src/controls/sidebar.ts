import { IControl, on, getContext } from 'explicit-wire'
import { sectionRouteMap } from '../main';

export interface SidebarSection {
    title: string
    icon: string
    items: Array<{ id: string, label: string; href: string }>
}

export interface ISidebarProps {
    sections: SidebarSection[]
}

export class Sidebar implements IControl {
    constructor(private props: ISidebarProps) {}

    async render(): Promise<string> {
        const isAuthenticated = getContext<boolean>('isAuthenticated') ?? false

        let sectionsHtml = this.props.sections.map(section => `
            <div class="sidebar-section">
                <div class="section-header">
                    <span class="section-icon">${section.icon}</span>
                    <span class="section-title">${section.title}</span>
                </div>
                <ul class="section-items">
                    ${section.items.map(item => {
                        on('click', item.id, async (e: Event) => {
                            const goTo = sectionRouteMap[item.id]
                            if (goTo) {
                                await goTo({} as unknown as void, 'soft')
                            }
                        })
                        return `
                        <li><a href="${item.href}" id="${item.id}" class="sidebar-link">${item.label}</a></li>
                    `;
                    }).join('')}
                </ul>
            </div>
        `).join('')

        if (isAuthenticated) {
            sectionsHtml += `
                <div class="sidebar-section authenticated-only">
                    <div class="section-header">
                        <span class="section-icon">🔑</span>
                        <span class="section-title">Account authorized</span>
                    </div>
                </div>
            `
        }

        return `
            <aside class="sidebar">
                <div class="sidebar-header">
                    <span class="sidebar-title">Navigation</span>
                </div>
                <nav class="sidebar-nav">
                    ${sectionsHtml}
                </nav>
                <div class="sidebar-footer">
                    <span class="sidebar-footer-text">v1.0.0</span>
                </div>
            </aside>
        `
    }
}