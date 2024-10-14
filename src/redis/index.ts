import { createClient } from 'redis'

const {
    REDIS_HOST,
    REDIS_PORT,
} = process.env

export const rsClient = createClient({
    url: `redis://${REDIS_HOST}:${REDIS_PORT}`
})