import { on } from 'explicit-wire'

export interface IDragNDropProps {
    id: string
    onDrop: (files: FileList) => Promise<void>
}

export const dragNDrop = (props: IDragNDropProps) => {
    const overlayId = `drag-overlay-${crypto.randomUUID()}`

    const acquire = (event: Event) => {
        if (event.defaultPrevented) {
            return false
        }

        event.preventDefault()
        event.stopPropagation()
        return true
    }

    const createOverlay = () => {
        let overlay = document.createElement('div')
        overlay.className = 'drag-overlay'
        overlay.id = overlayId
        overlay.innerText = 'Drop files here'
        return overlay
    }

    const destroyOverlay = () => {
        const overlay = document.getElementById(overlayId)
        if (overlay) {
            overlay.remove()
        }
    }

    on('dragover', props.id, async (event: Event) => {
        const target = event.target as HTMLElement
        const parent = document.getElementById(props.id)

        if (!parent || !parent.contains(target)) {
            return
        }

        if (!acquire(event)) {
            return
        }

        const dropZone = document.getElementById(props.id) as HTMLElement
        if (!dropZone.classList.contains('dragging')) {
            dropZone.classList.add('dragging')
            let overlay = createOverlay()
            dropZone.appendChild(overlay)
        }
    }, { captureStrategy: 'multilayer' })

    on('dragover', overlayId, async (event: Event) => {
        if (!acquire(event)) {
            return
        }
    })

    on('dragleave', overlayId, async (event: Event) => {
        if (!acquire(event)) {
            return
        }

        const dropZone = document.getElementById(props.id) as HTMLElement
        if (dropZone.contains(event.target as Node)) {
            return
        }
        dropZone.classList.remove('dragging')

        destroyOverlay()
    })

    on('drop', overlayId, async (event: Event) => {
        if (!acquire(event)) {
            return
        }

        const dropZone = document.getElementById(props.id) as HTMLElement
        dropZone.classList.remove('dragging')

        destroyOverlay()

        const files = (event as DragEvent).dataTransfer?.files
        if (files && files.length > 0) {
            await props.onDrop(files)
        }
    })
}