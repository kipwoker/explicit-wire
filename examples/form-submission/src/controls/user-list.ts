import { IControl, on } from 'explicit-wire'
import { userRepository } from '../repositories/user-repository'
import { goToCreateUser, goToEditUser } from '../main'

export class UserList implements IControl {
    async render(): Promise<string> {
        const users = await userRepository.getAll()
        
        // Set up click handlers for edit buttons
        for (const user of users) {
            on('click', `edit-user-${user.id}`, async () => {
                await goToEditUser({ id: user.id })
            })
        }
        
        // Set up click handler for create button
        on('click', 'create-user-btn', async () => {
            await goToCreateUser()
        })

        const userListHtml = users.map(user => `
            <div class="user-card">
                <div class="user-info">
                    <strong>${user.name}</strong>
                    <span>Age: ${user.age}</span>
                </div>
                <button id="edit-user-${user.id}" class="btn btn-small">Edit</button>
            </div>
        `).join('')

        return `
            <div class="user-list-container">
                <div class="header">
                    <h1>User Management</h1>
                    <button id="create-user-btn" class="btn btn-primary">Create New User</button>
                </div>
                
                <div class="user-list">
                    ${users.length === 0 
                        ? '<p class="no-users">No users yet. Create one!</p>'
                        : userListHtml
                    }
                </div>
            </div>
        `
    }
}