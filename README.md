# Obvious RPC

Obvious RPC is a technique for fully strongly typed client-server communication that is so obvious you'll wonder why it hasn't always been like this. 

Your API simply consists of exported async methods in a file on your server. To call them from your client, you simply import the functions and call them. It's just plain TypeScript, so you'll be able to quickly navigate to the definition of a method on your server, refactor different endpoints, and verify argument types, and use autocomplete on the results. 

To expose a method on your **server**, open up `api.ts` and and define and export an async function

```ts
export async function welcomeUser(name: string){
    return "Hello, " + name + "!"
}
```

To use a method from your **client**, import your method from `obvious-rpc/client` and configure it with your server endpoint

```ts
import myRPC, { welcomeUser } from 'obvious-rpc/client'

myRPC.configure('http://localhost:2600/rpc')

await welcomeUser('Molly') // Hello, Molly!
```

## Getting Started

For both your client and server projects, run `npm install obvious-rpc`

### Server

In your server project, create a new file `api.ts` (note that there is nothing special about this filename, we're just using this name thoroughout the documentation).

```ts
export { default } from 'obvious-rpc/server'

export async function welcomeUser(name: string){
    return "Hello, " + name + "!"
}
```

In your main server entry point, import `api.ts` and attach it to an HTTP server

```ts
import express, { Express } from 'express'
import myRPC, * as RPCMethods from './api'

const app: Express = express()

app.use('/rpc', express.json(), myRPC.middleware(RPCMethods))

app.listen(2600)
```

### Client

In any file where you want to access your API, add the following lines

```ts
import myRPC, { welcomeUser } from 'obvious-rpc/client'

myRPC.configure('http://localhost:2600/rpc')

await welcomeUser('Molly') // Hello, Molly!
```

Add the following lines to your `tsconfig.json`, replacing "PATH-TO-SERVER" with the relative path from your `tsconfig.json` file to your `api.ts` file (omit the `.ts` extension). 

```json
"compilerOptions": {
    "baseUrl": ".",
    "paths": {
        "obvious-rpc/client": ["../PATH-TO-SERVER/api"]
    }
}
```


## How it works

The main trick behind Obvious RPC is to get TypeScript to believe that the `obvious-rpc/client` package is instead a literal alias of your `api.ts` file. That way your editor sees the same types and functions as your actual `api.ts` module. 

However, the code that actually exists at `obvious-rpc/client` is a small piece of code that uses ES6 proxies to dynamically intercept methods that are called from that module. 

When `welcomeUser("Molly")` is called from the client, `obvious-rpc/client` intercepts the call and transforms it into a JSON-RPC call over HTTP. 

## Frequently Asked Questions

***Q: What can this be used for?***

A: You can use this for basically anything that involves either sending or retrieving information to a server. If you're building a web application, you may find that you're able to build code faster and ship with more confidence than using REST or GraphQL. 

***Q: Can I use this for server-server communication?***

A: Yes. The `obvious-rpc/client` library uses `isomorphic-fetch` so it runs fine in Node.JS and Server Side Render environments. 

***Q: How can I authenticate requests?***

TODO: write about how you can configure it to reject all requests that lack proper `Authorization` headers except for methods which are prefixed with `UNAUTHENTICATED_`.

***Q: What's the catch?***

A: The library is currently configured as a singleton, so it could lead to conflicts if you try to configure it with different endpoints. 

***Q: What browsers are supported?***

A: The library uses ES6 Proxies, a feature supported by all browsers besides IE11 and earlier. 

***Q: How can I use it in a published library?***

A: Since the library is a singleton, publishing a module that uses `obvious-rpc` may lead to conflicts. To avoid this, replace `configure` with `scoped` before you publish code depending on `obvious-rpc`. You'll probably still want to use the singleton API when developing, as otherwise you won't be able to see type information within your editor.

```ts
import myRPC from 'obvious-rpc/client'

const { welcomeUser } = myRPC.scoped('https://whatever.com/rpc')

```


