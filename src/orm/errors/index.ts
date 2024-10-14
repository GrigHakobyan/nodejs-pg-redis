export class KeyNotExists extends Error {
    constructor(key: string) {
        super(`Key does not exists: ${key}`)
    }
}
