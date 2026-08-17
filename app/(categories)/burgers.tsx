import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Burger, getBurgersOfTheDay } from '../../hooks/fetchBurgersOfTheDay';
import { useCategoryData } from '../../hooks/useCategoryData';
import { useFavorites } from '../../hooks/useFavorites';
import { composeBurgerShortBio } from '../../lib/categoryBio';
import { FavoriteButton } from '../../components/FavoriteButton';
import { CategorySkeleton } from '../../components/CategorySkeleton';
import { ErrorState } from '../../components/ErrorState';
import { OfflineBanner } from '../../components/OfflineBanner';

export default function Burgers() {
	const router = useRouter();
	const { isFavorited, addFavorite, removeFavorite } = useFavorites();
	const {
		data: burgers,
		loading,
		error,
		retry,
		cachedAt,
	} = useCategoryData<Burger>(getBurgersOfTheDay, 'burgers');

	const handlePress = (burger: Burger) => {
		router.push({
			pathname: '/detail/[category]/[id]',
			params: { category: 'burgers', id: String(burger.id) },
		});
	};

	if (loading) {
		return <CategorySkeleton />;
	}

	if (error) {
		return <ErrorState message={error} onRetry={retry} />;
	}

	return (
		<ScrollView className='bg-bbGreen'>
			<View className='flex-col gap-2 p-2'>
				{cachedAt ? (
					<OfflineBanner cachedAt={cachedAt} onRetry={retry} />
				) : null}
				{burgers.length > 0 ? (
					burgers.map((burger) => (
						<View
							key={burger.id}
							className='flex-row items-start justify-between gap-2 rounded-lg border-4 border-bbRed bg-bbYellow p-2'
						>
							<Pressable
								className='flex-1 flex-col'
								onPress={() => handlePress(burger)}
							>
								<Text
									testID='card-title'
									className='font-chewy text-base text-bbRed'
								>
									{burger.name}
								</Text>
								<Text className='font-chewy text-base text-bbRed'>
									{composeBurgerShortBio(burger)}
								</Text>
							</Pressable>
							<FavoriteButton
								favorited={isFavorited('burger', burger.id)}
								onToggle={() =>
									isFavorited('burger', burger.id)
										? removeFavorite('burger', burger.id)
										: addFavorite('burger', burger.id)
								}
							/>
						</View>
					))
				) : (
					<View className='flex-1 flex-col items-center justify-center'>
						<Text className='font-chewy text-[44px]'>
							Burger of the Day UH OH...
						</Text>
					</View>
				)}
			</View>
		</ScrollView>
	);
}
