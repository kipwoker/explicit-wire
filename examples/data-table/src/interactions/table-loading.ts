import { ILoading } from 'explicit-wire'

export function createTableLoading(containerId: string): ILoading {
    return {
        start: async () => {
            const container = document.getElementById(containerId)
            if (container) {
                const existingLoader = container.querySelector('.table-loading')
                if (!existingLoader) {
                    const loader = document.createElement('div')
                    loader.className = 'table-loading'
                    loader.innerHTML = '<span class="loading-spinner"></span> Loading...'
                    container.appendChild(loader)
                }
            }
        },
        stop: async () => {
            const container = document.getElementById(containerId)
            if (container) {
                const loader = container.querySelector('.table-loading')
                if (loader) {
                    loader.remove()
                }
            }
        },
        updateProgress: async (_progressPercent: number) => {
            // no-op
        },
        inProgress: false
    }
}