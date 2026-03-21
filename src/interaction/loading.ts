export interface ILoading {
    start: () => Promise<void>
    stop: () => Promise<void>
    updateProgress: (progressPercent: number) => Promise<void>
    inProgress: boolean
}