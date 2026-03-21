import { ILoading } from 'explicit-wire'

export function createFormLoading(formId: string): ILoading {
    return {
        start: async () => {
            const statusEl = document.getElementById('form-status')
            if (statusEl) {
                statusEl.textContent = 'Saving...'
                statusEl.className = 'status-message saving'
            }
            const submitBtn = document.querySelector(`#${formId} button[type="submit"]`) as HTMLButtonElement
            if (submitBtn) {
                submitBtn.disabled = true
            }
        },
        stop: async () => {
            const submitBtn = document.querySelector(`#${formId} button[type="submit"]`) as HTMLButtonElement
            if (submitBtn) {
                submitBtn.disabled = false
            }
        },
        updateProgress: async (_progressPercent: number) => {
            // no-op
        },
        inProgress: false
    }
}