import { Ctx } from 'obvious-rpc/server'

export async function hello(name: string) {
    console.log('hello to', name)
    return [
        {
            message: 'hello ' + name,
            author: 'bob',
            to: name,
        },
    ]
}

export async function uNaUthEntIcaTeD_whatever(this: Ctx) {
    return this.req.headers
}

export const stuff = {
    async whatever() {
        return 42
    },
}
