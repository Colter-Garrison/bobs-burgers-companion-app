import React, { useState, useEffect } from 'react';
import { H1, Image, ScrollView, SizableText, YStack } from 'tamagui';
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
				{trucks.length > 0 ? (
					trucks.map((truck) => (
						<SizableText key={truck.id} size='$5'>
							{truck.image ? (
								<Image
									source={{ uri: truck.image }}
									style={{
										width: 100,
										height: 100,
									}}
								/>
							) : null}
							Name: {truck.name}, Season: {truck.season}, Episode:{' '}
							{truck.episode}
						</SizableText>
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
