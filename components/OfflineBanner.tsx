import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface OfflineBannerProps {
	cachedAt: number | null;
	onRetry: () => void;
}

// Shown above a screen's list (not in place of it, unlike ErrorState) —
// this only ever appears when there IS data to show, just not fresh
// data. Same visual pattern as app/index.tsx's own "Some results may be
// missing." banner.
export function OfflineBanner({ cachedAt, onRetry }: OfflineBannerProps) {
	const formattedTime = cachedAt
		? new Date(cachedAt).toLocaleTimeString([], {
				hour: 'numeric',
				minute: '2-digit',
			})
		: null;

	return (
		<View className='flex-row items-center justify-between gap-[10px] rounded-lg border-4 border-bbRed dark:border-darkAccent bg-bbYellow dark:bg-darkSurface p-[10px]'>
			<Text className='flex-1 font-chewy text-bbRed dark:text-darkAccent'>
				You&apos;re offline — showing saved data
				{formattedTime ? ` from ${formattedTime}` : ''}.
			</Text>
			<Pressable onPress={onRetry} accessibilityRole='button'>
				<Text className='font-chewy text-bbRed dark:text-darkAccent underline'>
					Retry
				</Text>
			</Pressable>
		</View>
	);
}
