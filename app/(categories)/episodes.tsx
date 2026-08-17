import React from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { Episode, getEpisodes } from '../../hooks/fetchEpisodes';
import { useCategoryData } from '../../hooks/useCategoryData';
import { useFavorites } from '../../hooks/useFavorites';
import { FavoriteButton } from '../../components/FavoriteButton';
import { CategorySkeleton } from '../../components/CategorySkeleton';
import { ErrorState } from '../../components/ErrorState';

export default function Episodes() {
	const { isFavorited, addFavorite, removeFavorite } = useFavorites();
	const {
		data: episodes,
		loading,
		error,
		retry,
	} = useCategoryData<Episode>(getEpisodes);
	const handlePress = (episode: Episode) => {
		Linking.openURL(episode.wikiUrl);
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
				{episodes.length > 0 ? (
					episodes.map((episode) => (
						<View
							key={episode.id}
							className='flex-row items-start justify-between gap-2 rounded-lg border-4 border-bbRed bg-bbYellow p-2'
						>
							<Pressable
								className='flex-1 flex-col'
								onPress={() => handlePress(episode)}
							>
								<Text className='font-chewy text-base text-bbRed'>
									Name: {episode.name}
								</Text>
								<Text className='font-chewy text-base text-bbRed'>
									Description: {episode.description}
								</Text>
								<Text className='font-chewy text-base text-bbRed'>
									Air Date: {episode.airDate}
								</Text>
								<Text className='font-chewy text-base text-bbRed'>
									Season: {episode.season}
								</Text>
								<Text className='font-chewy text-base text-bbRed'>
									Episode: {episode.episode}
								</Text>
								<Text className='font-chewy text-base text-bbRed'>
									Total Viewers: {episode.totalViewers}
								</Text>
							</Pressable>
							<FavoriteButton
								favorited={isFavorited('episode', episode.id)}
								onToggle={() =>
									isFavorited('episode', episode.id)
										? removeFavorite('episode', episode.id)
										: addFavorite('episode', episode.id)
								}
							/>
						</View>
					))
				) : (
					<View className='flex-1 flex-col items-center justify-center'>
						<Text className='font-chewy text-[44px]'>Episode UH OH...</Text>
					</View>
				)}
			</View>
		</ScrollView>
	);
}
