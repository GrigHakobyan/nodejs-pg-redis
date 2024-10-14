import { Entity, TYPES } from "../../orm"

export interface ItemsDBO extends Record<string, unknown> {
    id?: string
    name?: string
    desc?: string
    price?: number
    count?: number 
} 

export const Items = new Entity<ItemsDBO>('Items', {
    id: {
        primary: true,
        type: TYPES.UUID,
        nullable: false
    },
    name: { type: TYPES.VARCHAR_DEFAULT, nullable: false },
    desc: { type: TYPES.VARCHAR_DEFAULT },
    price: { type: TYPES.INTEGER, default: 0 },
    count: { type: TYPES.INTEGER, default: 0 },
})