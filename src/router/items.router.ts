import { Router } from "express"
import { v4 } from "uuid"
import { Items } from "../pg/entity/items.entity"

export const ItemsRouter = Router()

ItemsRouter.get('/', async (req, res) => {
    const { page = 0, size = 10} = req.query

    const items = await Items.findAll({
        limit: Number(size),
        offset: Number(page) * Number(size)
    })

    res.json({ data: items })
})

ItemsRouter.get('/:id', async (req, res) => {
    const { id } = req.params

    if(!id) {
        res.status(400).json({ error: 'Invalid Arguments' })
        return
    }

    const items = await Items.findById(id)

    res.json({ data: items })
})

ItemsRouter.post('/', async (req, res) => {
    const { 
        name,
        desc = 0,
        price = 0,
        count = 0
    } = req.body

    if(!name) {
        res.status(400).json({ error: 'Invalid Arguments' })
        return
    }

    try {
        await Items.create({
            id: v4(),
            name, desc, price, count
        })
    
        res.status(201).end()
    } catch (error) {
        console.log(error)
        
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

ItemsRouter.put('/', async (req, res) => {
    const {
        id,
        name,
        desc,
        price,
        count
    } = req.body

    if(!id) {
        res.status(400).json({ error: 'Invalid Arguments' })
        return
    }

    try {
        await Items.update({
            where: {
                id
            }
        },{
            name, desc, price, count
        })
    
        res.status(201).end()
    } catch (error) {
        console.log(error)
        
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

ItemsRouter.delete('/:id', async (req, res) => {
    const { id } = req.params

    if(!id) {
        res.status(400).json({ error: 'Invalid Arguments' })
        return
    }

    await Items.deleteById(id)

    res.json({ data: id })
})