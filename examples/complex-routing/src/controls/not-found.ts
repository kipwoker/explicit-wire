import { IControl, on } from 'explicit-wire'
import { goToHome } from '../main'

export class NotFound implements IControl {
  async render(): Promise<string> {
    // Set up event handler inside render
    on('click', 'go-home-btn', async () => {
      await goToHome()
    })

    return `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f5f5f5;">
        <div style="text-align: center; padding: 40px;">
          <h1 style="font-size: 6rem; color: #e74c3c; margin-bottom: 20px;">404</h1>
          <h2 style="font-size: 2rem; color: #2c3e50; margin-bottom: 20px;">Page Not Found</h2>
          <p style="color: #7f8c8d; margin-bottom: 30px; max-width: 400px;">
            The page you're looking for doesn't exist or has been moved.
            This demonstrates the onRouteNotFound handler.
          </p>
          <button class="btn btn-primary" id="go-home-btn">
            🏠 Go Home
          </button>
          
          <div style="margin-top: 40px; padding: 20px; background: white; border-radius: 8px; max-width: 500px; margin-left: auto; margin-right: auto;">
            <h4 style="margin-bottom: 15px;">Route Not Found Handler</h4>
            <p style="font-size: 0.9rem; color: #666; text-align: left;">
              This page is displayed when the router cannot find a matching route.
              The <code>onRouteNotFound</code> callback in the Router configuration
              handles this by redirecting to the not-found page.
            </p>
          </div>
        </div>
      </div>
    `
  }
}