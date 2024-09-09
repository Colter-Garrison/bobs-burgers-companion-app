import React, { useState, useEffect } from 'react';
import { H1, ScrollView, SizableText, XStack, YStack } from 'tamagui';
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
	const [dots, setDots] = useState(1);

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
				{burgers.length > 0 ? (
					burgers.map((burger) => (
						<YStack
							key={burger.id}
							backgroundColor={'#F8DF24'}
							borderWidth={4}
							borderColor={'#E8242F'}
							borderRadius={8}
							padding='$2'
						>
							<SizableText color='#E8242F'>Name: {burger.name}</SizableText>
							<SizableText color='#E8242F'>Price: {burger.price}</SizableText>
							<SizableText color='#E8242F'>Season: {burger.season}</SizableText>
							<SizableText color='#E8242F'>
								Episode: {burger.episode}
							</SizableText>
						</YStack>
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
