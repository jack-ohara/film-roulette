export function getRandomElementFromArray<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

export function dateIsToday(date: Date): boolean {
    const today = new Date()

    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    )
}

export function wait(timeInMiliseconds: number): Promise<unknown> {
    return new Promise(resolve => setTimeout(resolve, timeInMiliseconds))
}