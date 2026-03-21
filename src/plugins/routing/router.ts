import { NavigationMode, Navigator } from "../../navigation/navigator"
import { getContext } from "../../state/context"
import { IControl } from "../../view/control"

export type GoToFunction<TParams = any> = (params: TParams, mode?: NavigationMode) => Promise<void>

export type RouteAction =
    { type: 'replace-control', control: IControl } |
    { type: 'redirect', redirect: GoToFunction<any>, params?: any, mode?: NavigationMode }

export interface RouteDefinition<TParams = any> {
    alias: string
    handler: (params: TParams) => Promise<RouteAction>
    defaultMode?: NavigationMode
}

export interface IRouterProps {
    onBeforeRoute?: () => Promise<void>
    onAfterRoute?: () => Promise<void>
    onRouteNotFound: () => Promise<void>
}

export class Router {
    routes: { [key: string]: ((params?: any) => Promise<RouteAction>) } = {}

    constructor(private props: IRouterProps) {
        window.onpopstate = async () => {
            await this.resolve()
        }
    }

    private getPath<TParams = any>(alias: string, params?: TParams): string {
        let path = alias
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                path = path.replace(`:${key}`, encodeURIComponent(String(value)))
            })
        }

        return path
    }

    private async applyRouteAction(action: RouteAction): Promise<void> {
        switch (action.type) {
            case 'replace-control':
                await getContext<Navigator>('navigator').replace(action.control)
                break
            case 'redirect':
                await action.redirect(action.params, action.mode)
                break
        }
    }

    on<TParams = any>(route: RouteDefinition<TParams>): GoToFunction<TParams> {
        this.routes[route.alias] = route.handler
        return async (params: TParams, mode?: NavigationMode) => {
            const finalMode = mode ?? route.defaultMode ?? 'hard'
            const path = this.getPath(route.alias, params)

            await this.goTo<TParams>(path, params, finalMode)
        }
    }

    private async goTo<TParams = any>(path: string, params?: TParams, mode?: NavigationMode) {
        await getContext<Navigator>('navigator').navigate(path, mode)
        if (mode === 'soft') {
            await this.resolve(params)
        }
    }

    async resolve(customParams?: any): Promise<void> {
        const path = window.location.pathname
        const routeKeys = Object.keys(this.routes)
        for (const routeKey of routeKeys) {
            const regex = new RegExp(`^${routeKey.replace(/:\w+/g, '([^/]+)')}$`)
            if (!regex.test(path)) {
                continue
            }

            const values = path.match(regex)?.slice(1)
            if (values) {
                if (this.props.onBeforeRoute) {
                    await this.props.onBeforeRoute()
                }

                let params = customParams
                if (!params) {
                    const paramNames = (routeKey.match(/:\w+/g) || []).map(name => name.substring(1))

                    params = paramNames.reduce((acc, name, index) => {
                        acc[name] = values[index]
                        return acc
                    }, {} as Record<string, string>)
                }

                const routeAction = await this.routes[routeKey](params)
                await this.applyRouteAction(routeAction)

                if (this.props.onAfterRoute) {
                    await this.props.onAfterRoute()
                }
                return
            }
        }

        await this.props.onRouteNotFound()
    }
}