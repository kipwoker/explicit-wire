import { ILoading } from 'explicit-wire'

export function createPageLoading(appId: string): ILoading {
    return {
        start: async () => {
            const app = document.getElementById(appId)
            if (app) {
                app.innerHTML = '<div class="loading">Loading...</div>'
            }
        },
        stop: async () => {},
        updateProgress: async (_progressPercent: number) => {},
        inProgress: false
    }
}