import { FrameworkBuilder, IControl, Router, getContext, Navigator } from 'explicit-wire'
import { UserForm } from './controls/user-form'
import { UserList } from './controls/user-list'
import { ErrorFallback } from './controls/error-fallback'
import { createPageLoading } from './interactions/page-loading'
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

// Navigation functions
export const goToUserList = router.on<void>({
    alias: '/',
    handler: async () => {
        return { type: 'replace-control', control: new UserList() }
    }
})

export const goToCreateUser = router.on<void>({
    alias: '/create',
    handler: async () => {
        return { type: 'replace-control', control: new UserForm() }
    }
})

export const goToEditUser = router.on<{ id: string }>({
    alias: '/edit/:id',
    handler: async (params) => {
        return { type: 'replace-control', control: new UserForm({ id: params.id }) }
    }
})

const fw = new FrameworkBuilder()
    .addNavigator({
        replacer: (control: IControl) => ({
            anchorId: appId,
            loadingFactory: async () => createPageLoading(appId),
            entryPointFactory: async () => control,
            fallbackFactory: async (error: any) => new ErrorFallback({ error })
        })
    })
    .addRouter(router)
    .addEventHandlerStore({ logDomEvents: false })
    .build()

// fw object itself is not needed, but can be used for debugging purposes
fw.viewManager
fw.navigator
fw.eventHandlerStore

document.addEventListener('DOMContentLoaded', async () => {
    await router.resolve()
})