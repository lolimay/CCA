export function toFixed(number: number, precision: number = 15): number {
    return Number(number.toFixed(precision));
}

export function getRandomInt(max: number): number {
    return Math.floor(Math.random() * Math.floor(max));
}