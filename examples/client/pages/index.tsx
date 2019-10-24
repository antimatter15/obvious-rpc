import React from 'react'

import myRPC from 'obvious-rpc/client'
type APIType = typeof import('../../server/api')
const { hello } : APIType = myRPC('http://localhost:2600/rpc')


export default class App extends React.Component<{
    data: any
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
            </div>
        )
    }
}
