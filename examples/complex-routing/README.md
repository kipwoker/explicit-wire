# Complex Routing Example

An advanced routing example demonstrating middleware, role-based access control, conditional navigation, and dynamic menus in explicit-wire.

## What It Does

A multi-page application with authentication and role-based routing:
- **Home Page**: Public landing page accessible to everyone
- **Dashboard**: Protected route requiring authentication
- **Admin Panel**: Protected route requiring admin role
- **Sign-In**: Authentication page with role selection
- **404 Page**: Custom not-found handler

The sidebar menu dynamically shows/hides items based on authentication state and user role. Try signing in as a regular user versus an admin to see different menu items appear!

## What It Demonstrates

- **Router Middleware**: `onBeforeRoute` executes before every route for logging/validation
- **Route Not Found Handler**: Custom `onRouteNotFound` for 404 handling
- **Role-Based Access Control**: Routes that check both authentication AND user role
- **Conditional Routing**: Route handlers that return redirects based on conditions
- **Context-Based Menus**: Menu items dynamically appear/disappear based on auth state
- **Continue-To Pattern**: Redirect users back to their intended destination after sign-in
- **Hard vs Soft Navigation**: Using `mode: 'hard'` for full page reloads when needed
- **localStorage Persistence**: Auth state persists across page reloads

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

4. Test the routing patterns:
   - Try accessing `/dashboard` without signing in
   - Sign in as a regular user and try `/admin`
   - Sign in as admin and see the Admin Panel menu appear
   - Sign out and watch menu items disappear

## Project Structure

```
complex-routing/
├── src/
│   ├── controls/
│   │   ├── app.ts              # Main layout with dynamic sidebar menu
│   │   ├── home.ts             # Public home page
│   │   ├── dashboard.ts        # Protected dashboard (requires auth)
│   │   ├── admin.ts            # Protected admin panel (requires admin role)
│   │   ├── sign-in.ts          # Authentication with role selection
│   │   └── not-found.ts        # 404 page
│   ├── main.ts                 # App entry point with routing and auth
│   └── styles.css              # Styling
├── index.html
├── package.json
└── tsconfig.json
```

## Key Concepts

### Router Middleware

```typescript
const onBeforeRoute = async () => {
  const path = window.location.pathname
  console.log(`[Middleware] Navigating to: ${path}`)
  console.log(`[Middleware] User authenticated: ${authProvider.isAuthenticated()}`)
}

const onRouteNotFound = async () => {
  console.log('[Router] Route not found, redirecting to 404')
  const navigator = getContext<Navigator>('navigator')
  await navigator.navigate('/not-found', 'hard')
}

export const router = new Router({
  onBeforeRoute,
  onRouteNotFound
})
```

The router accepts middleware callbacks that execute before every route or when no route matches.

### Role-Based Route Protection

```typescript
export const goToAdmin = router.on<void>({
  alias: '/admin',
  handler: async () => {
    // Check authentication first
    if (!authProvider.isAuthenticated()) {
      return {
        type: 'redirect',
        redirect: () => goToSignIn({ continueTo: '/admin' })
      }
    }
    // Then check admin role
    if (!authProvider.isAdmin()) {
      return {
        type: 'redirect',
        redirect: goToHome
      }
    }
    withDefaultMenu()
    return { type: 'replace-control', control: new App(new Admin()) }
  }
})
```

Routes can return redirect objects to send users elsewhere based on conditions.

### Continue-To Pattern

```typescript
export const goToSignIn = router.on<SignInParams>({
  alias: '/sign-in',
  handler: async (params) => {
    withEmptyMenu()
    return { type: 'replace-control', control: new SignIn(params) }
  }
})

// In SignIn control
on('click', 'sign-in-user-btn', async () => {
  authProvider.signIn({ ... })
  const navigator = getContext<Navigator>('navigator')
  await navigator.navigate(continueTo, 'hard')
})
```

The sign-in page accepts a `continueTo` parameter and redirects there after successful authentication.

### Context-Based Dynamic Menus

```typescript
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

// In App control
const sidebarNavHtml = menuItems
  .filter(item => item.condition())
  .map(item => `<a class="nav-item" id="nav-${item.key}">${item.icon} ${item.text}</a>`)
  .join('')
```

Menu items have a `condition()` function that determines visibility based on current auth state.

### Role-Based Default Redirect

```typescript
export const goToDefault = router.on<void>({
  alias: '/default',
  handler: async () => {
    const user = authProvider.getUser()
    
    if (!user) {
      return {
        type: 'redirect',
        redirect: () => goToSignIn({ continueTo: '/dashboard' })
      }
    } else if (user.role === 'admin') {
      return {
        type: 'redirect',
        redirect: goToAdmin
      }
    } else {
      return {
        type: 'redirect',
        redirect: goToDashboard
      }
    }
  }
})
```

A default route can redirect users to different pages based on their role.

### Auth Provider with Persistence

```typescript
const AUTH_STORAGE_KEY = 'complex-routing-auth-user'

const loadUserFromStorage = (): User | null => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

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
```

Authentication state persists in localStorage, surviving page reloads.