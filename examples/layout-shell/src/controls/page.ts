import { IControl, on, getContext } from 'explicit-wire'

export interface IPageProps {
    title: string
}

export class Page implements IControl {
    constructor(private props: IPageProps) {}

    async render(): Promise<string> {
        return `
        <main class="content">
            <div class="content-header">
                <h1 class="content-title">${this.props.title}</h1>
                <p class="content-subtitle">This is a useful subtitle</p>
            </div>
            <div class="content-body">
                <p>This is a placeholder for the ${this.props.title} page.</p>
            </div>
        </main>
        `
    }
}