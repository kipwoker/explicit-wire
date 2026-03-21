import { IControl, on, ILoading, getContext, ViewManager } from 'explicit-wire'
import { dragNDrop } from '../behaviors/drag-n-drop'
import { createUploadLoading } from '../interactions/upload-loading'

interface UploadedFile {
    name: string
    size: number
}

export class FileUpload implements IControl {
    private uploadedFiles: UploadedFile[] = []
    private loading: ILoading = createUploadLoading('drop-zone')

    private formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    private async emulateUpload(files: FileList): Promise<void> {
        await this.loading.start()
        
        const totalFiles = files.length
        let processedFiles = 0

        for (const file of files) {
            console.log(`Uploading file: ${file.name}, Size: ${this.formatFileSize(file.size)}`)
            
            this.uploadedFiles.push({
                name: file.name,
                size: file.size
            })

            processedFiles++
            const progress = (processedFiles / totalFiles) * 100
            await this.loading.updateProgress(progress)
            
            // Emulate upload delay
            await new Promise(resolve => setTimeout(resolve, 500))
        }

        await this.loading.stop()
        
        // Re-render to show uploaded files
        const viewManager = getContext<ViewManager>('view-manager')
        await viewManager.replace({
            anchorId: 'app',
            loadingFactory: async () => ({
                start: async () => {},
                stop: async () => {},
                updateProgress: async () => {},
                inProgress: false
            }),
            entryPointFactory: async () => this,
            fallbackFactory: async (error: any) => ({
                render: async () => `<div class="error">Error: ${error.message}</div>`
            })
        })
    }

    async render(): Promise<string> {
        const containerId = 'file-upload-container'
        const dropZoneId = 'drop-zone'
        const fileListId = 'file-list'

        // Set up drag-n-drop behavior
        dragNDrop({
            id: dropZoneId,
            onDrop: async (files: FileList) => {
                await this.emulateUpload(files)
            }
        })

        // Set up click to upload
        on('click', 'upload-btn', async () => {
            const input = document.createElement('input')
            input.type = 'file'
            input.multiple = true
            input.onchange = async (event: Event) => {
                const target = event.target as HTMLInputElement
                if (target.files && target.files.length > 0) {
                    await this.emulateUpload(target.files)
                }
            }
            input.click()
        })

        return `
            <div id="${containerId}" class="file-upload-container">
                <h1>File Upload</h1>
                <p class="subtitle">Drag and drop files or click to upload</p>
                
                <div id="${dropZoneId}" class="drop-zone">
                    <div class="drop-zone-content">
                        <div class="drop-icon">📁</div>
                        <p>Drag files here</p>
                        <p class="or-text">or</p>
                        <button id="upload-btn" class="btn btn-primary">Choose Files</button>
                    </div>
                </div>
                
                <div id="progress-container" class="progress-container">
                    <div id="progress-bar" class="progress-bar"></div>
                </div>
                
                <div id="upload-status" class="status-message"></div>
                
                <div class="uploaded-files">
                    <h2>Uploaded Files</h2>
                    <div id="${fileListId}" class="file-list">
                        ${this.renderFileList()}
                    </div>
                </div>
            </div>
        `
    }

    private renderFileList(): string {
        if (this.uploadedFiles.length === 0) {
            return '<p class="no-files">No files uploaded yet</p>'
        }

        return this.uploadedFiles.map((file, _index) => `
            <div class="file-item">
                <span class="file-name">${file.name}</span>
                <span class="file-size">${this.formatFileSize(file.size)}</span>
            </div>
        `).join('')
    }
}