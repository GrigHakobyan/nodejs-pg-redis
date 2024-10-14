import { Entity, TYPES } from "../../orm"

interface UserDBO extends Record<string, unknown> {
    id?: string
    username?: string
    balance?: number
} 

export const Users = new Entity<UserDBO>('Users', {
    id: {
        primary: true,
        type: TYPES.UUID,
        nullable: false
    },
    username: { type: TYPES.VARCHAR_DEFAULT },
    balance: { type: TYPES.INTEGER, default: 0 },
})