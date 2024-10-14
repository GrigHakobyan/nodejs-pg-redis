import { TYPES } from "../types"

export class EntityRecord {
    primary?: boolean = false
    type?: TYPES = TYPES.VARCHAR_DEFAULT
    nullable?: boolean = true
    default?: unknown
}
