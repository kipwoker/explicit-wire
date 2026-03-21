import { IControl, on, getContext, Navigator } from 'explicit-wire'
import { authProvider, goToHome } from '../main'

interface SignInParams {
  continueTo?: string
}

export class SignIn implements IControl {
  private params: SignInParams

  constructor(params: SignInParams = {}) {
    this.params = params
  }

  async render(): Promise<string> {
    const continueTo = this.params.continueTo || '/dashboard'

    // Set up event handlers inside render
    on('click', 'sign-in-user-btn', async () => {
      authProvider.signIn({
        id: '1',
        name: 'John Doe',
        role: 'user',
        email: 'john@example.com'
      })
      
      console.log('[SignIn] Signed in as user, navigating to:', continueTo)
      
      const navigator = getContext<Navigator>('navigator')
      await navigator.navigate(continueTo, 'hard')
    })

    on('click', 'sign-in-admin-btn', async () => {
      authProvider.signIn({
        id: '2',
        name: 'Admin User',
        role: 'admin',
        email: 'admin@example.com'
      })
      
      console.log('[SignIn] Signed in as admin, navigating to:', continueTo)
      
      const navigator = getContext<Navigator>('navigator')
      await navigator.navigate(continueTo, 'hard')
    })

    on('click', 'cancel-btn', async () => {
      await goToHome()
    })

    return `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); max-width: 400px; width: 100%;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 2rem; margin-bottom: 10px;">🔐 Sign In</h1>
            <p style="color: #666;">Choose a user role to continue</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p style="font-size: 0.9rem; color: #888; margin-bottom: 10px;">
              After signing in, you'll be redirected to: <code>${continueTo}</code>
            </p>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 15px;">
            <button 
              class="btn btn-primary" 
              id="sign-in-user-btn"
              style="width: 100%; padding: 15px; font-size: 1rem;"
            >
              👤 Sign In as User
            </button>
            
            <button 
              class="btn btn-primary" 
              id="sign-in-admin-btn"
              style="width: 100%; padding: 15px; font-size: 1rem; background: #e74c3c;"
            >
              👑 Sign In as Admin
            </button>
            
            <button 
              class="btn" 
              id="cancel-btn"
              style="width: 100%; padding: 15px; font-size: 1rem; background: #95a5a6; color: white;"
            >
              Cancel
            </button>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="font-size: 0.85rem; color: #888; text-align: center;">
              <strong>Note:</strong> Regular users can access Dashboard.<br>
              Admins can access both Dashboard and Admin Panel.
            </p>
          </div>
        </div>
      </div>
    `
  }
}