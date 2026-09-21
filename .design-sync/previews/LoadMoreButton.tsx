import React from 'react'
import { LoadMoreButton, SearchResultCard } from 'bobs-burgers-components'

const noop = () => {}

// Full-width button at the end of a paged list (keyboard-reachable
// alternative to scrolling for the next 20 results).
export const Default = () => <LoadMoreButton onPress={noop} />

// In context: below the last loaded result.
export const BelowResults = () => (
	<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
		<SearchResultCard
			item={{
				id: 'episode-1',
				category: 'Episodes',
				label: '"Human Flesh"',
				itemId: 1,
				favoriteCategory: 'episode',
			}}
			favorited={false}
			onToggleFavorite={noop}
			onPress={noop}
		/>
		<LoadMoreButton onPress={noop} />
	</div>
)
