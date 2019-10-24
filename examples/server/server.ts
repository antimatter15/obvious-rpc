import express, { Express } from 'express'
import 'express-async-errors'
import cors from 'cors'

import * as RPCMethods from './api'
import myRPC from 'obvious-rpc/server'


const PORT = 2600
const app: Express = express()
app.use(cors())

app.use('/rpc', express.json(), myRPC(RPCMethods))

app.listen(PORT, () => {
    console.log(`Server started http://localhost:${PORT}/`)
})
