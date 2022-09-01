import React from 'react'
import RPC from '../RPC'

export async function getServerSideProps(context) {
	return {
		props: {
			currentTime: await RPC.getCurrentTime(),
		},
	}
}

export default function App({ currentTime }) {
	const [time, setTime] = React.useState(currentTime)

	return (
		<div>
			Hello World {time}!
			<button
				onClick={async () => {
					setTime(await RPC.getCurrentTime())
				}}
			>
				Click Me
			</button>
		</div>
	)
}
