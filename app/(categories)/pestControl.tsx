import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
	Truck,
	getPestControlTrucks,
} from '../../hooks/fetchPestControlTrucks';
import { useCategoryData } from '../../hooks/useCategoryData';
import { useFavorites } from '../../hooks/useFavorites';
import { composeTruckShortBio } from '../../lib/categoryBio';
import { FavoriteButton } from '../../components/FavoriteButton';
import { CategorySkeleton } from '../../components/CategorySkeleton';
import { ErrorState } from '../../components/ErrorState';
import { OfflineBanner } from '../../components/OfflineBanner';

export default function PestControl() {
	const router = useRouter();
	const { isFavorited, addFavorite, removeFavorite } = useFavorites();
	const {
		data: trucks,
		loading,
		error,
		retry,
		cachedAt,
	} = useCategoryData<Truck>(getPestControlTrucks, 'pestControlTrucks');

	const handlePress = (truck: Truck) => {
		router.push({
			pathname: '/detail/[category]/[id]',
			params: { category: 'pestControl', id: String(truck.id) },
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
				{trucks.length > 0 ? (
					trucks.map((truck) => (
						<View
							key={truck.id}
							className='flex-row items-center justify-between gap-2 rounded-lg border-4 border-bbRed bg-bbYellow p-2'
						>
							<Pressable
								className='flex-1 flex-row items-center gap-2'
								onPress={() => handlePress(truck)}
							>
								{truck.image ? (
									<Image
										source={{ width: 100, height: 100, uri: truck.image }}
										width={100}
										height={100}
										resizeMode='contain'
									/>
								) : null}
								<View className='max-w-[70%] flex-col'>
									<Text
										testID='card-title'
										className='font-chewy text-base text-bbRed'
									>
										{truck.name}
									</Text>
									<Text className='font-chewy text-base text-bbRed'>
										{composeTruckShortBio(truck)}
									</Text>
								</View>
							</Pressable>
							<FavoriteButton
								favorited={isFavorited('pest_control_truck', truck.id)}
								onToggle={() =>
									isFavorited('pest_control_truck', truck.id)
										? removeFavorite('pest_control_truck', truck.id)
										: addFavorite('pest_control_truck', truck.id)
								}
							/>
						</View>
					))
				) : (
					<View className='flex-1 flex-col items-center justify-center'>
						<Text className='font-chewy text-[44px]'>
							Pest Control Truck UH OH...
						</Text>
					</View>
				)}
			</View>
		</ScrollView>
	);
}
