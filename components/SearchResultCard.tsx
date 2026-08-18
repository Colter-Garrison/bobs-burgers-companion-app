import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { SearchItem } from '../hooks/useSearchableItems';
import { FavoriteButton } from './FavoriteButton';

interface SearchResultCardProps {
	item: SearchItem;
	favorited: boolean;
	onToggleFavorite: () => void;
	onPress: () => void;
}

// The card layout shared by Home's search results and the Favorites
// list — previously duplicated inline in both screens.
export function SearchResultCard({
	item,
	favorited,
	onToggleFavorite,
	onPress,
}: SearchResultCardProps) {
	return (
		<View className='flex-row items-start justify-between gap-[10px] rounded-lg border-4 border-bbRed dark:border-darkRed bg-bbYellow dark:bg-darkSurface p-[10px]'>
			<Pressable
				className='flex-1 flex-row items-center gap-[10px]'
				onPress={onPress}
			>
				{item.image ? (
					<Image
						source={{ width: 60, height: 60, uri: item.image }}
						width={60}
						height={60}
						resizeMode='contain'
					/>
				) : null}
				<View className='flex-1 flex-col'>
					<Text className='font-chewy text-[12px] text-bbRed dark:text-darkRed'>
						{item.category}
					</Text>
					<Text className='font-chewy text-[16px] text-bbRed dark:text-darkRed'>
						{item.label}
					</Text>
				</View>
			</Pressable>
			<FavoriteButton favorited={favorited} onToggle={onToggleFavorite} />
		</View>
	);
}
