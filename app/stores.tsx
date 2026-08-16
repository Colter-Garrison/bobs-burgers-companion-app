import React from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { Store, getStoresNextDoor } from '../hooks/fetchStoresNextDoor';
import { useCategoryData } from '../hooks/useCategoryData';
import { useFavorites } from '../hooks/useFavorites';
import { FavoriteButton } from '../components/FavoriteButton';
import { CategorySkeleton } from '../components/CategorySkeleton';
import { ErrorState } from '../components/ErrorState';

export default function Stores() {
	const { isFavorited, addFavorite, removeFavorite } = useFavorites();
	const {
		data: stores,
		loading,
		error,
		retry,
	} = useCategoryData<Store>(getStoresNextDoor);

	if (loading) {
		return <CategorySkeleton />;
	}

	if (error) {
		return <ErrorState message={error} onRetry={retry} />;
	}

	return (
		<ScrollView className='bg-bbGreen'>
			<View className='flex-col gap-2 p-2'>
				{stores.length > 0 ? (
					stores.map((store) => (
						<View
							key={store.id}
							className='flex-row items-center justify-between gap-2 rounded-lg border-4 border-bbRed bg-bbYellow p-2'
						>
							<View className='flex-1 flex-row items-center gap-2'>
								{store.image ? (
									<Image
										source={{ width: 100, height: 100, uri: store.image }}
										width={100}
										height={100}
										resizeMode='contain'
									/>
								) : null}
								<View className='max-w-[70%] flex-col'>
									<Text className='font-chewy text-base text-bbRed'>
										Name: {store.name}
									</Text>
									<Text className='font-chewy text-base text-bbRed'>
										Season: {store.season}
									</Text>
									<Text className='font-chewy text-base text-bbRed'>
										Episode: {store.episode}
									</Text>
								</View>
							</View>
							<FavoriteButton
								favorited={isFavorited('store', store.id)}
								onToggle={() =>
									isFavorited('store', store.id)
										? removeFavorite('store', store.id)
										: addFavorite('store', store.id)
								}
							/>
						</View>
					))
				) : (
					<View className='flex-1 flex-col items-center justify-center'>
						<Text className='font-chewy text-[44px]'>
							Store Next Door UH OH...
						</Text>
					</View>
				)}
			</View>
		</ScrollView>
	);
}
