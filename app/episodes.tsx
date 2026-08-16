import React, { useState, useEffect, useCallback } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { getEpisodes } from '../hooks/fetchEpisodes';
import { useFavorites } from '../hooks/useFavorites';
import { FavoriteButton } from '../components/FavoriteButton';

export default function Episodes() {
	interface Episode {
		id: number;
		name: string;
		description: string;
		productionCode: string;
		airDate: string;
		season: number;
		episode: number;
		totalViewers: string;
		url: string;
		wikiUrl: string;
	}

	const { isFavorited, addFavorite, removeFavorite } = useFavorites();
	const [episodes, setEpisodes] = useState<Episode[]>([]);
	const [loading, setLoading] = useState(true);
	const handlePress = (episode: Episode) => {
		Linking.openURL(episode.wikiUrl);
	};
	const [dots, setDots] = useState(1);

	const fetchData = useCallback(async () => {
		try {
			const episodeData = await getEpisodes();
			setEpisodes(episodeData);
		} catch (error) {
			console.error('Error fetching episode data:', error);
		} finally {
			setTimeout(() => {
				setLoading(false);
			}, 3000);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	useEffect(() => {
		const interval = setInterval(() => {
			setDots((prevDots) => (prevDots % 3) + 1);
		}, 500);

		return () => clearInterval(interval);
	}, []);

	if (loading) {
		return (
			<View className='flex-1 flex-col items-center justify-center bg-bbGreen'>
				<View className='flex-row items-center rounded-lg border-4 border-bbRed bg-bbYellow p-2'>
					<Text className='font-chewy text-[44px] text-bbRed'>
						Loading{'.'.repeat(dots)}
					</Text>
				</View>
			</View>
		);
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
