import { json, Router } from "express"
import { Purchases } from "../pg/entity/purchases.entity"
import { v4 } from "uuid"
import { Users } from "../pg/entity/users.entity"
import { Items, ItemsDBO } from "../pg/entity/items.entity"
import { rsClient } from "../redis"

export const PurchasesRouter = Router()

PurchasesRouter.get('/', async (req, res) => {
    const { page = 0, size = 10 , orderId } = req.query

    if(orderId) {
        const cached = await rsClient.get(orderId as string)

        if(cached) {
            res.json({ data: JSON.parse(cached) , cached: true})
            return
        }
    }

    const purchases = await Purchases.findAll({
        limit: Number(size),
        offset: Number(page) * Number(size),
        ...(orderId ? { where: { order_id: orderId } } : {})
    })

    const populated = await purchases.reduce(async (acc, ps) => {
        const resolvedAcc = await acc

        const item = await Items.findById(ps.item_id)
        const user = await Users.findById(ps.user_id)

        return [...resolvedAcc, { 
            id: ps.id,
            orderId: ps.order_id,
            user: user,
            item: item,
         }]

    }, Promise.resolve([] as any[]))

    if(orderId) {
        await rsClient.set(orderId as string, JSON.stringify(populated))
    }
    

    res.json({ data: populated })
})

PurchasesRouter.get('/:id', async (req, res) => {
    const { id } = req.params

    if(!id) {
        res.status(400).json({ error: 'Invalid Arguments' })
        return
    }

    const purchases = await Purchases.findById(id)

    const item = await Items.findById(purchases?.item_id)
    const user = await Users.findById(purchases?.user_id)
    const populated = { 
            id: purchases?.id,
            orderId: purchases?.order_id,
            user: user,
            item: item,
         }


    res.json({ data: populated })
})

PurchasesRouter.post('/', async (req, res) => {
    const { 
        items,
        userId
    } = req.body

    if(!userId || !items || !items.length) {
        res.status(400).json({ error: 'Invalid Arguments' })
        return
    }

    try {

        const user = await Users.findById(userId)

        if(!user) {
            res.status(404).json({ error: 'User Not Found' })
            return
        }

        const balance = user.balance || 0

        const itemsList: ItemsDBO[] = await items.reduce(async (acc: Promise<ItemsDBO[]>, id: string) => {
            const resolvedAcc = await acc

            const item = await Items.findById(id)
            
            return [...resolvedAcc, item]
        }, Promise.resolve([]))

        const sum = itemsList.filter(i => i).reduce((acc, { count, price }) => {
            if(count) acc += price || 0

            return acc
        }, 0)

        if(balance < sum) {
            res.status(400).json({ error: 'Not Enough Balance' })
            return
        }

        const orderId = v4()

        const ps = itemsList.filter(i => i).flat()
            .map(({ id }) => ({
                user_id: userId,
                item_id: id,
                order_id: orderId,
                id: v4()
            }))

        await Purchases.create(ps)

        await Users.update({
            where: {
                id: userId
            }
        }, { balance: balance - sum })

        await itemsList.reduce(async (acc: Promise<any>, item) => {
            await acc

            await Items.update({ where: { id: item.id! } }, { count: item.count! - 1 })
            
            return []
        }, Promise.resolve([]))
    
        res.status(201).end()
    } catch (error) {
        console.log(error)
        
        res.status(500).json({ error: 'Internal Server Error' })
    }
})
