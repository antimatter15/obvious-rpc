import { Req } from 'obvious-rpc/server'

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

export async function uNaUthEntIcaTeD_whatever() {
    return Req(this).headers
}

export const stuff = {
    async whatever() {
        return 42
    },
}
