import { on } from "../../interaction/event"
import { ILoading } from "../../interaction/loading"

const getFormData = (target: HTMLFormElement): { [key: string]: any } => {
    const data: { [key: string]: any } = {}
    for (const element of target.elements as any) {
        if (element.name) {
            if (element.type === 'checkbox') {
                data[element.name] = element.checked
            } else {
                data[element.name] = element.value
            }
        }
    }

    return data
}

export const onSubmit = <T extends { [key: string]: any }> (
    formId: string,
    loading: ILoading,
    action: (data: T) => Promise<void>
): void => {
    on('submit', formId, async (event: Event) => {
        if (!event.target || event.defaultPrevented) {
            return
        }

        event.preventDefault()

        const data = getFormData(event.target as HTMLFormElement)

        try {
            await loading.start()
            await action(data as T)
        } finally {
            await loading.stop()
        }
    })
}