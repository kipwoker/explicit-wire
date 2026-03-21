import { FrameworkBuilder, IControl, Router, getContext, Navigator, setContext } from 'explicit-wire'
import { App } from './controls/app'
import { Home } from './controls/home'
import { Dashboard } from './controls/dashboard'
import { Admin } from './controls/admin'
import { SignIn } from './controls/sign-in'
import { NotFound } from './controls/not-found'
import './styles.css'

// ============================================================
// SIMULATED AUTH SYSTEM
// ============================================================

interface User {
  id: string
  name: string
  role: 'guest' | 'user' | 'admin'
  email: string
}

interface IMenuItem {
  key: string
  icon: string
  text: string
  destination: () => Promise<void>
  condition: () => boolean
}

// Simulated auth state with localStorage persistence
const AUTH_STORAGE_KEY = 'complex-routing-auth-user'

// Load user from localStorage on initialization
const loadUserFromStorage = (): User | null => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

// Save user to localStorage
const saveUserToStorage = (user: User | null): void => {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
}

// Initialize currentUser from localStorage
let currentUser: User | null = loadUserFromStorage()

export const authProvider = {
  getUser: () => currentUser,
  isAuthenticated: () => currentUser !== null,
  isAdmin: () => currentUser?.role === 'admin',
  signIn: (user: User) => {
    currentUser = user
    saveUserToStorage(user)
  },
  signOut: () => {
    currentUser = null
    saveUserToStorage(null)
  }
}

// ============================================================
// ROUTER SETUP WITH MIDDLEWARE
// ============================================================

const appId = 'app'

// Route middleware - executes before every route
const onBeforeRoute = async () => {
  const path = window.location.pathname
  console.log(`[Middleware] Navigating to: ${path}`)
  console.log(`[Middleware] User authenticated: ${authProvider.isAuthenticated()}`)
  
  // In real app, you might validate tokens, refresh auth, etc.
}

// Route not found handler
const onRouteNotFound = async () => {
  console.log('[Router] Route not found, redirecting to 404')
  const navigator = getContext<Navigator>('navigator')
  if (navigator) {
    await navigator.navigate('/not-found', 'hard')
  }
}

export const router = new Router({
  onBeforeRoute,
  onRouteNotFound
})

// ============================================================
// MENU MANAGEMENT WITH CONTEXT
// ============================================================

// Define menu items with conditional visibility
const defaultMenuItems: IMenuItem[] = [
  {
    key: 'home',
    icon: '🏠',
    text: 'Home',
    destination: () => goToHome(),
    condition: () => true  // Always visible
  },
  {
    key: 'dashboard',
    icon: '📊',
    text: 'Dashboard',
    destination: () => goToDashboard(),
    condition: () => authProvider.isAuthenticated()  // Only when logged in
  },
  {
    key: 'admin',
    icon: '⚙️',
    text: 'Admin Panel',
    destination: () => goToAdmin(),
    condition: () => authProvider.isAdmin()  // Only for admins
  }
]

export const withEmptyMenu = () => {
  setContext('menu-items', [])
}

export const withDefaultMenu = () => {
  setContext('menu-items', defaultMenuItems)
}

// ============================================================
// ROUTE DEFINITIONS
// ============================================================

// Home route
export const goToHome = router.on<void>({
  alias: '/',
  handler: async () => {
    withDefaultMenu()
    return { type: 'replace-control', control: new App(new Home()) }
  },
  defaultMode: 'soft'
})

// Dashboard route - requires authentication
export const goToDashboard = router.on<void>({
  alias: '/dashboard',
  handler: async () => {
    // Middleware-like check within route handler
    if (!authProvider.isAuthenticated()) {
      console.log('[Route] Dashboard requires auth, redirecting to sign-in')
      return {
        type: 'redirect',
        redirect: () => goToSignIn({ continueTo: '/dashboard' })
      }
    }
    withDefaultMenu()
    return { type: 'replace-control', control: new App(new Dashboard()) }
  },
  defaultMode: 'soft'
})

// Admin route - requires admin role
export const goToAdmin = router.on<void>({
  alias: '/admin',
  handler: async () => {
    // Role-based routing
    if (!authProvider.isAuthenticated()) {
      console.log('[Route] Admin requires auth, redirecting to sign-in')
      return {
        type: 'redirect',
        redirect: () => goToSignIn({ continueTo: '/admin' })
      }
    }
    if (!authProvider.isAdmin()) {
      console.log('[Route] Admin requires admin role, redirecting to home')
      return {
        type: 'redirect',
        redirect: goToHome
      }
    }
    withDefaultMenu()
    return { type: 'replace-control', control: new App(new Admin()) }
  },
  defaultMode: 'soft'
})

// Sign-in route with continue-to parameter
interface SignInParams {
  continueTo?: string
}

export const goToSignIn = router.on<SignInParams>({
  alias: '/sign-in',
  handler: async (params) => {
    withEmptyMenu()  // Clear menu on sign-in page
    return { type: 'replace-control', control: new SignIn(params) }
  },
  defaultMode: 'soft'
})

// Sign-out route - demonstrates redirect pattern
export const goToSignOut = router.on<void>({
  alias: '/sign-out',
  handler: async () => {
    authProvider.signOut()
    withEmptyMenu()
    return {
      type: 'redirect',
      redirect: goToHome,
      mode: 'hard'  // Force full page reload
    }
  }
})

// Not found route
export const goToNotFound = router.on<void>({
  alias: '/not-found',
  handler: async () => {
    withEmptyMenu()
    return { type: 'replace-control', control: new NotFound() }
  }
})

// ============================================================
// DEFAULT ROUTE - ROLE-BASED REDIRECT
// ============================================================
export const goToDefault = router.on<void>({
  alias: '/default',
  handler: async () => {
    const user = authProvider.getUser()
    
    if (!user) {
      // Not authenticated - go to sign-in
      console.log('[Default Route] Not authenticated, going to sign-in')
      return {
        type: 'redirect',
        redirect: () => goToSignIn({ continueTo: '/dashboard' })
      }
    } else if (user.role === 'admin') {
      // Admin - go to admin panel
      console.log('[Default Route] Admin user, going to admin')
      return {
        type: 'redirect',
        redirect: goToAdmin
      }
    } else {
      // Regular user - go to dashboard
      console.log('[Default Route] Regular user, going to dashboard')
      return {
        type: 'redirect',
        redirect: goToDashboard
      }
    }
  }
})

// ============================================================
// FRAMEWORK INITIALIZATION
// ============================================================

new FrameworkBuilder()
  .addNavigator({
    replacer: (control: IControl) => ({
      anchorId: appId,
      loadingFactory: async () => ({
        show: () => {
          const app = document.getElementById(appId)
          if (app) {
            app.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>'
          }
        },
        hide: () => {},
        start: async () => {},
        stop: async () => {},
        updateProgress: async () => {},
        inProgress: false
      }),
      entryPointFactory: async () => control,
      fallbackFactory: async (error: any) => ({
        render: async () => `
          <div class="error-page">
            <h1>Oops!</h1>
            <p>Something went wrong: ${error.message}</p>
            <button class="btn btn-primary" onclick="window.location.href='/'">Go Home</button>
          </div>
        `,
        postRenderActions: () => {}
      })
    })
  })
  .addRouter(router)
  .addEventHandlerStore({ logDomEvents: false })
  .build()

// ============================================================
// START APPLICATION
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  withDefaultMenu()
  
  await router.resolve()
  
  console.log('[App] Complex routing example initialized')
  console.log('[App] Try navigating between pages and signing in/out')
  console.log('[App] Notice how menu items appear/disappear based on auth state')
})