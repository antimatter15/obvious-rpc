function makeProxyLayer(path, client) {
    return new Proxy(
        function () {
            return client(path, Array.from(arguments))
        },
        {
            get(obj, name) {
                return makeProxyLayer(path.concat([name]), client)
            },
        }
    )
}

// This is a request encoding which is optimized for developer experience
// If a method name starts with `get` and its parameters are under 1KB
// it encodes the request in the form of `methodName(arg1,arg2)` in
// URIEncoded JSON with double quotes swapped out for single quotes.
// This allows at-a-glance inspection of calls through the web inspector
// network tab, and also it allows you to easily open most getters
// on its own page (since it's using GET rather than POST). Any method
// which has a large parameter body, or doesn't have a name that starts
// with `get` is sent as a POST request (in accordance to REST principles)

export function RESTRPC(url) {
    return async function (path, params) {
        const method = path.join('.')
        const encodedParams = encodeURI(
            '(' +
                JSON.stringify(params)
                    .replace(/"|'/g, k => (k === '"' ? "'" : '\\x27'))
                    .slice(1, -1) +
                ')'
        )
            .replace(/%5B/g, '[')
            .replace(/%5D/g, ']')
            .replace(/\?/g, '%3F')
            .replace(/\#/g, '%23')
            .replace(/\//g, '%2F')

        const res =
            path[path.length - 1].startsWith('get') && encodedParams.length < 1000
                ? await fetch(url + '/' + method + encodedParams, {})
                : await fetch(url + '/' + method, {
                      method: 'POST',
                      body: JSON.stringify(params),
                      headers: {
                          'Content-Type': 'text/plain',
                      },
                  })
        if (res.status !== 200) throw new Error(await res.text())
        return await res.json()
    }
}

export function makeRPC<T>(client): T {
    return makeProxyLayer([], client)
}
