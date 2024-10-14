import { Entity, TYPES } from "../../orm"
import { Items } from "./items.entity"

interface PurchasesDBO extends Record<string, unknown> {
    id?: string
    item_id?: string
    user_id?: string
    order_id?: string
} 

export const Purchases = new Entity<PurchasesDBO>('Purchases', {
    id: {
        primary: true,
        type: TYPES.UUID,
        nullable: false
    },
    order_id: {
        nullable: false,
        type: TYPES.UUID
    },
    item_id: {
        nullable: false,
        type: TYPES.UUID
    },
    user_id: {
        type: TYPES.UUID
    }
})