import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface CategorySkeletonProps {
	count?: number;
	// The six category screens render this as their entire screen, so it
	// owns the full-screen flex/background/padding. Home nests it inline
	// among its own search results instead, where that wrapper would
	// double up on padding and fight the surrounding ScrollView's layout.
	fullScreen?: boolean;
}

// NativeWind's className doesn't apply to Animated.View — the pulsing
// boxes below rendered with zero height and no border/background (only
// the raw style={{opacity}} prop ever took effect) until this moved to a
// plain style object instead of className. Since it's a plain object
// (not a className), the colors have to be picked explicitly too, same
// reasoning as app/_layout.tsx's screenOptions — `colors` is already
// resolved for the current isDark + colorblindMode combination.
function getCardStyle(colors: { accent: string; surface: string }) {
	return {
		height: 88,
		borderRadius: 8,
		borderWidth: 4,
		borderColor: colors.accent,
		backgroundColor: colors.surface,
	};
}

// Shown in place of a category screen's list while its data is loading —
// placeholder card outlines in the same shape/palette as the real cards,
// with a gentle pulse so it reads as "loading" rather than a rendering bug.
export function CategorySkeleton({
	count = 4,
	fullScreen = true,
}: CategorySkeletonProps) {
	const opacity = useRef(new Animated.Value(0.4)).current;
	const { colors } = useTheme();
	const cardStyle = getCardStyle(colors);

	useEffect(() => {
		const pulse = Animated.loop(
			Animated.sequence([
				Animated.timing(opacity, {
					toValue: 1,
					duration: 700,
					useNativeDriver: true,
				}),
				Animated.timing(opacity, {
					toValue: 0.4,
					duration: 700,
					useNativeDriver: true,
				}),
			]),
		);
		pulse.start();
		return () => pulse.stop();
	}, [opacity]);

	return (
		<View
			className={
				fullScreen
					? 'flex-1 flex-col gap-2 bg-lightBg dark:bg-darkBg p-2'
					: 'flex-col gap-2'
			}
			testID='category-skeleton'
			accessibilityLabel='Loading'
		>
			{Array.from({ length: count }).map((_, index) => (
				<Animated.View key={index} style={{ ...cardStyle, opacity }} />
			))}
		</View>
	);
}
