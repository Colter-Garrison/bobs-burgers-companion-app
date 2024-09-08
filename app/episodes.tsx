import React, { useState, useEffect } from 'react';
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
					<H1 color='#E8242F'>Loading...</H1>
				</XStack>
			</YStack>
		);
	}

	return (
		<ScrollView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
			<YStack gap='$2' alignItems='center'>
				{episodes.length > 0 ? (
					episodes.map((episode) => (
						<SizableText key={episode.id} size='$5'>
							Name: {episode.name}, Description: {episode.description}, Air
							Date: {episode.airDate}, Season: {episode.season}, Episode:{' '}
							{episode.episode}, Total Viewers: {episode.totalViewers}
						</SizableText>
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
