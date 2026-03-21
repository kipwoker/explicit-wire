import { FrameworkBuilder, IControl, Router } from 'explicit-wire'
import { HelloWorld } from './controls/hello-world'

const appId = 'app'

const router = new Router({
    onRouteNotFound: async () => {
        // no-op
    }
})

const fw = new FrameworkBuilder()
    .addNavigator({
        replacer: (control: IControl) => ({
            anchorId: appId,
            loadingFactory: async () => ({
                start: async () => {},
                stop: async () => {},
                updateProgress: async (_progressPercent: number) => {},
                inProgress: false
            }),
            entryPointFactory: async () => control,
            fallbackFactory: async (error: any) => ({
                render: async () => `<div style="color: red;">Error: ${error.message}</div>`
            })
        })
    })
    .addRouter(router)
    .build()

// Define the default route
router.on<void>({
    alias: '/',
    handler: async () => {
        return { type: 'replace-control', control: new HelloWorld() }
    }
})

document.addEventListener('DOMContentLoaded', async () => {
    await router.resolve()
})