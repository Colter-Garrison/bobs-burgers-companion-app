import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';

// However fast (or slow) useTheme resolves, the splash stays up at least
// this long — so it always reads as an intentional splash screen rather
// than a flicker, even on a fast device/connection where isThemeReady
// resolves almost instantly.
export const MIN_DISPLAY_MS = 2000;

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
	const { isThemeReady } = useTheme();
	const [shouldRender, setShouldRender] = useState(true);
	const mountedAtRef = useRef(Date.now());

	useEffect(() => {
		if (!isThemeReady) {
			return;
		}
		const elapsed = Date.now() - mountedAtRef.current;
		const remaining = Math.max(MIN_DISPLAY_MS - elapsed, 0);
		const timer = setTimeout(() => setShouldRender(false), remaining);
		return () => clearTimeout(timer);
	}, [isThemeReady]);

	if (!shouldRender) {
		return null;
	}

	return (
		<View
			// A solid fill behind the Image, not just the image itself —
			// the image is an async network/asset load, so without this
			// the overlay is glass (fully see-through) for however long
			// that takes, defeating the entire point of covering the
			// screen. Matches app.json's own splash backgroundColor.
			style={[StyleSheet.absoluteFillObject, styles.container]}
			testID='splash-overlay'
		>
			<Image
				source={require('../assets/images/bobs-splash.png')}
				// react-native-web's Image, once the image finishes loading,
				// sizes its wrapper to the image's natural pixel dimensions
				// unless an explicit width/height is set — absoluteFillObject
				// alone only sets position/inset, so on web the overlay
				// would render correctly for an instant, then jump to the
				// image's raw 1242x2436 size anchored top-left the moment
				// it loaded. Explicit 100%/100% keeps it filling the screen
				// throughout.
				style={[StyleSheet.absoluteFillObject, styles.image]}
				resizeMode='cover'
				accessibilityIgnoresInvertColors
				// Purely decorative chrome, on screen for a couple seconds —
				// nothing here for a screen reader to announce.
				accessible={false}
				accessibilityElementsHidden
				importantForAccessibility='no-hide-descendants'
			/>
		</View>
	);
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
});
