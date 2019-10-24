export default function(rpcMethods){
    return (req, res) => {
        let body = req.body || {};
        const error = (code: number, message: string) => res.json({
            jsonrpc: '2.0',
            id: body.id || null,
            error: {
                code: code,
                message: message
            }
        })

        if(req.method !== 'POST') return error(-32000, 'must be POST');
        if(!req.body) return error(-32000, 'missing request body.\n' + 
            'have you forgotten to include app.use(express.json())?');
        
        let method = body['method'],
            params = body['params'];
        if(body['jsonrpc'] !== '2.0')
            return error(-32600, 'Invalid Request')
        if(!Array.isArray(params))
            return error(-32602, 'Invalid params');
        if(!rpcMethods.hasOwnProperty(method) || 
            typeof rpcMethods[method] !== 'function')
            return error(-32601, 'Method not found');
        let promise;
        try {
            promise = Promise.resolve(rpcMethods[method](...params))
        } catch (err) {
            return error(-32000, err.toString())
        }
        promise.then(result => {
            res.status(200).json({
                jsonrpc: '2.0',
                id: body.id,
                result: result
            })
        }, err => error(-32000, err.toString()))
    }
}
