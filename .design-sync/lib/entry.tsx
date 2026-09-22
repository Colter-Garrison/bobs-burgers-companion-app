// Library entry for the Claude Design sync: the app's real components,
// exported as a package. Built by .design-sync/build-lib.mjs.
import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ThemeProvider } from '../../hooks/useTheme'

export { CategoryFilterPills } from '../../components/CategoryFilterPills'
export { CategorySkeleton } from '../../components/CategorySkeleton'
export { CharacterOfTheDayCard } from '../../components/CharacterOfTheDayCard'
export { ColorblindModeButton } from '../../components/ColorblindModeButton'
export { DetailLayout } from '../../components/DetailLayout'
export { DrawerContent } from '../../components/DrawerContent'
export { DrawerLink } from '../../components/DrawerLink'
export { ErrorState } from '../../components/ErrorState'
export { FavoriteButton } from '../../components/FavoriteButton'
export { FilterPanel } from '../../components/FilterPanel'
export { LoadMoreButton } from '../../components/LoadMoreButton'
export { OfflineBanner } from '../../components/OfflineBanner'
export { SearchResultCard } from '../../components/SearchResultCard'
export { SplashOverlay } from '../../components/SplashOverlay'
export { ThemeToggleButton } from '../../components/ThemeToggleButton'
export { ThemeProvider }

const ZERO_INSETS = {
	frame: { x: 0, y: 0, width: 0, height: 0 },
	insets: { top: 0, left: 0, right: 0, bottom: 0 },
}

/**
 * Root wrapper every screen needs: the app's ThemeProvider (light/dark and
 * colorblind palettes, which set the color tokens) plus safe-area insets.
 * Without it, components that read the theme throw.
 */
export function BobsBurgersProvider({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<SafeAreaProvider initialMetrics={ZERO_INSETS}>
			<ThemeProvider>{children}</ThemeProvider>
		</SafeAreaProvider>
	)
}
