import { FrameworkBuilder, IControl, Navigator, getContext } from 'explicit-wire'
import { ProductTable } from './controls/product-table'
import { createTableLoading } from './interactions/table-loading'
import './styles.css'

const appId = 'app'

new FrameworkBuilder()
    .addNavigator({
        replacer: (control: IControl) => ({
            anchorId: appId,
            loadingFactory: async () => createTableLoading(appId),
            entryPointFactory: async () => control,
            fallbackFactory: async (error: any) => ({
                render: async () => `<div style="color: red; padding: 20px;"><h2>Error</h2><p>${error.message}</p></div>`
            })
        })
    })
    .addEventHandlerStore({ logDomEvents: true })
    .build()

document.addEventListener('DOMContentLoaded', async () => {
    const navigator = getContext<Navigator>('navigator')
    if (navigator) {
        const tableLoading = createTableLoading('table-wrapper')
        await navigator.replace(new ProductTable(tableLoading))
    }
})
