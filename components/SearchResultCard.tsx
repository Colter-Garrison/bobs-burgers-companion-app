import React from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import { SearchItem } from '../hooks/useSearchableItems'
import { FavoriteButton } from './FavoriteButton'

interface SearchResultCardProps {
	item: SearchItem
	favorited: boolean
	onToggleFavorite: () => void
	onPress: () => void
}

export function SearchResultCard({
	item,
	favorited,
	onToggleFavorite,
	onPress,
}: SearchResultCardProps) {
	return (
		<View className='flex-row items-start justify-between gap-[10px] rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-[10px]'>
			<Pressable
				className='flex-1 flex-row items-center gap-[10px]'
				onPress={onPress}
				accessibilityRole='button'
				accessibilityLabel={`View details for ${item.label}`}
			>
				{item.image ? (
					<Image
						source={{ width: 60, height: 60, uri: item.image }}
						width={60}
						height={60}
						resizeMode='contain'
						accessibilityIgnoresInvertColors
						accessible={false}
						accessibilityElementsHidden
						importantForAccessibility='no-hide-descendants'
					/>
				) : null}
				<View className='flex-1 flex-col'>
					<Text className='font-chewy text-[12px] text-lightAccent dark:text-darkAccent'>
						{item.category}
					</Text>
					<Text
						accessibilityRole='header'
						className='font-chewy text-[16px] text-lightAccent dark:text-darkAccent'
					>
						{item.label}
					</Text>
				</View>
			</Pressable>
			<FavoriteButton
				itemName={item.label}
				favorited={favorited}
				onToggle={onToggleFavorite}
			/>
		</View>
	)
}
