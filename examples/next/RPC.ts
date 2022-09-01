import { makeRPC, RESTRPC } from './lib/client'
import { PASSTHROUGH, runMethod } from './lib/server'

export default makeRPC<typeof import('./backend/rpc')>(
    process.browser ? RESTRPC('/api') : PASSTHROUGH(require('./backend/rpc'))
)
