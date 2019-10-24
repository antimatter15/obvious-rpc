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
import myRPC from 'obvious-rpc/client'
type APIType = typeof import('../../server/api')
const { welcomeUser } : APIType = myRPC('http://localhost:2600/rpc')

await welcomeUser('Molly') // Hello, Molly!
```

## Getting Started

For both your client and server projects, run `npm install obvious-rpc`

### Server

In your server project, create a new file `api.ts` (note that there is nothing special about this filename, we're just using this name thoroughout the documentation).

```ts
export async function welcomeUser(name: string){
    return "Hello, " + name + "!"
}
```

In your main server entry point, import `api.ts` and attach it to an HTTP server

```ts
import express, { Express } from 'express'

import middleware from 'obvious-rpc/server'
import * as myAPI from './api'

const app: Express = express()

app.use('/rpc', express.json(), middleware(myAPI))

app.listen(2600)
```

### Client

In any file where you want to access your API, add the following lines

```ts
import myRPC from 'obvious-rpc/client'
type APIType = typeof import('../../server/api')
const { welcomeUser } : APIType = myRPC('http://localhost:2600/rpc')

await welcomeUser('Molly') // Hello, Molly!
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

A: The library uses ES6 Proxies, a feature supported by all browsers besides IE11 and earlier. This includes Google Chrome, Firefox, Safari, and Microsoft Edge. If you're building something that needs to support IE11, this library might not be right for you. 

