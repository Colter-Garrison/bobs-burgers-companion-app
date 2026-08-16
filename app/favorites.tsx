import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
	Image,
	Linking,
	Pressable,
	ScrollView,
	Text,
	View,
} from 'react-native';
import { SearchItem, useSearchableItems } from '../hooks/useSearchableItems';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';
import { FavoriteButton } from '../components/FavoriteButton';

export default function Favorites() {
	const router = useRouter();
	const { token, loading: authLoading } = useAuth();
	const { items, loading: itemsLoading } = useSearchableItems();
	const {
		isFavorited,
		removeFavorite,
		loading: favoritesLoading,
	} = useFavorites();

	// Reachable by direct URL, not just the drawer link (which already
	// hides itself when logged out) — same guard as app/account.tsx,
	// deliberately depending on `authLoading` alone rather than `token`
	// (see the comment there for why: Drawer screens never unmount, so
	// this guard must only check "did we arrive here already logged
	// out," not react to every later token change, or it can race
	// Account's own post-logout navigation to /).
	useEffect(() => {
		if (!authLoading && !token) {
			router.push('/login');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [authLoading]);

	if (!token) {
		return null;
	}

	const handleResultPress = (item: SearchItem) => {
		if (item.linkUrl) {
			Linking.openURL(item.linkUrl);
		}
	};

	const favoritedItems = items.filter((item) =>
		isFavorited(item.favoriteCategory, item.itemId),
	);
	const loading = itemsLoading || favoritesLoading;

	return (
		<ScrollView className='flex-1 bg-bbGreen'>
			<View className='flex-col gap-[10px] p-[10px]'>
				{loading ? (
					<Text className='font-chewy text-bbRed'>Loading...</Text>
				) : favoritedItems.length > 0 ? (
					favoritedItems.map((item) => (
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
								favorited
								onToggle={() =>
									removeFavorite(item.favoriteCategory, item.itemId)
								}
							/>
						</View>
					))
				) : (
					<Text className='font-chewy text-bbRed'>No favorites yet.</Text>
				)}
			</View>
		</ScrollView>
	);
}
