import { Router } from "express"
import { v4 } from "uuid"
import { Users } from "../pg/entity/users.entity"

export const UsersRouter = Router()

UsersRouter.get('/', async (req, res) => {
    const { page = 0, size = 10} = req.query

    const users = await Users.findAll({
        limit: Number(size),
        offset: Number(page) * Number(size)
    })

    res.json({ data: users })
})

UsersRouter.get('/:id', async (req, res) => {
    const { id } = req.params

    if(!id) {
        res.status(400).json({ error: 'Invalid Arguments' })
        return
    }

    const users = await Users.findById(id)

    res.json({ data: users })
})

UsersRouter.post('/', async (req, res) => {
    const { balance, username } = req.body

    if(!username) {
        res.status(400).json({ error: 'Invalid Arguments' })
        return
    }

    try {
        const users = await Users.create({
            id: v4(),
            balance: balance || 0,
            username,
        })
    
        res.status(201).end()
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

UsersRouter.put('/', async (req, res) => {
    const { balance, id } = req.body

    if(!balance || !id) {
        res.status(400).json({ error: 'Invalid Arguments' })
        return
    }

    try {
        await Users.update({
            where: {
                id
            }
        },{
            balance: balance || 0,
        })
    
        res.status(201).end()
    } catch (error) {
        console.log(error)
        
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

UsersRouter.delete('/:id', async (req, res) => {
    const { id } = req.params

    if(!id) {
        res.status(400).json({ error: 'Invalid Arguments' })
        return
    }

    await Users.deleteById(id)

    res.json({ data: id })
})