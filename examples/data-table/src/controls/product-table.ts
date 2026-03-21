import { IControl, ILoading, on } from 'explicit-wire'
import { Product, productRepository, PaginatedResult, ProductFilter } from '../repositories/product-repository'
import { DropdownButton, IDropdownOption } from './dropdown-button'

export type SortField = 'name' | 'price' | 'stock'

interface IProductTableState {
    page: PaginatedResult<Product>
    allLoadedProducts: Product[]
    selectedIds: Set<string>
    sort?: SortField
    direction: 'ASC' | 'DESC'
    isLoading: boolean
}

export class ProductTable implements IControl {
    private state: IProductTableState
    private loading: ILoading

    constructor(loading: ILoading) {
        this.loading = loading
        this.state = {
            page: { items: [], total: 0, hasMore: true, nextCursor: null },
            allLoadedProducts: [],
            selectedIds: new Set<string>(),
            direction: 'ASC',
            isLoading: false
        }
    }

    private getProductId(elementId: string): string {
        return elementId.replace('select-product-', '')
    }

    private getStatusColor(status: Product['status']): string {
        switch (status) {
            case 'active': return 'status-active'
            case 'inactive': return 'status-inactive'
            case 'discontinued': return 'status-discontinued'
            default: return ''
        }
    }

    private getOptions(row: Product): IDropdownOption[] {
        const options: IDropdownOption[] = [
            { id: 'edit', title: '✏️ Edit' },
            { id: 'duplicate', title: '📋 Duplicate' }
        ]

        if (row.status !== 'active') {
            options.push({ id: 'delete', title: '🗑️ Delete', confirmText: '⚠️ Sure?' })
        }

        return options
    }

    private async followSelection(row: Product, target: EventTarget, option: IDropdownOption): Promise<void> {
        switch (option.id) {
            case 'edit':
                alert(`Edit product: ${row.name} -> ${target}`)
                break
            case 'duplicate':
                await this.loading.start()
                const duplicated = await productRepository.duplicate(row.id)
                if (duplicated) {
                    await this.reloadTable()
                }
                await this.loading.stop()
                break
            case 'delete':
                await this.loading.start()
                await productRepository.delete(row.id)
                await this.reloadTable()
                await this.loading.stop()
                break
        }
    }

    private renderBulkCheckbox(row: Product | 'global', beginTag: string, endTag: string): string {
        const checkboxId = row === 'global'
            ? 'select-product-global'
            : `select-product-${row.id}`

        on('change', checkboxId, async (event: any) => {
            const target = event.target as HTMLInputElement
            const checked = target.checked

            if (target.id === 'select-product-global') {
                // Toggle all
                const elements = document.getElementsByClassName('select-product')
                for (const element of elements) {
                    if (element.id !== 'select-product-global') {
                        if (checked) {
                            this.state.selectedIds.add(this.getProductId(element.id))
                        } else {
                            this.state.selectedIds.delete(this.getProductId(element.id))
                        }
                        (element as HTMLInputElement).checked = checked
                    }
                }
            } else {
                // Individual toggle - uncheck global
                const globalCheckbox = document.getElementById('select-product-global') as HTMLInputElement
                if (globalCheckbox) globalCheckbox.checked = false

                if (checked) {
                    this.state.selectedIds.add(this.getProductId(target.id))
                } else {
                    this.state.selectedIds.delete(this.getProductId(target.id))
                }
            }

            this.updateBulkActions()
        })

        return `${beginTag}<input type="checkbox" id="${checkboxId}" class="select-product" value="false" />${endTag}`
    }

    private updateBulkActions(): void {
        const bulkActions = document.getElementById('bulk-actions')
        const selectedCount = document.getElementById('selected-count')
        if (bulkActions && selectedCount) {
            if (this.state.selectedIds.size > 0) {
                bulkActions.classList.add('visible')
                selectedCount.textContent = `${this.state.selectedIds.size} selected`
            } else {
                bulkActions.classList.remove('visible')
            }
        }
    }

    private async reloadTable(): Promise<void> {
        const table = document.getElementById('product-table')
        if (!table) return

        // Reset state
        this.state.selectedIds.clear()
        this.state.allLoadedProducts = []

        // Load fresh data
        const filter: ProductFilter = {
            limit: 20,
            sort: this.state.sort,
            direction: this.state.direction
        }
        const page = await productRepository.list(filter)
        this.state.page = page
        this.state.allLoadedProducts.push(...page.items)

        // Re-render tbody
        const tbody = table.querySelector('tbody')
        if (tbody) {
            tbody.innerHTML = await this.renderPage(page)
        }

        this.updateBulkActions()
    }

    private async renderRow(row: Product): Promise<string> {
        const buttonId = `product-action-button-${row.id}`

        const dropdown = new DropdownButton({
            id: buttonId,
            label: '...',
            options: this.getOptions(row),
            onSelect: (target, option) => this.followSelection(row, target, option)
        })

        return `<tr>
            ${this.renderBulkCheckbox(row, '<td>', '</td>')}
            <td>${row.id}</td>
            <td>${row.name}</td>
            <td>${row.category}</td>
            <td>$${row.price.toFixed(2)}</td>
            <td>${row.stock}</td>
            <td><span class="status-badge ${this.getStatusColor(row.status)}">${row.status}</span></td>
            <td class="dropdown-container">${await dropdown.render()}</td>
        </tr>`
    }

