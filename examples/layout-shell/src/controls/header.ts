import { IControl, on, getContext, setContext, Navigator, contextStore } from 'explicit-wire'

export interface MenuItem {
    icon: string
    label: string
    href: string
    requiresAuth?: boolean
}

export class Header implements IControl {
    private menuItems: MenuItem[] = [
        { icon: '🏠', label: 'Home', href: '/' },
        { icon: '📝', label: 'Todo', href: '/todo' },
        { icon: '📊', label: 'Dashboard', href: '/dashboard', requiresAuth: true },
        { icon: '⚙️', label: 'Settings', href: '/settings', requiresAuth: true }
    ]

    async handleAuthenticationChange(isAuthenticated: boolean) {
        setContext('isAuthenticated', isAuthenticated)
        localStorage.setItem('isAuthenticated', isAuthenticated.toString())
        const navigator = getContext<Navigator>('navigator')
        if (navigator) {
            await navigator.navigate(window.location.pathname, 'hard')
        }
    }

    async render(): Promise<string> {
        const isAuthenticated = getContext<boolean>('isAuthenticated') ?? false

        const filteredItems = this.menuItems.filter(item =>
            !item.requiresAuth || (item.requiresAuth && isAuthenticated)
        )

        const menuHtml = filteredItems.map(item => `
            <a href="${item.href}" class="menu-item" data-nav="${item.href}">
                <span class="menu-icon">${item.icon}</span>
                <span class="menu-label">${item.label}</span>
            </a>
        `).join('')

        const authButtonHtml = isAuthenticated
            ? `<button class="auth-btn" id="logout-btn">Logout</button>`
            : `<button class="auth-btn" id="login-btn">Login</button>`

        console.log("contextStore.size:", contextStore.size)

        if (isAuthenticated) {
            on('click', 'logout-btn', async (_e: Event) => {
                this.handleAuthenticationChange(false)
            })
        } else {
            on('click', 'login-btn', async (_e: Event) => {
                this.handleAuthenticationChange(true)
            })
        }

        return `
            <header class="header">
                <div class="header-brand">
                    <span class="brand-icon">⚡</span>
                    <span class="brand-text">explicit-wire</span>
                </div>
                <nav class="header-nav">
                    ${menuHtml}
                </nav>
                <div class="header-actions">
                    ${authButtonHtml}
                </div>
            </header>
        `
    }
}
