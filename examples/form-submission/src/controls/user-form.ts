import { IControl, onSubmit, on } from 'explicit-wire'
import { userRepository, User } from '../repositories/user-repository'
import { goToUserList } from '../main'
import { createFormLoading } from '../interactions/form-loading'

export interface IUserFormProps {
    id?: string
}

export class UserForm implements IControl {
    constructor(private props: IUserFormProps = {}) {}

    async render(): Promise<string> {
        const containerId = 'user-form-container'
        const formId = `user-form-${this.props.id}`
        const isEdit = !!this.props.id

        // Load existing user if editing
        let user: User | null = null
        if (isEdit) {
            user = await userRepository.get(this.props.id!)
        }

        // Set up form submission handler
        onSubmit(formId, createFormLoading(formId), async (data: any) => {
            const statusEl = document.getElementById('form-status')
            
            try {
                // Validate
                if (!data.name || data.name.trim() === '') {
                    throw new Error('Name is required')
                }
                
                const age = parseInt(data.age, 10)
                if (isNaN(age) || age < 0 || age > 150) {
                    throw new Error('Age must be a valid number between 0 and 150')
                }

                // Save
                if (isEdit) {
                    await userRepository.update(this.props.id!, { name: data.name, age })
                } else {
                    await userRepository.create({ name: data.name, age })
                }

                if (statusEl) {
                    statusEl.textContent = isEdit ? 'User updated successfully!' : 'User created successfully!'
                    statusEl.className = 'status-message success'
                }

                // Navigate to list after successful save
                await goToUserList()
            } catch (error: any) {
                if (statusEl) {
                    statusEl.textContent = error.message
                    statusEl.className = 'status-message error'
                }
            }
        })

        // Set up cancel button handler
        on('click', 'cancel-btn', async () => {
            await goToUserList()
        })

        return `
            <div id="${containerId}" class="form-container">
                <h1>${isEdit ? 'Edit User' : 'Create User'}</h1>
                
                <form id="${formId}" class="user-form">
                    ${isEdit ? `
                        <div class="form-group">
                            <label for="user-id">ID</label>
                            <input type="text" id="user-id" name="userId" value="${user?.id || ''}" disabled />
                        </div>
                    ` : ''}
                    
                    <div class="form-group">
                        <label for="name">Name *</label>
                        <input 
                            type="text" 
                            id="name" 
                            name="name" 
                            value="${user?.name ?? ''}" 
                            placeholder="Enter name"
                            required
                        />
                    </div>
                    
                    <div class="form-group">
                        <label for="age">Age *</label>
                        <input 
                            type="number" 
                            id="age" 
                            name="age" 
                            value="${user?.age ?? ''}" 
                            placeholder="Enter age"
                            min="0"
                            max="150"
                            required
                        />
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">
                            ${isEdit ? 'Update' : 'Create'}
                        </button>
                        <button type="button" id="cancel-btn" class="btn btn-secondary">Cancel</button>
                    </div>
                    
                    <div id="form-status" class="status-message"></div>
                </form>
            </div>
        `
    }
}