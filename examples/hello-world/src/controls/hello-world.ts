import { IControl } from 'explicit-wire'

export class HelloWorld implements IControl {
    async render(): Promise<string> {
        return `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
                <h1>Hello World!</h1>
            </div>
        `
    }
}