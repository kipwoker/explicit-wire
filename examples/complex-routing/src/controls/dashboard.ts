import { IControl } from 'explicit-wire'
import { authProvider } from '../main'

export class Dashboard implements IControl {
  async render(): Promise<string> {
    const user = authProvider.getUser()

    return `
      <div class="page-header">
        <h1>📊 Dashboard</h1>
        <p>Your personal dashboard - requires authentication</p>
      </div>
      
      <div class="content-card">
        <h3>Welcome, ${user?.name}!</h3>
        <p>This page is only accessible to authenticated users.</p>
        <p>If you try to access this page without signing in, you'll be redirected to the sign-in page.</p>
      </div>
      
      <div class="content-card">
        <h3>📈 Your Statistics</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 15px;">
          <div style="background: #3498db; color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; font-weight: bold;">42</div>
            <div>Projects</div>
          </div>
          <div style="background: #27ae60; color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; font-weight: bold;">128</div>
            <div>Tasks</div>
          </div>
          <div style="background: #e67e22; color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; font-weight: bold;">89%</div>
            <div>Completion</div>
          </div>
        </div>
      </div>
      
      <div class="demo-section">
        <h4>🔐 Route Protection Demo</h4>
        <ul>
          <li>This route has authentication middleware</li>
          <li>Try signing out and navigating back here</li>
          <li>You'll be redirected to sign-in with a "continue to" parameter</li>
          <li>After signing in, you'll be automatically returned here</li>
        </ul>
      </div>
    `
  }
}