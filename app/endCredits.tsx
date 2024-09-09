import React, { useState, useEffect } from 'react';
import { Image } from 'react-native';
import { H1, ScrollView, SizableText, XStack, YStack } from 'tamagui';
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
	const [dots, setDots] = useState(1);

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

	useEffect(() => {
		const interval = setInterval(() => {
			setDots((prevDots) => (prevDots % 3) + 1);
		}, 500);

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
				{endCredits.length > 0 ? (
					endCredits.map((credits) => (
						<XStack
							key={credits.id}
							gap='$2'
							backgroundColor={'#F8DF24'}
							borderWidth={4}
							borderColor={'#E8242F'}
							borderRadius={8}
							padding='$2'
							alignItems='center'
						>
							{credits.image ? (
								<Image
									source={{ width: 100, height: 100, uri: credits.image }}
									width={100}
									height={100}
									resizeMode='contain'
								/>
							) : null}
							<YStack maxWidth='70%'>
								<SizableText color='#E8242F'>
									Season: {credits.season}
								</SizableText>
								<SizableText color='#E8242F'>
									Episode: {credits.episode}
								</SizableText>
							</YStack>
						</XStack>
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
