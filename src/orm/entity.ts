
// import { Client } from "pg"
import { InsertQuery, ReadQuery, UpdateQuery, DeleteQuery, CreateTableQuery } from "./queries"
import { EntityRecord } from "./classes"
import { Query } from "./interfaces"
import { KeyNotExists } from "./errors"

import { ClientConfig, Client as Pg } from 'pg'

export class Client {
    static client: Pg | null = null

    constructor(args?: ClientConfig){
        if(!Client.client) {
            Client.client = new Pg(args)
        }
    }

    connect(callback?: (err: Error) => void): void | Promise<void> {
        if(callback) {
            Client.client?.connect(callback)
            return
        }
        Client.client?.connect()
    }
}

export class Entity<T extends Record<string, unknown>> extends Client {
    private entityName: string = ''
    private entityKeys: string[] = []
    private initilized = false
    private client: Pg | null = null
    private entityStruct: Record<string, EntityRecord>
    
    constructor(entityName: string, entity: Record<string, EntityRecord>) {
        super()
        this.client = Client.client
        this.entityName = entityName
        this.entityKeys = Object.keys(entity)
        this.entityStruct = entity
    }

    private async init() {
        if(this.initilized) return

        try {
            const q = CreateTableQuery.replace('{table_name}', `"${this.entityName}"`)
            .replace('{fields}', Object.entries(this.entityStruct).map(s => {
                const key = s[0]
                const val = s[1]
                const type = val?.type
                const primary = val?.primary ? ' PRIMARY KEY' : ''
                const nullable = val?.nullable ? ' NOT NULL' : ''
                const def = 'default' in val ? ` DEFAULT ${typeof val.default === 'number' ? val.default : `'${val.default}'`}` : ''
            
                return `"${key}" ${type}${primary}${nullable}${def}`
            }).join(',\n'))

            await this.client?.query(q)

            this.initilized = true
        } catch (error) {
            console.log( error)
        }
    }

    async create(data: T | T[]) {
        await this.init()

        let $ = 1

        const values = [data].flat()
            .map((d) => `(${this.entityKeys.map((_,i) => `$${$++}`).join(',')})`)
            .join(',')

        const q = InsertQuery.replace('{table_name}', `"${this.entityName}"`)
        .replace('{columns}', `(${this.entityKeys.map(k => `"${k}"`).join()})`)
        .replace('{values}', values)

        const formed = [data].flat()
            .map((d: any) => {
                return this.entityKeys.map(k => {
                    if(k in d)
                        return d[k]
                    throw new KeyNotExists(k)
                })
            }).flat()

        return this.client?.query(q, formed)
    }

    async findAll(params: Query = {}): Promise<T[]> {
        await this.init()

        const q = ReadQuery.replace('{table_name}', `"${this.entityName}"`)
            .replace('{limit}', `LIMIT ${(params.limit || 100).toString()}`)
            .replace('{offset}', `OFFSET ${(params.offset || 0).toString()}`)
            .replace('{where}', params.where ? `WHERE ${Object.entries(params.where)
                .map(({"0": key, "1": value}) => 
                    `"${key}" = ${Number.isInteger(value) ? value : `'${value}'`}
                
                `).join(' AND ')}`
             : '')

        return (await this.client?.query(q))?.rows as T[]
    }

    async findOne(params: Query = {}): Promise<T | null> {
        await this.init()

        return (await this.findAll({...params, offset: 0, limit: 1})).at(0) || null
    }

    async findById(id: unknown): Promise<T | null> {
        await this.init()

        return this.findOne({
            where: {
                id
            }
        })
    }

    async update(params: Query, data: T){
        await this.init()

        const q = UpdateQuery.replace('{table_name}', `"${this.entityName}"`)
        .replace('{cvalues}', 
            Object.entries(data)
            .map(({"0": key, "1": value}) => `${key} = ${value}`)
            .join(','))
        .replace('{where}', params.where ? `WHERE ${Object.entries(params.where)
            .map(({"0": key, "1": value}) => 
                value !== undefined ? `"${key}" = ${Number.isInteger(value) ? value : `'${value}'`}` :
                undefined)
            .filter(id => id)
            .join(' AND ')}`
         : '')

         return this.client?.query(q)
    }
    
    async delete(params: Query = {}){
        await this.init()

        const q = DeleteQuery.replace('{table_name}', `"${this.entityName}"`)
        .replace('{where}', params.where ? `WHERE ${Object.entries(params.where)
            .map(({"0": key, "1": value}) => 
                `"${key}" = ${Number.isInteger(value) ? value : `'${value}'`}
            
            `).join(' AND ')}`
         : '')

        return  this.client?.query(q)
    }

    async deleteById(id: string) {
        await this.init()

        return this.delete({
            where: {
                id
            }
        })
    }
}