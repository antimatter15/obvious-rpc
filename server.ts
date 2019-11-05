import { Request, Response } from 'express'
import bodyParser from 'body-parser'

// export type Ctx = {
//     req: Request
//     res: Response
// }

export function Req(ctx: any): Request {
    return ctx._req
}

export function Res(ctx: any): Response {
    return ctx._res
}

// type Middleware = (req, res, next) => void
// const noopMiddleware: Middleware = (req, res, next) => next()

export default function(rpcMethods: any) {
    return [
        bodyParser.json({
            type: ['text/plain', 'application/json'],
        }),
        async (req, res) => {
            let params = req.body
            // if (typeof params === 'string') params = JSON.parse(params)

            console.log(params)

            if (req.method !== 'POST') return res.status(405).end('Must be POST')
            let method = req.path.slice(1).split('.')
            let fname = method[method.length - 1]

            console.log(method)
            if (!/^[a-z]/i.test(fname))
                return res.status(404).end('Method name must start with letter')

            let fn = rpcMethods
            for (let part of method) {
                if (!fn.hasOwnProperty(part)) return res.status(404).end('Method not found')
                fn = fn[part]
            }

            if (typeof fn !== 'function') return res.status(404).end('Method not found')

            let promise = fn.apply({ _req: req, _res: res }, params)
            if (!promise.then) return res.status(500).end('Method did not return a promise')
            let result = await promise
            res.status(200).json(result)

            // const error = (code: number, message: string) =>
            //     res.json({
            //         jsonrpc: '2.0',
            //         id: body.id || null,
            //         error: {
            //             code: code,
            //             message: message,
            //         },
            //     })

            // if (req.method !== 'POST') return error(405, 'must be POST')
            // if (!req.body)
            //     return error(
            //         400,
            //         'missing request body.\n' + 'have you forgotten to include app.use(express.json())?'
            //     )

            // let method = body['method'].split('.'),
            //     params = body['params']

            // if (body['jsonrpc'] !== '2.0') return error(-32600, 'Invalid Request')
            // if (!Array.isArray(params)) return error(-32602, 'Invalid params')
            // if (!/^[a-z]/i.test(method[method.length - 1]))
            //     return error(-32601, 'Method name must start with letter')

            // let middleware =
            //     authMiddleware && !/^unauthenticated/i.test(method[method.length - 1])
            //         ? authMiddleware
            //         : noopMiddleware

            // middleware(req, res, async () => {
            //     let fn = rpcMethods
            //     for (let part of method) {
            //         if (!fn.hasOwnProperty(part)) return error(-32601, 'Method not found')
            //         fn = fn[part]
            //     }

            //     if (typeof fn !== 'function') return error(-32601, 'Method not found')
            //     try {
            //         let promise = fn.apply({ req, res }, params)
            //         if (!promise.then) {
            //             return error(500, 'Method did not return a promise')
            //         }
            //         let result = await promise
            //         res.status(200).json({
            //             jsonrpc: '2.0',
            //             id: body.id,
            //             result: result,
            //         })
            //     } catch (err) {
            //         return error(500, err.toString())
            //     }
            // })
        },
    ]
}
