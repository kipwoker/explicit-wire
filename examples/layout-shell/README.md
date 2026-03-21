# Layout Shell Example

A complete application shell with header, sidebar, content area, and footer demonstrating control composition and dynamic menus in explicit-wire.

## What It Does

A dashboard-style layout with:
- **Header**: Brand logo, navigation menu, and login/logout button
- **Sidebar**: Collapsible navigation sections with nested links
- **Content Area**: Dynamic content that changes based on route
- **Footer**: Standard footer with links and social icons

The header and sidebar menus adapt based on authentication state. Login to see additional menu items appear!

## What It Demonstrates

- **Control Composition**: Building complex layouts by composing multiple controls together
- **Context System**: Sharing state (like authentication) across controls with `getContext()` and `setContext()`
- **Dynamic Menus**: Showing/hiding menu items based on authentication state
- **Event Handling with `on()`**: Click handlers for navigation, toggles, and interactive cards
- **Pre-Render Actions**: Using `preRender()` to show a loading modal before HTML injection
- **Post-Render Actions**: Using `postRender()` to run twemoji parsing after HTML injection
- **External Library Integration**: Incorporating third-party libraries (twemoji) into controls
- **Sidebar Navigation**: Multi-section navigation with icons and grouped links

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

4. Click "Login" in the header to see the dynamic menu change

## Project Structure

```
layout-shell/
├── src/
│   ├── controls/
│   │   ├── app.ts              # Main layout shell composing all controls
│   │   ├── header.ts           # Header with brand, nav menu, auth button
│   │   ├── sidebar.ts          # Sidebar with collapsible sections
│   │   ├── content.ts          # Home page content with feature cards
│   │   ├── footer.ts           # Footer with links
│   │   └── page.ts             # Generic page control for routes
│   ├── main.ts                 # App entry point with routes
│   └── styles.css              # CSS Grid layout styling
├── index.html
├── package.json
└── tsconfig.json
```

## Key Concepts

### Control Composition

```typescript
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
```

The `App` control composes other controls, delegating rendering to each child and assembling the final HTML.

### Context System

```typescript
// Store authentication state
setContext('isAuthenticated', true)

// Read authentication state in any control
const isAuthenticated = getContext<boolean>('isAuthenticated') ?? false
```

The context system allows controls to share state without prop drilling.

### Dynamic Menus

```typescript
async render(): Promise<string> {
    const isAuthenticated = getContext<boolean>('isAuthenticated') ?? false

    const filteredItems = this.menuItems.filter(item =>
        !item.requiresAuth || (item.requiresAuth && isAuthenticated)
    )

    const authButtonHtml = isAuthenticated
        ? `<button id="logout-btn">Logout</button>`
        : `<button id="login-btn">Login</button>`
}
```

Menu items with `requiresAuth: true` are only shown when the user is authenticated.

### Post-Render Actions

```typescript
async render(): Promise<string> {
    const twemojiEnabled = localStorage.getItem('twemojiEnabled') !== 'false'
    if (twemojiEnabled) {
        postRender(async () => { twemoji.parse(document.body) })
    }
    // ... return HTML
}
```

`postRender()` schedules a function to run after the HTML is injected into the DOM, perfect for third-party library initialization.

### Pre-Render Actions

```typescript
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

        // Fade out after 0.5 second
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

    // ... render controls and return HTML
}
```

`preRender()` schedules a function to run before the HTML is injected into the DOM. This is useful for showing loading states, preparing the DOM, or performing any setup needed before the new content appears. In this example, it displays a full-screen loading modal that fades out after 0.5 second.

### Sidebar Navigation

```typescript
export interface SidebarSection {
    title: string
    icon: string
    items: Array<{ id: string, label: string; href: string }>
}

const sections: SidebarSection[] = [
    {
        title: 'Quick Actions',
        icon: '⚡',
        items: [
            { id: 'new-project', label: 'New Project', href: '/new-project' },
            { id: 'open-recent', label: 'Open Recent', href: '/recent' }
        ]
    },
    // ... more sections
]
```

The sidebar organizes navigation into collapsible sections with icons and grouped links.