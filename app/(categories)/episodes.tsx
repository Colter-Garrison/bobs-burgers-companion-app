import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Episode, getEpisodes } from '../../hooks/fetchEpisodes';
import { useCategoryData } from '../../hooks/useCategoryData';
import { useFavorites } from '../../hooks/useFavorites';
import { composeEpisodeShortBio } from '../../lib/categoryBio';
import { FavoriteButton } from '../../components/FavoriteButton';
import { CategorySkeleton } from '../../components/CategorySkeleton';
import { ErrorState } from '../../components/ErrorState';
import { OfflineBanner } from '../../components/OfflineBanner';

export default function Episodes() {
	const router = useRouter();
	const { isFavorited, addFavorite, removeFavorite } = useFavorites();
	const {
		data: episodes,
		loading,
		error,
		retry,
		cachedAt,
	} = useCategoryData<Episode>(getEpisodes, 'episodes');

	const handlePress = (episode: Episode) => {
		router.push({
			pathname: '/detail/[category]/[id]',
			params: { category: 'episodes', id: String(episode.id) },
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
								<Text
									testID='card-title'
									className='font-chewy text-base text-bbRed'
								>
									{episode.name}
								</Text>
								<Text className='font-chewy text-base text-bbRed'>
									{composeEpisodeShortBio(episode)}
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
