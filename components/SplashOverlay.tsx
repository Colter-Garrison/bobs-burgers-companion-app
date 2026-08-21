import React, { useEffect, useRef, useState } from 'react'
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native'
import { useTheme } from '../hooks/useTheme'

// However fast (or slow) useTheme resolves, the splash stays up at least
// this long — so it always reads as an intentional splash screen rather
// than a flicker, even on a fast device/connection where isThemeReady
// resolves almost instantly.
export const MIN_DISPLAY_MS = 2000

// Web has no equivalent of a native splash screen at all (this app isn't
// distributed through an app store, so `expo-splash-screen`'s own splash
// image is something almost no one who uses this app will ever actually
// see) — and more importantly, without something covering the screen,
// the very first render happens before the async theme lookup in
// useTheme.tsx resolves, which was visibly wrong: light mode (and the
// drawer starting open) for a moment, then flipping to dark and closing,
// on any device with a saved dark preference. This sits on top of
// everything (the rest of the app mounts and starts fetching underneath
// it regardless, not blocked by this) using the app's own real splash
// image, until useTheme reports isThemeReady and MIN_DISPLAY_MS has
// elapsed, then disappears outright — no fade, so it can't have a
// partially-transparent moment where whatever's happening underneath
// (e.g. the drawer briefly opening/closing) shows through.
export function SplashOverlay() {
	const { isThemeReady } = useTheme()
	const [shouldRender, setShouldRender] = useState(true)
	const mountedAtRef = useRef(Date.now())
	// bobs-splash.png is a tall, portrait-shaped image (designed for a
	// phone screen) — 'cover' fills a portrait/near-square viewport
	// nicely, but on a wide landscape browser window it forces the image
	// to scale up by width, cropping away almost all of its height and
	// leaving little more than a random zoomed-in sliver on screen.
	// banner-image.png is the same art directed for a 1366x768 (16:9)
	// layout instead — the standard laptop/desktop aspect ratio, so
	// 'cover' only ever needs a small crop off the sides rather than the
	// extreme ratio mismatch the portrait image would hit at that shape.
	// (Also referenced directly, unrelated to this component, by the
	// README.)
	const { width, height } = useWindowDimensions()
	const isWideViewport = width > height

	useEffect(() => {
		if (!isThemeReady) {
			return
		}
		const elapsed = Date.now() - mountedAtRef.current
		const remaining = Math.max(MIN_DISPLAY_MS - elapsed, 0)
		const timer = setTimeout(() => setShouldRender(false), remaining)
		return () => clearTimeout(timer)
	}, [isThemeReady])

	if (!shouldRender) {
		return null
	}

	return (
		<View
			style={[StyleSheet.absoluteFillObject, styles.container]}
			testID='splash-overlay'
		>
			<Image
				source={
					isWideViewport
						? require('../assets/images/banner-image.png')
						: require('../assets/images/bobs-splash.png')
				}
				style={[StyleSheet.absoluteFillObject, styles.image]}
				resizeMode='cover'
				accessibilityIgnoresInvertColors
				accessible={false}
				accessibilityElementsHidden
				importantForAccessibility='no-hide-descendants'
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		zIndex: 1000,
		backgroundColor: '#8FCBEA',
	},
	image: {
		width: '100%',
		height: '100%',
	},
})
