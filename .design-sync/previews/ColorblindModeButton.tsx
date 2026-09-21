import React, { useEffect, useRef } from 'react'
import { ColorblindModeButton } from 'bobs-burgers-components'

// Eye icon (outlined while colorblind mode is off).
export const Default = () => <ColorblindModeButton />

// The mode picker it opens: Off plus three palettes. Opened the way a user
// does - clicking the icon - then the programmatic focus is dropped so no
// keyboard focus ring shows.
export const MenuOpen = () => {
	const ref = useRef<HTMLDivElement>(null)
	useEffect(() => {
		ref.current
			?.querySelector<HTMLElement>('[aria-label^="Colorblind mode"]')
			?.click()
		const id = setTimeout(() => {
			;(document.activeElement as HTMLElement | null)?.blur()
		}, 0)
		return () => clearTimeout(id)
	}, [])
	return (
		<div ref={ref}>
			<ColorblindModeButton />
		</div>
	)
}
