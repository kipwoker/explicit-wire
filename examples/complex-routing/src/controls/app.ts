import { IControl, getContext, on } from 'explicit-wire'
import { authProvider, goToSignIn, goToSignOut } from '../main'

interface IMenuItem {
  key: string
  icon: string
  text: string
  destination: () => Promise<void>
  condition: () => boolean
}

export class App implements IControl {
  private content: IControl

  constructor(content: IControl) {
    this.content = content
  }

  async render(): Promise<string> {
    const menuItems = getContext<IMenuItem[]>('menu-items') || []
    const user = authProvider.getUser()
    const currentPath = window.location.pathname

    // Set up navigation click handlers
    for (const item of menuItems.filter(item => item.condition())) {
      on('click', `nav-${item.key}`, async () => {
        await item.destination()
      })
    }

    // Set up sign-in button handler
    if (!user) {
      on('click', 'sign-in-btn', async () => {
        await goToSignIn({})
      })
    }

    // Set up sign-out button handler
    if (user) {
      on('click', 'sign-out-btn', async () => {
        await goToSignOut()
      })
    }

    const getPathForItem = (item: IMenuItem): string => {
      switch (item.key) {
        case 'home': return '/'
        case 'dashboard': return '/dashboard'
        case 'admin': return '/admin'
        default: return '/'
      }
    }

    const sidebarNavHtml = menuItems
      .filter(item => item.condition())
      .map(item => `
        <a 
          class="nav-item ${currentPath === getPathForItem(item) ? 'active' : ''}"
          id="nav-${item.key}"
        >
          ${item.icon} ${item.text}
        </a>
      `)
      .join('')

    const footerHtml = user ? `
      <div class="user-info">
        <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
        <div class="user-details">
          <div class="user-name">${user.name}</div>
          <div class="user-role">${user.role}</div>
        </div>
      </div>
      <div class="auth-controls">
        <button class="auth-btn sign-out-btn" id="sign-out-btn">
          Sign Out
        </button>
      </div>
    ` : `
      <div class="auth-controls">
        <button class="auth-btn sign-in-btn" id="sign-in-btn">
          Sign In
        </button>
      </div>
    `

    const contentHtml = await this.content.render()

    return `
      <div class="app-layout">
        <aside class="sidebar">
          <div class="sidebar-header">
            <h2>🧭 Complex Routing</h2>
          </div>
          
          <nav class="sidebar-nav">
            ${sidebarNavHtml}
          </nav>
          
          <div class="sidebar-footer">
            ${footerHtml}
          </div>
        </aside>
        
        <main class="main-content">
          ${contentHtml}
        </main>
      </div>
    `
  }
}