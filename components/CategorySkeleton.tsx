import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface CategorySkeletonProps {
	count?: number;
	fullScreen?: boolean;
}

function getCardStyle(colors: { accent: string; surface: string }) {
	return {
		height: 88,
		borderRadius: 8,
		borderWidth: 4,
		borderColor: colors.accent,
		backgroundColor: colors.surface,
	};
}

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
