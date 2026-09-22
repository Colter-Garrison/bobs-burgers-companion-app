import React from 'react'
import { OfflineBanner } from 'bobs-burgers-components'

const noop = () => {}

// Shown above a list when the data came from the offline cache; cachedAt
// is when that copy was saved (rendered as a local time).
export const WithSavedTime = () => (
	<OfflineBanner cachedAt={Date.UTC(2026, 8, 21, 17, 45)} onRetry={noop} />
)

// cachedAt null: no time known, so the sentence ends early.
export const WithoutTime = () => (
	<OfflineBanner cachedAt={null} onRetry={noop} />
)
