import React from 'react'
import { Pressable, Text, View } from 'react-native'

interface OfflineBannerProps {
	cachedAt: number | null
	onRetry: () => void
}

export function OfflineBanner({ cachedAt, onRetry }: OfflineBannerProps) {
	const formattedTime = cachedAt
		? new Date(cachedAt).toLocaleTimeString([], {
				hour: 'numeric',
				minute: '2-digit',
			})
		: null

	return (
		<View className='flex-row items-center justify-between gap-[10px] rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-[10px]'>
			<Text
				accessibilityLiveRegion='polite'
				className='flex-1 font-chewy text-lightAccent dark:text-darkAccent'
			>
				You&apos;re offline — showing saved data
				{formattedTime ? ` from ${formattedTime}` : ''}.
			</Text>
			<Pressable
				onPress={onRetry}
				hitSlop={12}
				accessibilityRole='button'
				accessibilityLabel='Retry loading'
			>
				<Text className='font-chewy text-lightAccent dark:text-darkAccent underline'>
					Retry
				</Text>
			</Pressable>
		</View>
	)
}
