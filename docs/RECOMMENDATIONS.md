# explicit-wire Best Practices

## Core Principles

**Keep it simple.** explicit-wire is designed for straightforward web applications. Embrace its explicit nature—no hidden state, no magic.

---

## Framework Setup

### Always include `addEventHandlerStore`
```typescript
new FrameworkBuilder()
  .addNavigator({ /* ... */ })
  .addEventHandlerStore({ logDomEvents: false })  // Required for on() to work
  .addRouter(router)
  .build()
```

### Define layout in `entryPointFactory`
Wrap your controls in a layout shell to maintain consistent structure:
```typescript
entryPointFactory: async () => new App({ control })
```

---

## Event Handling

### Use `on()` directly in `render()`
Handlers are collected and connected via MutationObserver when elements appear:
```typescript
async render(): Promise<string> {
  on('click', 'my-button', async () => { /* ... */ })
  return `<button id="my-button">Click</button>`
}
```

### Choose the right `mode`
- **`strict-single`** (default): Throws error if handler already registered. Use for static elements.
- **`override-last`**: Replaces previous handler. Use for frequently updated elements.

```typescript
on('click', 'dynamic-item', handler, { mode: 'override-last' })
```

### Choose the right `captureStrategy`
- **`stick-to-target`** (default): Events fire only on exact target element.
- **`multilayer`**: Events fire on target or any intersecting element. Useful for overlays.

```typescript
on('click', 'dropdown', handler, { captureStrategy: 'multilayer' })
```

---

## Router

### Use `router.on()` for navigation
`router.on()` returns a navigation function. Prefer it over direct `navigator.navigate()`:
```typescript
export const goToDashboard = router.on<void>({
  alias: '/dashboard',
  handler: async () => ({ type: 'replace-control', control: new Dashboard() }),
  defaultMode: 'soft'  // Use 'soft' for SPA navigation
})
```

### Route parameters
```typescript
export const goToInvoice = router.on<{ id: string }>({
  alias: '/invoice/:id',
  handler: async (params) => ({ type: 'replace-control', control: new Invoice(params) })
})
```

### Redirects and role-based routing
```typescript
export const goToAdmin = router.on<void>({
  alias: '/admin',
  handler: async () => {
    if (!authProvider.isAdmin()) {
      return { type: 'redirect', redirect: goToHome }
    }
    return { type: 'replace-control', control: new AdminPanel() }
  }
})
```

### Navigation modes
- **`soft`**: Uses `history.pushState()`, no page reload. Default for SPA.
- **`hard`**: Full page reload via `window.location.href`.

---

## Render Lifecycle

### Use `preRender` and `postRender`
```typescript
async render(): Promise<string> {
  preRender(async () => { /* Runs before innerHTML injection */ })
  postRender(async () => { /* Runs after innerHTML injection */ })
  return '<div>...</div>'
}
```

---

## View Management

### Partial updates via ViewManager
Replace specific sections without full page reload:
```typescript
const viewManager = getContext<ViewManager>('view-manager')
await viewManager.replace({
  anchorId: 'content-section',
  loadingFactory: async () => ({ /* ... */ }),
  entryPointFactory: async () => newContent,
  fallbackFactory: async (error) => ({ /* ... */ })
})
```

---

## Context & State

### Use `setContext`/`getContext` for dependency injection
```typescript
setContext('menu-items', menuItems)
const items = getContext<IMenuItem[]>('menu-items')
```

### Framework context keys (reserved)
- `view-manager`, `navigator`, `router`, `render-middleware`, `event-handler-store`

---

## Loading States

### Implement `ILoading` interface
```typescript
class MyLoading implements ILoading {
  inProgress = false
  async start() { /* Show loading indicator */ }
  async stop() { /* Hide loading indicator */ }
  async updateProgress(percent: number) { /* Update progress bar */ }
}
```

---

## Forms

### Use `onSubmit` plugin
```typescript
onSubmit(formId, loading, async (data) => {
  // data is automatically extracted from form
  await saveData(data)
})
```

---

## Control Composition

### Compose controls in parent's `render()`
```typescript
class App implements IControl {
  async render(): Promise<string> {
    const header = await new Header().render()
    const content = await this.content.render()
    return `<div class="layout">${header}${content}</div>`
  }
}
```

---

## Error Handling

### Use `SilentError` for expected failures
```typescript
import { SilentError } from 'explicit-wire'
throw new SilentError('Expected validation failure')  // Won't trigger fallback
```

### Configure fallback in navigator
```typescript
fallbackFactory: async (error) => new ErrorPage({ error })
```

---

## Quick Reference

| Concept | Purpose |
|---------|---------|
| `IControl` | Component interface, returns HTML string |
| `on()` | Subscribe to DOM events with auto-cleanup |
| `router.on()` | Define routes, returns navigation function |
| `preRender/postRender` | Hook into render lifecycle |
| `setContext/getContext` | Dependency injection |
| `onSubmit` | Form submission handling |
| `ILoading` | Loading state interface |