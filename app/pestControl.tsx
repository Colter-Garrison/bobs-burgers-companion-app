import React, { useState, useEffect } from 'react';
import { Image } from 'react-native';
import { H1, ScrollView, SizableText, XStack, YStack } from 'tamagui';
import { getPestControlTrucks } from '../hooks/fetchPestControlTrucks';

export default function PestControl() {
	interface Truck {
		id: number;
		name: string;
		image: string;
		season: number;
		episode: number;
		episodeUrl: string;
		url: string;
	}

	const [trucks, setTrucks] = useState<Truck[]>([]);
	const [loading, setLoading] = useState(true);
	const [dots, setDots] = useState(1);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const truckData = await getPestControlTrucks();
				setTrucks(truckData);
			} catch (error) {
				console.error('Error fetching pest control truck data:', error);
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
				{trucks.length > 0 ? (
					trucks.map((truck) => (
						<XStack
							key={truck.id}
							gap='$2'
							backgroundColor={'#F8DF24'}
							borderWidth={4}
							borderColor={'#E8242F'}
							borderRadius={8}
							padding='$2'
							alignItems='center'
						>
							{truck.image ? (
								<Image
									source={{ width: 100, height: 100, uri: truck.image }}
									width={100}
									height={100}
									resizeMode='contain'
								/>
							) : null}
							<YStack maxWidth='70%'>
								<SizableText color='#E8242F'>Name: {truck.name}</SizableText>
								<SizableText color='#E8242F'>
									Season: {truck.season}
								</SizableText>
								<SizableText color='#E8242F'>
									Episode: {truck.episode}
								</SizableText>
							</YStack>
						</XStack>
					))
				) : (
					<YStack flex={1} justifyContent='center' alignItems='center'>
						<H1>Pest Control Truck UH OH...</H1>
					</YStack>
				)}
			</YStack>
		</ScrollView>
	);
}
