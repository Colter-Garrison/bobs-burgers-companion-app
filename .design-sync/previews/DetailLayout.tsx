import React from 'react'
import { DetailLayout } from 'bobs-burgers-components'

const noop = () => {}

const dottie = {
	name: '"Dottie Minerva"',
	image: 'https://bobsburgers-api.herokuapp.com/images/characters/1.jpg',
	bio: '"Dottie Minerva" is a Student at Wagstaff School. She first appeared in "The Kids Run the Restaurant" and is voiced by Wendy Molyneux. Her hair is blonde.',
	fandomUrl: 'https://bobs-burgers.fandom.com/wiki/Dottie_Minerva',
}

// A detail page: image, name, long bio and the Fandom link.
export const Loaded = () => (
	<div style={{ height: 520 }}>
		<DetailLayout
			loading={false}
			error={null}
			cachedAt={null}
			onRetry={noop}
			{...dottie}
		/>
	</div>
)

// Offline: the same page from the saved copy, with the offline banner.
export const FromSavedCopy = () => (
	<div style={{ height: 580 }}>
		<DetailLayout
			loading={false}
			error={null}
			cachedAt={Date.UTC(2026, 8, 21, 17, 45)}
			onRetry={noop}
			{...dottie}
		/>
	</div>
)

// Loading renders the skeleton; an error renders ErrorState with Retry.
export const Loading = () => (
	<div style={{ height: 300 }}>
		<DetailLayout
			loading
			error={null}
			cachedAt={null}
			onRetry={noop}
			name=''
			bio=''
		/>
	</div>
)

export const Error = () => (
	<div style={{ height: 220 }}>
		<DetailLayout
			loading={false}
			error='Request timed out.'
			cachedAt={null}
			onRetry={noop}
			name=''
			bio=''
		/>
	</div>
)
