import { IControl, RenderMiddleware } from './control'
import { SilentErrorName } from '../resilience/error'
import { ILoading } from '../interaction/loading'
import { getContext } from '../state/context'

export interface ReplaceRequest {
    anchorId: string
    loadingFactory: () => Promise<ILoading>
    entryPointFactory: () => Promise<IControl>
    fallbackFactory: (error: any) => Promise<IControl>
}

export class ViewManager {
    public async replace({ 
            anchorId, 
            loadingFactory, 
            entryPointFactory, 
            fallbackFactory 
        }: ReplaceRequest
    ): Promise<void> {
        const anchor = document.getElementById(anchorId)
        if (!anchor) {
            throw new Error(`Anchor ${anchorId} not found`)
        }

        const loading = await loadingFactory()

        try {
            this.resetContent(anchor)
            await loading.start()

            const control = await entryPointFactory()
            const content = await control.render()
            await this.setContent(anchor, content)
        } catch (error: any) {
            if (error?.name === SilentErrorName) {
                console.warn(error.message)
                return
            } else {
                console.error('Error in ViewManager.replace:', error)
                const fallback = await fallbackFactory(error)
                const fallbackContent = await fallback.render()
                await this.setContent(anchor, fallbackContent)
            }
        } finally {
            await loading.stop()
        }
    }

    private resetContent(anchor: HTMLElement): void {
        anchor.innerHTML = ''
    }

    private async setContent(anchor: HTMLElement, content: string): Promise<void> {
        const renderMiddleware = getContext<RenderMiddleware>('render-middleware')

        for (const action of renderMiddleware.preRenderActions) {
            await action()
        }
        renderMiddleware.preRenderActions = []

        anchor.innerHTML = content
        
        for (const action of renderMiddleware.postRenderActions) {
            await action()
        }
        renderMiddleware.postRenderActions = []
    }
}