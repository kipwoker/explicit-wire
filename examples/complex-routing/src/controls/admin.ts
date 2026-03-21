import { IControl } from 'explicit-wire'
import { authProvider } from '../main'

export class Admin implements IControl {
  async render(): Promise<string> {
    const user = authProvider.getUser()

    return `
      <div class="page-header">
        <h1>⚙️ Admin Panel</h1>
        <p>Administrative controls - requires admin role</p>
      </div>
      
      <div class="content-card">
        <h3>Admin Access Granted</h3>
        <p>Welcome, <strong>${user?.name}</strong> (Admin)</p>
        <p>This page is only accessible to users with the admin role.</p>
        <p>Regular users who try to access this page will be redirected to the home page.</p>
      </div>
      
      <div class="content-card">
        <h3>🛠️ Admin Tools</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #e74c3c;">
            <h4>User Management</h4>
            <p style="font-size: 0.9rem; color: #666;">Manage user accounts and permissions</p>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #3498db;">
            <h4>System Settings</h4>
            <p style="font-size: 0.9rem; color: #666;">Configure application settings</p>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #27ae60;">
            <h4>Analytics</h4>
            <p style="font-size: 0.9rem; color: #666;">View system analytics and logs</p>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #9b59b6;">
            <h4>Content Moderation</h4>
            <p style="font-size: 0.9rem; color: #666;">Review and moderate content</p>
          </div>
        </div>
      </div>
      
      <div class="demo-section">
        <h4>🔒 Role-Based Access Control</h4>
        <ul>
          <li>This route checks both authentication AND admin role</li>
          <li>Sign in as a regular user and try accessing this page</li>
          <li>You'll be redirected to home with no access</li>
          <li>Sign in as admin to see this page</li>
          <li>The menu item only appears for admin users</li>
        </ul>
      </div>
    `
  }
}