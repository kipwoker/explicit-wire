import { FrameworkBuilder, IControl, Navigator, getContext } from 'explicit-wire'
import { FileUpload } from './controls/file-upload'
import './styles.css'

const appId = 'app'

new FrameworkBuilder()
    .addNavigator({
        replacer: (control: IControl) => ({
            anchorId: appId,
            loadingFactory: async () => ({
                start: async () => {},
                stop: async () => {},
                updateProgress: async () => {},
                inProgress: false
            }),
            entryPointFactory: async () => control,
            fallbackFactory: async (error: any) => ({
                render: async () => `<div class="error">Error: ${error.message}</div>`
            })
        })
    })
    .addEventHandlerStore({ logDomEvents: false })
    .build()

document.addEventListener('DOMContentLoaded', async () => {
    const navigator = getContext<Navigator>('navigator')
    await navigator.replace(new FileUpload())
})
