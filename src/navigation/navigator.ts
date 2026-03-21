import { ReplaceRequest, ViewManager } from "../view/view-manager"
import { IControl } from "../view/control"
import { getContext } from "../state/context"

export type NavigationMode = 'soft' | 'hard'

export interface INavigatorProps {
    replacer: (control: IControl) => ReplaceRequest
}

export class Navigator {
    constructor(private props: INavigatorProps) {}

    public async navigate(
        path: string, 
        mode: NavigationMode = 'hard'
    ): Promise<void> {
        if (mode === 'soft') {
            history.pushState(null, '', path)
            return
        }
        window.location.href = path
        return
    }

    public async replace(
        control: IControl
    ): Promise<void> {
        return await getContext<ViewManager>('view-manager').replace(this.props.replacer(control))
    }
}