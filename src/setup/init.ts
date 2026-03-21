import { EventHandlerStore, IEventHanderStoreProps } from "../interaction/event";
import { INavigatorProps, Navigator } from "../navigation/navigator";
import { Router } from "../plugins/routing/router";
import { setContext } from "../state/context";
import { RenderMiddleware } from "../view/control";
import { ViewManager } from "../view/view-manager";

interface IFrameworkBuilderState {
    eventHandlerStore?: IEventHanderStoreProps
    navigator?: INavigatorProps
    router?: Router
}

export interface IFrameworkState {
    viewManager: ViewManager
    renderMiddleware: RenderMiddleware
    eventHandlerStore?: EventHandlerStore
    navigator?: Navigator
    router?: Router
}

export class FrameworkBuilder {
    state: IFrameworkBuilderState

    constructor() {
        this.state = {}
    }

    addNavigator(props: INavigatorProps): FrameworkBuilder {
        this.state.navigator = props

        return this
    }

    addRouter(props: Router): FrameworkBuilder {
        this.state.router = props

        return this
    }

    addEventHandlerStore(props: IEventHanderStoreProps): FrameworkBuilder {
        this.state.eventHandlerStore = props

        return this
    }

    build(): IFrameworkState {
        const state: IFrameworkState = {
            viewManager: new ViewManager(),
            renderMiddleware: {
                postRenderActions: [],
                preRenderActions: []
            },
            navigator: this.state.navigator ? new Navigator(this.state.navigator) : undefined,
            router: this.state.router,
            eventHandlerStore: this.state.eventHandlerStore ? new EventHandlerStore(this.state.eventHandlerStore) : undefined
        }

        setContext('view-manager', state.viewManager)
        setContext('navigator', state.navigator)
        setContext('router', state.router)
        setContext('render-middleware', state.renderMiddleware)
        setContext('event-handler-store', state.eventHandlerStore)

        return state
    }
}