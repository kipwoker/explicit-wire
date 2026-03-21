import { ILoading } from 'explicit-wire'

export function createUploadLoading(dropZoneId: string): ILoading {
    return {
        start: async () => {
            const statusEl = document.getElementById('upload-status')
            if (statusEl) {
                statusEl.textContent = 'Uploading...'
                statusEl.className = 'status-message uploading'
            }
            
            const progressBar = document.getElementById('progress-bar')
            if (progressBar) {
                progressBar.style.width = '0%'
            }
            
            const dropZone = document.getElementById(dropZoneId)
            if (dropZone) {
                dropZone.classList.add('uploading')
            }
        },
        stop: async () => {
            const statusEl = document.getElementById('upload-status')
            if (statusEl) {
                statusEl.textContent = 'Upload complete!'
                statusEl.className = 'status-message success'
            }
            
            const dropZone = document.getElementById(dropZoneId)
            if (dropZone) {
                dropZone.classList.remove('uploading')
            }
        },
        updateProgress: async (progressPercent: number) => {
            const progressBar = document.getElementById('progress-bar')
            if (progressBar) {
                progressBar.style.width = `${progressPercent}%`
            }
            
            const statusEl = document.getElementById('upload-status')
            if (statusEl) {
                statusEl.textContent = `Uploading... ${Math.round(progressPercent)}%`
            }
        },
        inProgress: false
    }
}