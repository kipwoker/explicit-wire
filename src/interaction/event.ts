import { getContext } from "../state/context"

export interface IEventHanderStoreProps {
    logDomEvents: boolean
}

export type EventCaptureStrategy = 'stick-to-target' | 'multilayer'
export type EventSubscribeMode = 'strict-single' | 'override-last'
type EventType = string
type TargetId = string

export class EventHandlerStore {
    private state: {
        handlers: Map<EventCaptureStrategy, Map<EventType, Map<TargetId, (event: any) => Promise<void>>>>,
        listeners: Map<string, (event: any) => Promise<void>>,
        observer: MutationObserver
    }

    private collected: {
        handlers: Map<EventCaptureStrategy, Map<EventType, Map<TargetId, (event: any) => Promise<void>>>>
    }

    constructor(private props: IEventHanderStoreProps) {
        this.state = {
            handlers: new Map(),
            listeners: new Map(),
            observer: new MutationObserver(this.handleMutations.bind(this))
        }

        this.state.observer.observe(document.body, { childList: true, subtree: true })

        this.collected = {
            handlers: new Map()
        }
    }

    private handleMutations(mutations: MutationRecord[]) {
        for (const mutation of mutations) {
            this.log(`Mutation: ${mutation.type} ${(mutation.target as HTMLElement)?.id}`)
            if (mutation.type === 'childList') {
                for (const node of mutation.removedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.handleElementRemoved(node as HTMLElement)
                    }
                }

                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.handleElementAdded(node as HTMLElement)
                    }
                }
            }
        }
    }

    private handleElementAdded(element: HTMLElement) {
        this.handleElementById(element, (elementId) => {
            this.log(`Element added ${element.id}`)
            this.register(elementId)
        })
    }

    private handleElementRemoved(element: HTMLElement) {
        this.handleElementById(element, (elementId) => {
            this.log(`Element removed ${element.id}`)
            this.unregister(elementId)
        })
    }

    private handleElementById(element: HTMLElement, callback: (elementId: string) => void) {
        const allIds = [element?.id, ...Array.from(element.querySelectorAll("*"))
            .map(el => el.id)
            ].filter(id => !!id)

        for (const id of allIds) {
            callback(id)
        }
    }

    private getTargetId(target: HTMLElement | null): string | undefined {
        let targetId = target?.id

        if (!targetId && target?.closest) {
            const closestParentWithId = target?.closest('[id]') as HTMLElement
            targetId = closestParentWithId?.id
        }

        return targetId
    }

    private async proxy(event: Event) {
        const targetId = this.getTargetId(event.target as HTMLElement)
        if (targetId) {
            const handler = this.state.handlers.get('stick-to-target')?.get(event.type)?.get(targetId)
            if (handler) {
                await handler(event)
            }
        }

        const globalHandlers = this.state.handlers.get('multilayer')?.get(event.type)?.values()
        if (globalHandlers) {
            for (const globalHandler of globalHandlers) {
                await globalHandler(event)
            }
        }
    }

    public collect(
        eventTypes: string | string[], 
        targetId: string, 
        handler: (event: Event) => Promise<void>, 
        props?: ISubscribeProps
    ) {
        const captureStrategy = props?.captureStrategy ?? defaultSubscribeProps.captureStrategy!!
        const mode = props?.mode ?? defaultSubscribeProps.mode!!
     
        const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes]
        
        for (const eventType of types) {
            this.log(`Collecting ${eventType} for ${targetId} captureStrategy: ${captureStrategy}`)

            let strategyHandlers = this.collected.handlers.get(captureStrategy)
            if (!strategyHandlers) {
                strategyHandlers = new Map()
                this.collected.handlers.set(captureStrategy, strategyHandlers)
            }

            let targetHandlers = strategyHandlers.get(eventType)
            if (!targetHandlers) {
                targetHandlers = new Map()
                strategyHandlers.set(eventType, targetHandlers)
            }

            if (mode === 'strict-single' && targetHandlers.has(targetId)) {
                throw new Error(`> Handler for ${eventType} captureStrategy ${captureStrategy} and ${targetId} already collected`)
            }
            targetHandlers.set(targetId, handler)
        }
    }

    private register(targetId: string) {
        this.log(`Register ${targetId}`)

        const eventTypes = new Set<string>()

        this.collected.handlers.forEach((typeHandlers, handlerType) => {
            this.log(`> Register ${handlerType} handlers`)
            let stateHandlers = this.state.handlers.get(handlerType)
            if (!stateHandlers) {
                stateHandlers = new Map()
                this.state.handlers.set(handlerType, stateHandlers)
            }

            typeHandlers.forEach((handlers, eventType) => {
                const handler = handlers.get(targetId)
                if (handler) {
                    let targetHandlers = stateHandlers.get(eventType)
                    if (!targetHandlers) {
                        targetHandlers = new Map()
                        stateHandlers.set(eventType, targetHandlers)
                    }
                    targetHandlers.set(targetId, handler)
                    handlers.delete(targetId)
                    eventTypes.add(eventType)

                    this.log(`> > Found ${handlerType} handler for ${targetId}/${eventType}`)
                }
            })
        })


        for (const eventType of eventTypes) {
            if (!this.state.listeners.has(eventType)) {
                const listener = this.proxy.bind(this)
                this.state.listeners.set(eventType, listener)
                document.addEventListener(eventType, listener)

                this.log(`> Listen ${eventType}`)
            }
        }
    }

    private unregister(targetId: string) {
        this.log(`Unregister ${targetId}`)

        this.state.handlers.forEach((typeHandlers, handlerType) => {
            this.log(`> Unregister ${handlerType} handlers`)
            typeHandlers.forEach((handlers) => {
                handlers.delete(targetId)
            })
        })
    }

    private log(value: string) {
        if (!this.props.logDomEvents) {
            return
        }

        console.log(value)
    }

    public destroy() {
        this.state.observer.disconnect()
    }
}

export interface ISubscribeProps {
    mode?: EventSubscribeMode
    captureStrategy?: EventCaptureStrategy
}

export const defaultSubscribeProps: ISubscribeProps = {
    mode: 'strict-single',
    captureStrategy: 'stick-to-target'
}

export const on = (
    eventType: string | string[], 
    targetId: string, 
    handler: (event: Event) => Promise<void>, 
    props?: ISubscribeProps
) => {
    const store = getContext<EventHandlerStore>('event-handler-store')
    if (!store) {
        throw new Error('Add .addEventHandlerStore({ ... }) to your FrameworkBuilder to use the "on" function')
    }

    return store.collect(eventType, targetId, handler, props)
}
