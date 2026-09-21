import React from 'react'
import { ErrorState } from 'bobs-burgers-components'

const retry = () => {}

// Full-screen error with a Retry button; the default message.
export const Default = () => (
	<div style={{ height: 220 }}>
		<ErrorState onRetry={retry} />
	</div>
)

// The message a category screen shows when a fetch fails and nothing is cached.
export const Offline = () => (
	<div style={{ height: 220 }}>
		<ErrorState
			message='You’re offline, and there’s no saved data yet.'
			onRetry={retry}
		/>
	</div>
)

// A fetch error message passed straight through.
export const RequestTimedOut = () => (
	<div style={{ height: 220 }}>
		<ErrorState message='Request timed out.' onRetry={retry} />
	</div>
)
