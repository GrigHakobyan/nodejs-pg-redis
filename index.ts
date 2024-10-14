import express from 'express'
import env from 'dotenv'

env.config()

import { pgClient } from "./src/pg"
import { PurchasesRouter } from './src/router/purchases.router'
import { UsersRouter } from './src/router/users.router'
import { ItemsRouter } from './src/router/items.router'
import { rsClient } from './src/redis'

const app = express()
app.use(express.json())
app.use('/purchases', PurchasesRouter)
app.use('/users', UsersRouter)
app.use('/items', ItemsRouter)

app.get('/skin-port', async (req, res) => {

    const skinPort = await rsClient.get('skin-port')


    if(skinPort) {
        res.json({ data: JSON.parse(skinPort), cached: true })
        return
    }

    const cached = []

    const data_0 = await (await fetch('https://api.skinport.com/v1/items?app_id=730&currency=EUR&tradable=0', {
        method: 'GET',
    })).json()

    const data_1 = await (await fetch('https://api.skinport.com/v1/items?app_id=730&currency=EUR&tradable=1', {
        method: 'GET',
    })).json()

    cached.push(...data_0, ...data_1)

    await rsClient.set('skin-port', JSON.stringify(cached))

    res.json({ data: cached })
})


app.listen(3000, async () => {
    console.log('Init PostgreSQL Connection')
    
    pgClient.connect((e) => e && console.log(e))

    console.log('Init Redis Connection')

    rsClient.on('error', (e) => console.log(e))

    await rsClient.connect()

    console.log('Server starts')
})
