import React, { useState, useEffect } from 'react';
import { H1, Image, ScrollView, SizableText, YStack } from 'tamagui';
import { getEndCreditsSequences } from '../hooks/fetchEndCreditsSequences';

export default function EndCredits() {
	interface EndCredit {
		id: number;
		image: string;
		season: number;
		episode: number;
		episodeUrl: string;
		url: string;
	}

	const [endCredits, setEndCredits] = useState<EndCredit[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const creditData = await getEndCreditsSequences();
				setEndCredits(creditData);
			} catch (error) {
				console.error('Error fetching end credits data:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) {
		return (
			<YStack flex={1} justifyContent='center' alignItems='center'>
				<H1>Loading...</H1>
			</YStack>
		);
	}

	return (
		<ScrollView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
			<YStack gap='$2' alignItems='center'>
				{endCredits.length > 0 ? (
					endCredits.map((credits) => (
						<SizableText key={credits.id} size='$5'>
							{credits.image ? (
								<Image
									source={{ uri: credits.image }}
									style={{
										width: 100,
										height: 100,
									}}
								/>
							) : null}
							Season: {credits.season}, Episode: {credits.episode}
						</SizableText>
					))
				) : (
					<YStack flex={1} justifyContent='center' alignItems='center'>
						<H1>End Credits UH OH...</H1>
					</YStack>
				)}
			</YStack>
		</ScrollView>
	);
}
