import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	Image,
	Linking,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SearchItem, useSearchableItems } from '../hooks/useSearchableItems';
import { useFavorites } from '../hooks/useFavorites';
import { FavoriteButton } from '../components/FavoriteButton';
import { CategorySkeleton } from '../components/CategorySkeleton';

export default function Index() {
	const { items, loading, error, retry } = useSearchableItems();
	const { isFavorited, addFavorite, removeFavorite } = useFavorites();
	const [query, setQuery] = useState('');

	// Same reasoning as login.tsx/signup.tsx: Home is a Drawer.Screen that
	// stays mounted when you navigate away, so a typed-in query would
	// otherwise still be sitting here — filtered results and all — the
	// next time you land back on Home.
	useFocusEffect(
		useCallback(() => {
			return () => {
				setQuery('');
			};
		}, []),
	);

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

	// The background fetch on mount (below the surface, inside
	// useSearchableItems) is usually fast enough that it's already done
	// by the time a user actually gets around to typing — meaning
	// `loading` would rarely be true and the skeleton would rarely have
	// anything to show for. Re-fetching on the first keystroke of each
	// search gives the skeleton real work to reflect instead, without
	// faking a delay that isn't there.
	const hasRefetchedForThisSearchRef = useRef(false);
	useEffect(() => {
		if (isSearching && !hasRefetchedForThisSearchRef.current) {
			hasRefetchedForThisSearchRef.current = true;
			retry();
		} else if (!isSearching) {
			hasRefetchedForThisSearchRef.current = false;
		}
	}, [isSearching, retry]);

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
						<CategorySkeleton count={3} fullScreen={false} />
					) : (
						<>
							{error ? (
								// Some categories failed to load, but the ones that
								// succeeded are still shown below — this banner
								// doesn't replace the results the way a category
								// screen's full ErrorState does.
								<View className='flex-row items-center justify-between gap-[10px] rounded-lg border-4 border-bbRed bg-bbYellow p-[10px]'>
									<Text className='flex-1 font-chewy text-bbRed'>{error}</Text>
									<Pressable onPress={retry} accessibilityRole='button'>
										<Text className='font-chewy text-bbRed underline'>
											Retry
										</Text>
									</Pressable>
								</View>
							) : null}
							{filteredItems.length > 0 ? (
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
											favorited={isFavorited(
												item.favoriteCategory,
												item.itemId,
											)}
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
							)}
						</>
					))}
			</View>
		</ScrollView>
	);
}
