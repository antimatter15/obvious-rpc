require('isomorphic-fetch')

const config = {
    url: 'http://localhost:1000/rpc'
}

const defaultObject = {
    configure(options){
        if(typeof options === 'string'){
            config.url = options;
        }
    },
    middleware(){
        throw new Error('middleware is only available on server')
    }
}

module.exports = new Proxy(
    {},
    {
        get(obj, name) {
            if(name === '__esModule') return true;
            if(name === 'default') return defaultObject;
            return async function() {
                let res = await fetch(config.url, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        method: name,
                        params: Array.from(arguments),
                    }),
                })
                let data = await res.json()
                if(data.error){
                    throw new Error(data.error.message)
                }
                return data.result;
            }
        },
    }
)
