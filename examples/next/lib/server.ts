export function PASSTHROUGH(methods) {
    return (method, params) => runMethod(methods, {}, method, params)
}

export function runMethod(methods, ctx, method, params) {
    let ptr = methods
    for (let key of method) {
        if (!Object.hasOwn(ptr, key)) throw new Error(`Not found: ${method.join('.')}`)
        ptr = ptr[key]
    }
    if (typeof ptr !== 'function') throw new Error(`Not a function: ${method.join('.')}`)

    return ptr.apply(ctx, params)
}

export function makeHandler(methods) {
    return function (req, res) {
        const path = req.query.path.join('/')
        let method, args
        if (req.method === 'POST') {
            method = path.split('.')
            args = JSON.parse(req.body)
        } else if (req.method === 'GET') {
            method = path.slice(0, path.indexOf('(')).split('.')
            args = JSON.parse(
                '[' + path.slice(path.indexOf('(')).replace(/'/g, '"').slice(1, -1) + ']'
            )
        } else {
            return res.status(405).send('Method Not Allowed')
        }
        if (JSON.stringify(args).length < 1000) {
            res.setHeader('X-RPC', method.join('.') + '(' + JSON.stringify(args).slice(1, -1) + ')')
        }
        runMethod(methods, { req: req, res: res }, method, args).then(
            data => {
                res.status(200).json(data)
            },
            err => {
                res.status(500).send(err.toString())
            }
        )
    }
}
