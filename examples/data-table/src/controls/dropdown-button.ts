import { IControl, on } from 'explicit-wire'

export interface IDropdownOption {
    id: string
    title: string
    confirmText?: string
}

export interface IDropdownButtonProps {
    id: string
    label: string
    options: IDropdownOption[]
    onSelect: (target: EventTarget, option: IDropdownOption) => Promise<void>
}

export class DropdownButton implements IControl {
    constructor(private props: IDropdownButtonProps) {}

    options: string | null = null

    getListId(): string {
        return `option-list-${this.props.id}`
    }

    closeDropdown(): void {
        if (this.options === null) {
            return
        }

        const list = document.getElementById(this.getListId())
        if (list) {
            list.style.display = 'none'
        }
    }

    openDropdown(): void {
        if (this.options === null) {
            this.options = this.renderOptions()
            const dropdownElement = document.getElementById(this.props.id)
            if (dropdownElement && this.options) {
                dropdownElement.insertAdjacentHTML('afterend', this.options)
            }
            return
        }

        const list = document.getElementById(this.getListId())
        if (list) {
            list.style.display = 'block'
        }
    }

    show(button: HTMLElement): void {
        button.classList.add('pressed')
        this.openDropdown()
    }

    hide(button: HTMLElement): void {
        this.closeDropdown()
        button.classList.remove('pressed')
    }

    isVisible(button: HTMLElement): boolean {
        return button.classList.contains('pressed')
    }

    renderOptions(): string {
        const id = this.props.id
        const options = this.props.options.map(option => {
            const optionId = `option-${id}-${option.id}`
            
            if (option.confirmText) {
                let confirmTimeout: any
                
                on('click', optionId, async (event: any) => {
                    const button = event.target as HTMLElement
                    
                    if (button.classList.contains('confirming')) {
                        clearTimeout(confirmTimeout)
                        button.innerHTML = '✅ Done'
                        button.setAttribute('disabled', 'disabled')
                        await this.props.onSelect(event.target, option)
                        setTimeout(() => {
                            const parentButton = document.getElementById(id)
                            if (parentButton) {
                                this.hide(parentButton)
                            }
                        }, 500)
                    } else {
                        button.classList.add('confirming')
                        button.innerHTML = option.confirmText!
                        confirmTimeout = setTimeout(() => {
                            button.classList.remove('confirming')
                            button.innerHTML = option.title
                        }, 3000)
                    }
                })
            } else {
                on('click', optionId, async (event: any) => {
                    if (!event.target || event.defaultPrevented) {
                        return
                    }
                    event.preventDefault()
                    await this.props.onSelect(event.target, option)
                    const button = document.getElementById(id)
                    if (button) {
                        this.hide(button)
                    }
                })
            }

            return `<button class="option small-button" id="${optionId}">${option.title}</button>`
        }).join('')

        return `<div class="option-list" id="${this.getListId()}">
            <div class="option-list-container">${options}</div>
        </div>`
    }

    async render(): Promise<string> {
        const buttonId = this.props.id
        const listId = this.getListId()
        const isActive = this.props.options.length > 0

        if (isActive) {
            on('click', buttonId, async (event: any) => {
                const button = event.target
                if (this.isVisible(button)) {
                    this.hide(button)
                } else {
                    this.show(button)
                }
            })
        }

        // Click outside to close
        on('click', buttonId, async (event: any) => {
            const modal = document.getElementById(listId)
            const button = document.getElementById(buttonId)
            if (
                modal &&
                button &&
                !modal.contains(event.target) &&
                !button.contains(event.target) &&
                modal !== event.target &&
                button !== event.target
            ) {
                this.hide(button)
            }
        }, { captureStrategy: 'multilayer' })

        return `<button id="${buttonId}" class="regular pressable" ${isActive ? '' : 'disabled="disabled"'}>${this.props.label}</button>`
    }
}