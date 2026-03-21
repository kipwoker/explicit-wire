# Data Table Example

A product inventory table demonstrating sorting, pagination, bulk actions, and custom dropdown components in explicit-wire.

## What It Does

A fully interactive data table for managing product inventory where users can:
- View products with columns for ID, name, category, price, stock, and status
- Sort products by name, price, or stock (ascending/descending)
- Scroll to load more products (infinite scroll pagination)
- Select individual or all products with checkboxes
- Perform bulk actions: set status (active/inactive) or delete multiple products
- Use dropdown menus on each row for edit, duplicate, and delete operations

Data is persisted in localStorage with simulated network delays to demonstrate loading states.

## What It Demonstrates

- **Cursor-based Pagination**: Efficient data loading with cursor navigation and infinite scroll
- **Column Sorting**: Toggle sort direction on multiple columns
- **Bulk Selection**: Global and individual checkbox selection with state management
- **Custom Components**: Reusable `DropdownButton` component with confirmation dialogs
- **Event Handling with `on()`**: Subscribing to click, change, and scroll events
- **Repository Pattern**: Separating data access logic from UI components
- **Custom Loading States**: Implementing `ILoading` interface for async operations

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser at `http://localhost:3007`

4. Interact with the table: sort columns, select rows, use dropdown menus, and scroll to load more

## Project Structure

```
data-table/
├── src/
│   ├── controls/
│   │   ├── dropdown-button.ts   # Reusable dropdown menu component
│   │   └── product-table.ts     # Main table control with all interactions
│   ├── interactions/
│   │   └── table-loading.ts     # Custom loading state implementation
│   ├── repositories/
│   │   └── product-repository.ts # Data access layer (localStorage)
│   ├── main.ts                  # App entry point
│   └── styles.css               # Table and component styling
├── index.html
├── package.json
└── tsconfig.json
```

## Key Concepts

### Cursor-based Pagination

```typescript
const filter: ProductFilter = {
    cursor: this.state.page.nextCursor || undefined,
    limit: 20,
    sort: this.state.sort,
    direction: this.state.direction
}
const page = await productRepository.list(filter)
```

Pagination uses cursors instead of page numbers, allowing efficient traversal of large datasets. The `nextCursor` from the current page is passed to fetch the next batch.

### Infinite Scroll

```typescript
on('scroll', id, async (_event: any) => {
    const table = document.getElementById(id)
    if (table && table.scrollTop + table.clientHeight >= table.scrollHeight - 10 && !this.state.isLoading) {
        await this.loadNextPage(table)
    }
}, { mode: 'override-last', captureStrategy: 'multilayer' })
```

The scroll event handler detects when the user reaches the bottom of the table and automatically loads the next page.

### Column Sorting

```typescript
private createSortHandler(field: SortField): { id: string; classes: string } {
    const id = `product-table-${field}-sort`
    
    on('click', id, async () => {
        if (this.state.sort === field) {
            this.state.direction = this.state.direction === 'ASC' ? 'DESC' : 'ASC'
        } else {
            this.state.sort = field
            this.state.direction = 'ASC'
        }
        await this.reloadTable()
    })

    return { id, classes: this.state.sort === field ? `sort sort-active direction-${direction}` : 'sort' }
}
```

Click handlers toggle sort direction when clicking the same column, or switch to a new column with ascending order.

### Bulk Selection

```typescript
on('change', checkboxId, async (event: any) => {
    const target = event.target as HTMLInputElement
    if (target.id === 'select-product-global') {
        // Toggle all checkboxes
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
```

Selection state is tracked in a `Set<string>` for efficient add/remove operations. The global checkbox toggles all, while individual selections automatically uncheck the global.

### Custom Dropdown Component

```typescript
export class DropdownButton implements IControl {
    constructor(private props: IDropdownButtonProps) {}

    async render(): Promise<string> {
        on('click', buttonId, async (event: any) => {
            const button = event.target
            if (this.isVisible(button)) {
                this.hide(button)
            } else {
                this.show(button)
            }
        })
        
        return `<button id="${buttonId}" class="regular pressable">${this.props.label}</button>`
    }
}
```

The `DropdownButton` is a reusable component that manages its own state and renders options dynamically when opened.

### Repository Pattern

```typescript
export const productRepository = {
    async list(filter: ProductFilter = {}): Promise<PaginatedResult<Product>> {
        await delay(400) // Simulate API call
        let products = getProducts()
        products = sortProducts(products, sort, direction)
        // ... pagination logic
        return { items, total, hasMore, nextCursor }
    },
    
    async deleteMany(ids: string[]): Promise<number> {
        await delay(400)
        // ... bulk delete logic
    }
}
```

The repository abstracts data access, making it easy to swap localStorage for a real API later. All methods simulate network delays.