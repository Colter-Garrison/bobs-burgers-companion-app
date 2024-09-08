import React, { useState, useEffect } from 'react';
import { H1, Image, ScrollView, SizableText, XStack, YStack } from 'tamagui';
import { getStoresNextDoor } from '../hooks/fetchStoresNextDoor';

export default function Stores() {
	interface Store {
		id: number;
		name: string;
		image: string;
		season: number;
		episode: number;
		episodeUrl: string;
		url: string;
	}

	const [stores, setStores] = useState<Store[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const storeData = await getStoresNextDoor();
				setStores(storeData);
			} catch (error) {
				console.error('Error fetching store data:', error);
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
				{stores.length > 0 ? (
					stores.map((store) => (
						<SizableText key={store.id} size='$5'>
							{store.image ? (
								<Image
									source={{ uri: store.image }}
									style={{
										width: 100,
										height: 100,
									}}
								/>
							) : null}
							Name: {store.name}, Season: {store.season}, Episode:{' '}
							{store.episode}
						</SizableText>
					))
				) : (
					<YStack flex={1} justifyContent='center' alignItems='center'>
						<H1>Store Next Door UH OH...</H1>
					</YStack>
				)}
			</YStack>
		</ScrollView>
	);
}
