import { FrameworkBuilder, IControl, Router, getContext, Navigator } from 'explicit-wire'
import { App } from './controls/app'
import './styles.css'

const appId = 'app'

export const router = new Router({
    onRouteNotFound: async () => {
        const navigator = getContext<Navigator>('navigator')
        if (navigator) {
            await navigator.navigate('/', 'hard')
        }
    }
})

// Define routes
export const goToHome = router.on<void>({
    alias: '/',
    handler: async () => {
        return { type: 'replace-control', control: new App() }
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
                render: async () => `<div style="color: red; padding: 20px;">Error: ${error.message}</div>`
            })
        })
    })
    .addRouter(router)
    .build()

document.addEventListener('DOMContentLoaded', async () => {
    await router.resolve()
})