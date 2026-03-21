export type FrameworkContextKey = 'view-manager' | 'navigator' | 'router' | 'render-middleware' | 'event-handler-store'
export type ContextKey = FrameworkContextKey | string

export const contextStore = new Map<ContextKey, any>

export const getContext = <T> (key: ContextKey): T => {
    return contextStore.get(key)
}

export const popContext = <T> (key: ContextKey): T => {
    const value = contextStore.get(key)
    contextStore.delete(key)

    return value
}

export const setContext = <T> (key: ContextKey, value: T) => {
    contextStore.set(key, value)
}