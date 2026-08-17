import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { getBurgersOfTheDay } from '../../hooks/fetchBurgersOfTheDay';
import { useCategoryData } from '../../hooks/useCategoryData';
import { useFavorites } from '../../hooks/useFavorites';
import { FavoriteButton } from '../../components/FavoriteButton';
import { CategorySkeleton } from '../../components/CategorySkeleton';
import { ErrorState } from '../../components/ErrorState';

interface Burger {
	id: number;
	name: string;
	price: string;
	season: number;
	episode: number;
	episodeUrl: string;
	url: string;
}

export default function Burgers() {
	const { isFavorited, addFavorite, removeFavorite } = useFavorites();
	const {
		data: burgers,
		loading,
		error,
		retry,
	} = useCategoryData<Burger>(getBurgersOfTheDay);

	if (loading) {
		return <CategorySkeleton />;
	}

	if (error) {
		return <ErrorState message={error} onRetry={retry} />;
	}

	return (
		<ScrollView className='bg-bbGreen'>
			<View className='flex-col gap-2 p-2'>
				{burgers.length > 0 ? (
					burgers.map((burger) => (
						<View
							key={burger.id}
							className='flex-row items-start justify-between gap-2 rounded-lg border-4 border-bbRed bg-bbYellow p-2'
						>
							<View className='flex-1 flex-col'>
								<Text className='font-chewy text-base text-bbRed'>
									Name: {burger.name}
								</Text>
								<Text className='font-chewy text-base text-bbRed'>
									Price: {burger.price}
								</Text>
								<Text className='font-chewy text-base text-bbRed'>
									Season: {burger.season}
								</Text>
								<Text className='font-chewy text-base text-bbRed'>
									Episode: {burger.episode}
								</Text>
							</View>
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
