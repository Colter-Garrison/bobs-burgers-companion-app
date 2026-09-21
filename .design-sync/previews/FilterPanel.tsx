import React, { useEffect, useRef } from 'react'
import { FilterPanel } from 'bobs-burgers-components'

const noop = () => {}

// FilterPanel keeps its open/closed state internally and starts closed.
// Open it the way a user does: click its own "Filter By" toggle once mounted.
// The panel then moves focus into itself (an a11y feature); with no real
// pointer behind the click the browser treats that as keyboard focus and
// draws the focus ring, which a mouse user never sees - so drop the focus.
function Opened({ children }: { children: React.ReactNode }) {
	const ref = useRef<HTMLDivElement>(null)
	useEffect(() => {
		ref.current
			?.querySelector<HTMLElement>('[aria-label="Show filter options"]')
			?.click()
		const id = setTimeout(() => {
			const active = document.activeElement as HTMLElement | null
			if (active && ref.current?.contains(active)) active.blur()
		}, 0)
		return () => clearTimeout(id)
	}, [])
	return <div ref={ref}>{children}</div>
}

// Closed: just the "Filter By" pill.
export const Closed = () => (
	<FilterPanel
		genders={new Set()}
		hairColors={new Set()}
		sortDirection={null}
		onToggleGender={noop}
		onToggleHair={noop}
		onToggleSort={noop}
		activeCount={0}
	/>
)

// Home/Favorites: category pills plus sort, with one category selected.
export const WithCategories = () => (
	<Opened>
		<FilterPanel
			categoryFilter='Episodes'
			onSelectCategory={noop}
			genders={new Set()}
			hairColors={new Set()}
			sortDirection='asc'
			onToggleGender={noop}
			onToggleHair={noop}
			onToggleSort={noop}
			activeCount={1}
		/>
	</Opened>
)

// Characters: gender and hair color filters, with some selected.
export const CharacterFilters = () => (
	<Opened>
		<FilterPanel
			showGenderHairFilters
			genders={new Set(['Female'] as const)}
			hairColors={new Set(['Blonde', 'Red'] as const)}
			sortDirection='desc'
			onToggleGender={noop}
			onToggleHair={noop}
			onToggleSort={noop}
			activeCount={4}
		/>
	</Opened>
)
