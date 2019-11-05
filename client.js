require('isomorphic-fetch')

function JSONPOST(url) {
    return async function(method, params) {
        let res = await fetch(url + '/' + method.join('.'), {
            method: 'POST',
            mode: 'cors',
            headers: {
                // Sending Content-Type: application/json
                // Triggers a CORS preflight request
                // which can increase application latency
                // and also hurts the developer experience
                // so we instead just send it as text/plain
                // even though it's kind of a lie.
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(params),
        })
        if (res.status !== 200) {
            throw new Error(await res.text())
        }
        let data = await res.json()
        return data
    }
}

function makeClient(url) {
    let client = JSONPOST(url)
    function makeLayer(path) {
        return new Proxy(
            function() {
                return client(path, Array.from(arguments))
            },
            {
                get(obj, name) {
                    return makeLayer(path.concat([name]))
                },
            }
        )
    }
    return makeLayer([])
}

module.exports = makeClient
