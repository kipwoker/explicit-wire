export interface Product {
    id: string
    name: string
    category: string
    price: number
    stock: number
    status: 'active' | 'inactive' | 'discontinued'
}

export interface PaginatedResult<T> {
    items: T[]
    total: number
    hasMore: boolean
    nextCursor: string | null
}

export interface ProductFilter {
    cursor?: string
    limit?: number
    sort?: 'name' | 'price' | 'stock'
    direction?: 'ASC' | 'DESC'
}

const STORAGE_KEY = 'explicit-wire-products'

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Generate sample products
const generateSampleProducts = (): Product[] => {
    const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books']
    const statuses: Product['status'][] = ['active', 'inactive', 'discontinued']
    const products: Product[] = []

    for (let i = 1; i <= 100; i++) {
        products.push({
            id: String(i),
            name: `Product ${i}`,
            category: categories[i % categories.length],
            price: Math.round((Math.random() * 500 + 10) * 100) / 100,
            stock: Math.floor(Math.random() * 200),
            status: statuses[i % 3]
        })
    }

    return products
}

// Initialize with default data if empty
const initializeData = (): void => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(generateSampleProducts()))
    }
}

// Get all products from localStorage
const getProducts = (): Product[] => {
    initializeData()
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
}

// Save products to localStorage
const saveProducts = (products: Product[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
}

// Sort products
const sortProducts = (products: Product[], sort?: string, direction?: string): Product[] => {
    if (!sort) return products

    return [...products].sort((a, b) => {
        let comparison = 0
        switch (sort) {
            case 'name':
                comparison = a.name.localeCompare(b.name)
                break
            case 'price':
                comparison = a.price - b.price
                break
            case 'stock':
                comparison = a.stock - b.stock
                break
            default:
                comparison = 0
        }
        return direction === 'DESC' ? -comparison : comparison
    })
}

export const productRepository = {
    async list(filter: ProductFilter = {}): Promise<PaginatedResult<Product>> {
        await delay(400) // Simulate API call

        const { cursor, limit = 20, sort, direction = 'ASC' } = filter
        let products = getProducts()

        // Sort if requested
        products = sortProducts(products, sort, direction)

        // Find start index based on cursor
        let startIndex = 0
        if (cursor) {
            const cursorIndex = products.findIndex(p => p.id === cursor)
            startIndex = cursorIndex !== -1 ? cursorIndex + 1 : 0
        }

        // Get page
        const items = products.slice(startIndex, startIndex + limit)
        const hasMore = startIndex + limit < products.length
        const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null

        return {
            items,
            total: products.length,
            hasMore,
            nextCursor
        }
    },

    async get(id: string): Promise<Product | null> {
        await delay(300)
        const products = getProducts()
        return products.find(p => p.id === id) || null
    },

    async update(id: string, data: Partial<Product>): Promise<Product | null> {
        await delay(400)
        const products = getProducts()
        const index = products.findIndex(p => p.id === id)
        if (index === -1) return null

        products[index] = { ...products[index], ...data }
        saveProducts(products)
        return products[index]
    },

    async delete(id: string): Promise<boolean> {
        await delay(300)
        const products = getProducts()
        const index = products.findIndex(p => p.id === id)
        if (index === -1) return false

        products.splice(index, 1)
        saveProducts(products)
        return true
    },

    async deleteMany(ids: string[]): Promise<number> {
        await delay(400)
        const products = getProducts()
        let deleted = 0

        for (const id of ids) {
            const index = products.findIndex(p => p.id === id)
            if (index !== -1) {
                products.splice(index, 1)
                deleted++
            }
        }

        saveProducts(products)
        return deleted
    },

    async updateManyStatus(ids: string[], status: Product['status']): Promise<number> {
        await delay(400)
        const products = getProducts()
        let updated = 0

        for (const id of ids) {
            const index = products.findIndex(p => p.id === id)
            if (index !== -1) {
                products[index].status = status
                updated++
            }
        }

        saveProducts(products)
        return updated
    },

    async duplicate(id: string): Promise<Product | null> {
        await delay(400)
        const products = getProducts()
        const original = products.find(p => p.id === id)
        if (!original) return null

        const newId = String(Math.max(...products.map(p => parseInt(p.id)), 0) + 1)
        const duplicate: Product = {
            ...original,
            id: newId,
            name: `${original.name} (Copy)`
        }

        products.push(duplicate)
        saveProducts(products)
        return duplicate
    }
}