# Obvious RPC

Obvious RPC is a technique for strongly typed client-server communication that is so obvious you'll
wonder why it hasn't always been like this.

Your API simply consists of exported async methods in a file on your server. To call them from your
client, you simply import the functions and call them. It's just plain TypeScript, so you'll be able
to quickly navigate to the definition of a method on your server, refactor different endpoints, and
verify argument types, and use autocomplete on the results.

To expose a method on your **server**, open up `api.ts` and and define and export an async function

```ts
export async function welcomeUser(name: string) {
    return 'Hello, ' + name + '!'
}
```

To use a method from your **client**, you'll need to `obvious-rpc/client`, import the types from
`api.ts`, and configure your API server endpoint

```ts
import myRPC from 'obvious-rpc/client'
type APIType = typeof import('../../server/api')
const { welcomeUser }: APIType = myRPC('http://localhost:2600/rpc')

await welcomeUser('Molly') // Hello, Molly!
```

And that's it! You can now call functions as if they were regular functions in any library.

## Getting Started

For both your client and server projects, run `npm install obvious-rpc`

### Server

In your server project, create a new file `api.ts` (note that there is nothing special about this
filename, we're just using this name thoroughout the documentation).

```ts
export async function welcomeUser(name: string) {
    return 'Hello, ' + name + '!'
}
```

In your main server entry point, import `api.ts` and attach it to an HTTP server

```ts
import express, { Express } from 'express'

import obviousMiddleware from 'obvious-rpc/server'
import * as myAPI from './api'

const app: Express = express()

app.use('/rpc', express.json(), obviousMiddleware(myAPI))

app.listen(2600)
```

### Client

In any file where you want to access your API, add the following lines

```ts
import myRPC from 'obvious-rpc/client'
type APIType = typeof import('../../server/api')
const { welcomeUser }: APIType = myRPC('http://localhost:2600/rpc')

await welcomeUser('Molly') // Hello, Molly!
```

## How it works

The main trick behind Obvious RPC is to get TypeScript to believe that the `obvious-rpc/client`
package is instead a literal alias of your `api.ts` file. That way your editor sees the same types
and functions as your actual `api.ts` module.

However, the code that actually exists at `obvious-rpc/client` is a small piece of code that uses
ES6 proxies to dynamically intercept methods that are called from that module.

When `welcomeUser("Molly")` is called from the client, `obvious-rpc/client` intercepts the call and
transforms it into a JSON-RPC call over HTTP.

## Frequently Asked Questions

**_Q: What can this be used for?_**

A: You can use this for basically anything that involves either sending or retrieving information to
a server. If you're building a web application, you may find that you're able to build code faster
and ship with more confidence than using REST or GraphQL.

**_Q: Can I use this for server-server communication?_**

A: Yes. The `obvious-rpc/client` library uses `cross-fetch` so it runs fine in Node.JS and
Server Side Render environments.

**_Q: How can I authenticate requests?_**

The `obviousMiddleware` function has a second argument for an authentication middleware provider
where you can use something like PassportJS to authenticate requests.

```ts
app.use('/rpc', express.json(), rpcMiddleware(myAPI, passport.authenticate('local')))
```

If you want to allow unauthenticated users to call a particular method, you can do so by giving your
exported function a name that starts with `unauthenticated` (this is case insensitive, so you can
spongebob-case it if you truly desire to).

**_Q: Can I access session information?_**

A: Yes.

If you're using `express-session` or some other middleware that injects fields into the `req`
object, you can access it through the context which is bound to `this` within a function call.

With TypeScript, you can even strongly type access to the `this` object:

```ts
type Ctx = {
    req: Request
    res: Response
}

export async function welcomeUser(this: Ctx, name: string) {
    return 'Hello, ' + name + '!'
}
```

**_Q: How can I set cookies_**

A: Use `this.res.cookie('cookieName', 'cookieValue')`

**_Q: What's the catch?_**

A: The library uses ES6 Proxies, a feature supported by all browsers besides IE11 and earlier. This
includes Google Chrome, Firefox, Safari, and Microsoft Edge. If you're building something that needs
to support IE11, this library might not be right for you.
