export interface User {
    id: string
    name: string
    age: number
}

const STORAGE_KEY = 'explicit-wire-users'

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Initialize with default data if empty
const initializeData = (): void => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
        const defaultUsers: User[] = [
            { id: '1', name: 'John Doe', age: 30 },
            { id: '2', name: 'Jane Smith', age: 25 }
        ]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers))
    }
}

// Get all users from localStorage
const getUsers = (): User[] => {
    initializeData()
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
}

// Save users to localStorage
const saveUsers = (users: User[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

export const userRepository = {
    async get(id: string): Promise<User | null> {
        await delay(500) // Simulate API call
        const users = getUsers()
        return users.find(u => u.id === id) || null
    },

    async getAll(): Promise<User[]> {
        await delay(300)
        return getUsers()
    },

    async create(data: Omit<User, 'id'>): Promise<User> {
        await delay(500)
        const users = getUsers()
        const id = String(Math.max(...users.map(u => parseInt(u.id)), 0) + 1)
        const user: User = { id, ...data }
        users.push(user)
        saveUsers(users)
        return user
    },

    async update(id: string, data: Partial<Omit<User, 'id'>>): Promise<User | null> {
        await delay(500)
        const users = getUsers()
        const index = users.findIndex(u => u.id === id)
        if (index === -1) {
            return null
        }
        const updated: User = { ...users[index], ...data }
        users[index] = updated
        saveUsers(users)
        return updated
    },

    async delete(id: string): Promise<boolean> {
        await delay(300)
        const users = getUsers()
        const index = users.findIndex(u => u.id === id)
        if (index === -1) {
            return false
        }
        users.splice(index, 1)
        saveUsers(users)
        return true
    }
}