    private async renderPage(page: PaginatedResult<Product>): Promise<string> {
        if (page.items.length === 0) {
            return `<tr><td colspan="8" class="empty-table">No products found. Adjust your filters or add new products.</td></tr>`
        }

        const rows = await Promise.all(page.items.map(row => this.renderRow(row)))
        return rows.join('')
    }

    private async loadNextPage(table: HTMLElement): Promise<void> {
        if (this.state.isLoading || !this.state.page.hasMore) return

        this.state.isLoading = true
        
        // Add loading row at bottom of tbody
        const tbody = table.querySelector('tbody')
        if (tbody) {
            const loadingRow = document.createElement('tr')
            loadingRow.id = 'loading-row'
            loadingRow.innerHTML = `<td colspan="8" style="text-align: center; padding: 20px;"><span class="loading-spinner"></span> Loading more products...</td>`
            tbody.appendChild(loadingRow)
        }

        const filter: ProductFilter = {
            cursor: this.state.page.nextCursor || undefined,
            limit: 20,
            sort: this.state.sort,
            direction: this.state.direction
        }

        const page = await productRepository.list(filter)
        this.state.page = page
        this.state.allLoadedProducts.push(...page.items)

        // Remove loading row
        const loadingRow = document.getElementById('loading-row')
        if (loadingRow) {
            loadingRow.remove()
        }

        const newRows = await this.renderPage(page)
        tbody?.insertAdjacentHTML('beforeend', newRows)

        this.state.isLoading = false
    }

    private createSortHandler(field: SortField): { id: string; classes: string } {
        const id = `product-table-${field}-sort`
        
        on('click', id, async () => {
            // Toggle direction if same field
            if (this.state.sort === field) {
                this.state.direction = this.state.direction === 'ASC' ? 'DESC' : 'ASC'
            } else {
                this.state.sort = field
                this.state.direction = 'ASC'
            }

            await this.reloadTable()
        })

        const direction = this.state.direction.toLowerCase()
        const classes = this.state.sort === field ? `sort sort-active direction-${direction}` : 'sort'

        return { id, classes }
    }

    async render(): Promise<string> {
        const id = 'product-table'

        // Setup infinite scroll
        on('scroll', id, async (_event: any) => {
            const table = document.getElementById(id)
            if (table && table.scrollTop + table.clientHeight >= table.scrollHeight - 10 && !this.state.isLoading) {
                await this.loadNextPage(table)
            }
        }, { mode: 'override-last', captureStrategy: 'multilayer' })

        // Setup sort handlers
        const nameSort = this.createSortHandler('name')
        const priceSort = this.createSortHandler('price')
        const stockSort = this.createSortHandler('stock')

        // Setup bulk delete
        on('click', 'bulk-delete-btn', async () => {
            if (this.state.selectedIds.size === 0) return
            
            const confirmed = confirm(`Delete ${this.state.selectedIds.size} products?`)
            if (confirmed) {
                await this.loading.start()
                await productRepository.deleteMany(Array.from(this.state.selectedIds))
                await this.reloadTable()
                await this.loading.stop()
            }
        })

        // Setup bulk status change
        on('click', 'bulk-status-active', async () => {
            if (this.state.selectedIds.size === 0) return
            await this.loading.start()
            await productRepository.updateManyStatus(Array.from(this.state.selectedIds), 'active')
            await this.reloadTable()
            await this.loading.stop()
        })

        on('click', 'bulk-status-inactive', async () => {
            if (this.state.selectedIds.size === 0) return
            await this.loading.start()
            await productRepository.updateManyStatus(Array.from(this.state.selectedIds), 'inactive')
            await this.reloadTable()
            await this.loading.stop()
        })

        // Load initial data
        const filter: ProductFilter = {
            limit: 20,
            sort: this.state.sort,
            direction: this.state.direction
        }
        const page = await productRepository.list(filter)
        this.state.page = page
        this.state.allLoadedProducts.push(...page.items)

        return `
        <div class="table-container">
            <div class="table-header">
                <h2>Product Inventory</h2>
                <div class="bulk-actions" id="bulk-actions">
                    <span id="selected-count">0 selected</span>
                    <button id="bulk-status-active" class="btn btn-small btn-success">Set Active</button>
                    <button id="bulk-status-inactive" class="btn btn-small btn-warning">Set Inactive</button>
                    <button id="bulk-delete-btn" class="btn btn-small btn-danger">Delete</button>
                </div>
            </div>
            <table class="data-table" id="${id}">
                <thead>
                    <tr>
                        ${this.renderBulkCheckbox('global', '<th class="action" style="width: 5%;">', '</th>')}
                        <th style="width: 5%;">ID</th>
                        <th style="width: 25%;" id="${nameSort.id}" class="${nameSort.classes}">Name</th>
                        <th style="width: 15%;">Category</th>
                        <th style="width: 15%;" id="${priceSort.id}" class="${priceSort.classes}">Price</th>
                        <th style="width: 10%;" id="${stockSort.id}" class="${stockSort.classes}">Stock</th>
                        <th style="width: 10%;">Status</th>
                        <th style="width: 10%;"></th>
                    </tr>
                </thead>
                <tbody>
                    ${await this.renderPage(page)}
                </tbody>
            </table>
            <div class="table-footer">
                <span>Total: ${page.total} products</span>
                <span>${page.hasMore ? 'Scroll down to load more' : 'All products loaded'}</span>
            </div>
        </div>
        `
    }
}