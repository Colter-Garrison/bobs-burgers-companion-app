import React, { useState, useEffect } from 'react';
import { H1, ScrollView, SizableText, YStack } from 'tamagui';
import { getBurgersOfTheDay } from '../hooks/fetchBurgersOfTheDay';

export default function Burgers() {
	interface Burger {
		id: number;
		name: string;
		price: string;
		season: number;
		episode: number;
		episodeUrl: string;
		url: string;
	}

	const [burgers, setBurgers] = useState<Burger[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const burgerData = await getBurgersOfTheDay();
				setBurgers(burgerData);
			} catch (error) {
				console.error('Error fetching burger of the day data:', error);
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
				{burgers.length > 0 ? (
					burgers.map((burger) => (
						<SizableText key={burger.id} size='$5'>
							Name: {burger.name}, Price: {burger.price}, Season:{' '}
							{burger.season}, Episode: {burger.episode}.
						</SizableText>
					))
				) : (
					<YStack flex={1} justifyContent='center' alignItems='center'>
						<H1>Burger of the Day UH OH...</H1>
					</YStack>
				)}
			</YStack>
		</ScrollView>
	);
}
