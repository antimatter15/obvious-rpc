import { makeHandler } from '../../lib/server'
import * as methods from '../../backend/rpc'

export default makeHandler(methods)
