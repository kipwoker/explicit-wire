import { FrameworkBuilder, IControl, Router, setContext, getContext, Navigator, GoToFunction } from 'explicit-wire'
import { App } from './controls/app'
import { Content } from './controls/content'
import './styles.css'
import { Page } from './controls/page'
import { SidebarSection } from './controls/sidebar'

const appId = 'app'

// Initialize auth from localStorage
const storedAuth = localStorage.getItem('isAuthenticated')
setContext('isAuthenticated', storedAuth === 'true')

const router = new Router({
    onRouteNotFound: async () => {
        // Default to home
    }
})

const fw = new FrameworkBuilder()
    .addNavigator({
        replacer: (control: IControl) => ({
            anchorId: appId,
            loadingFactory: async () => ({
                start: async () => {},
                stop: async () => {},
                updateProgress: async (_progressPercent: number) => {},
                inProgress: false
            }),
            entryPointFactory: async () => new App(control),
            fallbackFactory: async (error: any) => ({
                render: async () => `<div style="color: red; padding: 2rem;">Error: ${error.message}</div>`
            })
        })
    })
    .addEventHandlerStore({ logDomEvents: false })
    .addRouter(router)
    .build()

// Configure sidebar sections
export const sections: SidebarSection[] = [
    {
        title: 'Quick Actions',
        icon: '⚡',
        items: [
            { id: 'new-project', label: 'New Project', href: '/new-project' },
            { id: 'open-recent', label: 'Open Recent', href: '/recent' }
        ]
    },
    {
        title: 'Analytics',
        icon: '📊',
        items: [
            { id: 'overview', label: 'Overview', href: '/analytics' },
            { id: 'reports', label: 'Reports', href: '/reports' }
        ]
    },
    {
        title: 'Help',
        icon: '❓',
        items: [
            { id: 'documentation', label: 'Documentation', href: '/docs' },
            { id: 'support', label: 'Support', href: '/support' }
        ]
    }
]

export const sectionRouteMap = sections.reduce((map, section) => {
    section.items.forEach(item => {
        map[item.id] = router.on<void>({
            alias: item.href,
            handler: async () => {
                return { type: 'replace-control', control: new Page({ title: item.label }) }
            }
        })
    })
    return map
}, {} as Record<string, GoToFunction<void>>)


// Define routes
export const goToRoot = router.on<void>({
    alias: '/',
    handler: async () => {
        return { type: 'replace-control', control: new Content() }
    }
})

router.on<void>({
    alias: '/todo',
    handler: async () => {
        return {
            type: 'replace-control',
            control: new Page({ title: '📝 Todo Page' })
        }
    }
})

router.on<void>({
    alias: '/dashboard',
    handler: async () => {
        return {
            type: 'replace-control',
            control: new Page({ title: '📊 Dashboard Page' })
        }
    }
})

router.on<void>({
    alias: '/settings',
    handler: async () => {
        return {
            type: 'replace-control',
            control: new Page({ title: '⚙️ Settings Page' })
        }
    }
})

document.addEventListener('DOMContentLoaded', async () => {
    await router.resolve()
})
