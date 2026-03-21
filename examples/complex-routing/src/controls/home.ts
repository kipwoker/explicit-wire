import { IControl, on } from 'explicit-wire'
import { authProvider, goToSignIn } from '../main'

export class Home implements IControl {
  async render(): Promise<string> {
    const user = authProvider.getUser()
    const isAuthenticated = authProvider.isAuthenticated()

    // Set up event handler for sign-in button
    if (!isAuthenticated) {
      on('click', 'try-sign-in-btn', async () => {
        await goToSignIn({})
      })
    }

    const authSectionHtml = !isAuthenticated ? `
      <div class="content-card">
        <h3>🔐 Try the Authentication Flow</h3>
        <p>Sign in to see how the menu changes and routes become accessible:</p>
        <button class="btn btn-primary" id="try-sign-in-btn">
          Sign In to Continue
        </button>
      </div>
    ` : `
      <div class="content-card">
        <h3>✅ You're Signed In</h3>
        <p>Welcome back, <strong>${user?.name}</strong>!</p>
        <p>Your role: <strong>${user?.role}</strong></p>
        ${user?.role === 'admin' ? `
          <p>As an admin, you can access the Admin Panel from the sidebar.</p>
        ` : `
          <p>You can access your Dashboard from the sidebar.</p>
        `}
      </div>
    `

    return `
      <div class="page-header">
        <h1>🏠 Welcome Home</h1>
        <p>This is the public home page - accessible to everyone</p>
      </div>
      
      <div class="content-card">
        <h3>Complex Routing Example</h3>
        <p>This example demonstrates advanced routing patterns:</p>
        <ul style="margin: 15px 0 15px 20px;">
          <li><strong>Route Middleware:</strong> Check console for middleware logs</li>
          <li><strong>Conditional Routing:</strong> Routes that check authentication and roles</li>
          <li><strong>Role-Based Redirects:</strong> Default route redirects based on user role</li>
          <li><strong>Context-Based Menus:</strong> Menu items appear/disappear based on auth state</li>
        </ul>
      </div>
      
      ${authSectionHtml}
      
      <div class="demo-section">
        <h4>🧪 Test the Routing Patterns</h4>
        <ul>
          <li>Try accessing <code>/dashboard</code> without signing in - you'll be redirected to sign-in</li>
          <li>Try accessing <code>/admin</code> as a regular user - you'll be redirected to home</li>
          <li>Sign in as admin and notice the Admin Panel menu item appears</li>
          <li>Sign out and watch the menu items disappear</li>
          <li>Check the browser console for middleware and routing logs</li>
        </ul>
      </div>
    `
  }
}