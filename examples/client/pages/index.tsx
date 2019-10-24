import React from 'react'

import myRPC from 'obvious-rpc/client'
type APIType = typeof import('../../server/api')
const { hello, stuff: { whatever } } : APIType = myRPC('http://localhost:2600/rpc')

type Await<T> = T extends {
    then(onfulfilled?: (value: infer U) => unknown): unknown;
} ? U : T;

export default class App extends React.Component<{
    data: Await<ReturnType<typeof hello>>
}> {
    static async getInitialProps({ req }) {
        return {
            data: await hello('ssr'),
        }
    }
    render() {
        return (
            <div>
                <pre>{JSON.stringify(this.props.data)}</pre>
                <button
                    onClick={async () => {
                        console.log(await hello('carl'))
                    }}
                >
                    click me
                </button>

                <button
                    onClick={async () => {
                        alert(await whatever())
                    }}
                >
                    click me
                </button>
            </div>
        )
    }
}
