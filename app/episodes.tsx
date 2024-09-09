import React, { useState, useEffect } from 'react';
import { Linking, Pressable } from 'react-native';
import { H1, ScrollView, SizableText, XStack, YStack } from 'tamagui';
import { getEpisodes } from '../hooks/fetchEpisodes';

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

	const [episodes, setEpisodes] = useState<Episode[]>([]);
	const [loading, setLoading] = useState(true);
	const handlePress = (episode: Episode) => {
		Linking.openURL(episode.wikiUrl);
	};
	const [dots, setDots] = useState(1);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const episodeData = await getEpisodes();
				setEpisodes(episodeData);
			} catch (error) {
				console.error('Error fetching episode data:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			setDots((prevDots) => (prevDots % 3) + 1);
		}, 300);

		return () => clearInterval(interval);
	}, []);

	if (loading) {
		return (
			<YStack
				flex={1}
				justifyContent='center'
				alignItems='center'
				backgroundColor='#BDFB73'
			>
				<XStack
					backgroundColor={'#F8DF24'}
					borderWidth={4}
					borderColor={'#E8242F'}
					borderRadius={8}
					padding='$2'
					alignItems='center'
				>
					<H1 color='#E8242F'>Loading{'.'.repeat(dots)}</H1>
				</XStack>
			</YStack>
		);
	}

	return (
		<ScrollView backgroundColor='#BDFB73'>
			<YStack padding='$2' gap='$2'>
				{episodes.length > 0 ? (
					episodes.map((episode) => (
						<Pressable key={episode.id} onPress={() => handlePress(episode)}>
							<YStack
								backgroundColor={'#F8DF24'}
								borderWidth={4}
								borderColor={'#E8242F'}
								borderRadius={8}
								padding='$2'
							>
								<SizableText color='#E8242F'>Name: {episode.name}</SizableText>
								<SizableText color='#E8242F'>
									Description: {episode.description}
								</SizableText>
								<SizableText color='#E8242F'>
									Air Date: {episode.airDate}
								</SizableText>
								<SizableText color='#E8242F'>
									Season: {episode.season}
								</SizableText>
								<SizableText color='#E8242F'>
									Episode: {episode.episode}
								</SizableText>
								<SizableText color='#E8242F'>
									Total Viewers: {episode.totalViewers}
								</SizableText>
							</YStack>
						</Pressable>
					))
				) : (
					<YStack flex={1} justifyContent='center' alignItems='center'>
						<H1>Episode UH OH...</H1>
					</YStack>
				)}
			</YStack>
		</ScrollView>
	);
}
