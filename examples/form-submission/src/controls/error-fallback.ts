import { IControl } from 'explicit-wire'

export interface IErrorFallbackProps {
    error: Error
}

export class ErrorFallback implements IControl {
    constructor(private props: IErrorFallbackProps) {}

    async render(): Promise<string> {
        return `
            <div style="color: red; padding: 20px;">
                <h2>Error</h2>
                <p>${this.props.error.message}</p>
                <a href="#/">Go back</a>
            </div>
        `
    }
}