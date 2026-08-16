import React, { useMemo, useState } from 'react';
import {
	Image,
	Linking,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from 'react-native';
import { SearchItem, useSearchableItems } from '../hooks/useSearchableItems';
import { useFavorites } from '../hooks/useFavorites';
import { FavoriteButton } from '../components/FavoriteButton';

export default function Index() {
	const { items, loading } = useSearchableItems();
	const { isFavorited, addFavorite, removeFavorite } = useFavorites();
	const [query, setQuery] = useState('');

	const filteredItems = useMemo(() => {
		const trimmed = query.trim().toLowerCase();
		if (!trimmed) return [];
		return items.filter((item) => item.label.toLowerCase().includes(trimmed));
	}, [items, query]);

	const handleResultPress = (item: SearchItem) => {
		if (item.linkUrl) {
			Linking.openURL(item.linkUrl);
		}
	};

	const isSearching = query.trim().length > 0;

	return (
		<ScrollView className='flex-1 bg-bbGreen'>
			<View className='flex-col gap-[10px] p-[10px]'>
				<TextInput
					placeholder='Search burgers, characters, episodes...'
					placeholderTextColor='#E8242F'
					value={query}
					onChangeText={setQuery}
					className='font-chewy rounded-lg border-4 border-bbRed bg-bbYellow p-2 text-[18px] text-bbRed'
				/>

				{isSearching &&
					(loading ? (
						<Text className='font-chewy text-bbRed'>Loading...</Text>
					) : filteredItems.length > 0 ? (
						filteredItems.map((item) => (
							<View
								key={item.id}
								className='flex-row items-center justify-between gap-[10px] rounded-lg border-4 border-bbRed bg-bbYellow p-[10px]'
							>
								<Pressable
									className='flex-1 flex-row items-center gap-[10px]'
									onPress={() => handleResultPress(item)}
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
										<Text className='font-chewy text-[12px] text-bbRed'>
											{item.category}
										</Text>
										<Text className='font-chewy text-[16px] text-bbRed'>
											{item.label}
										</Text>
									</View>
								</Pressable>
								<FavoriteButton
									favorited={isFavorited(item.favoriteCategory, item.itemId)}
									onToggle={() =>
										isFavorited(item.favoriteCategory, item.itemId)
											? removeFavorite(item.favoriteCategory, item.itemId)
											: addFavorite(item.favoriteCategory, item.itemId)
									}
								/>
							</View>
						))
					) : (
						<Text className='font-chewy text-bbRed'>No results found.</Text>
					))}
			</View>
		</ScrollView>
	);
}
