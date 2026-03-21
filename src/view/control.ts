import { getContext } from "../state/context"

export interface IControl {
    render(): Promise<string>
}

export type RenderAction = () => Promise<void>
export interface RenderMiddleware {
    postRenderActions: RenderAction[]
    preRenderActions: RenderAction[]
}

export const postRender = (action: RenderAction): void => {
    getContext<RenderMiddleware>('render-middleware').postRenderActions.push(action)
}

export const preRender = (action: RenderAction): void => {
    getContext<RenderMiddleware>('render-middleware').preRenderActions.push(action)
}