require('isomorphic-fetch')

function JSONRPC(url){
    return async function(method, params){
        let res = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: method.join('.'),
                params: params,
            }),
        })
        let data = await res.json()
        if(data.error){
            throw new Error(data.error.message)
        }
        return data.result;
    }
}

function makeClient(url){
    let client = JSONRPC(url)
    function makeLayer(path){
        return new Proxy(function(){
            return client(path, Array.from(arguments))
        }, {
            get(obj, name){
                return makeLayer(path.concat([name]))
            }
        })
    }
    return makeLayer([])
}

module.exports = makeClient