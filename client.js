// import 'isomorphic-fetch'
require('isomorphic-fetch')

function makeClient(url){
    return new Proxy(
        {},
        {
            get(obj, name) {
                return async function() {
                    let res = await fetch(url, {
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
}

module.exports = makeClient
makeClient['default'] = makeClient