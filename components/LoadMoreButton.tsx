import React from 'react'
import { Pressable, Text } from 'react-native'

interface LoadMoreButtonProps {
	onPress: () => void
}

export function LoadMoreButton({ onPress }: LoadMoreButtonProps) {
	return (
		<Pressable
			onPress={onPress}
			accessibilityRole='button'
			accessibilityLabel='Load more'
			className='mt-2 items-center justify-center rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-2'
		>
			<Text className='font-chewy text-[16px] text-lightAccent dark:text-darkAccent'>
				Load More
			</Text>
		</Pressable>
	)
}
