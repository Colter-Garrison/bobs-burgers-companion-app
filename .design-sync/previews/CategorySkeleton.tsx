import React from 'react'
import { CategorySkeleton } from 'bobs-burgers-components'

// Full-screen loading state: pulsing placeholder cards on the page background.
export const FullScreen = () => (
	<div style={{ height: 420 }}>
		<CategorySkeleton />
	</div>
)

// Inline: just the cards, for a section that's still loading. It has no
// background of its own, so it's shown on the page's sky blue as in the app.
export const Inline = () => (
	<div style={{ background: '#8FCBEA', padding: 8 }}>
		<CategorySkeleton count={2} fullScreen={false} />
	</div>
)
