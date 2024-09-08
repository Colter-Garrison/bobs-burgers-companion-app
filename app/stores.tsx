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
		<ScrollView backgroundColor='#BDFB73'>
			<YStack padding='$2' gap='$2'>
				{stores.length > 0 ? (
					stores.map((store) => (
						<XStack
							key={store.id}
							gap='$2'
							backgroundColor={'#F8DF24'}
							borderWidth={4}
							borderColor={'#E8242F'}
							borderRadius={8}
							padding='$2'
							alignItems='center'
						>
							{store.image ? (
								<Image
									source={{ uri: store.image }}
									width={100}
									height={100}
									objectFit='contain'
								/>
							) : null}
							<YStack maxWidth='70%'>
								<SizableText color='#E8242F'>Name: {store.name}</SizableText>
								<SizableText color='#E8242F'>
									Season: {store.season}
								</SizableText>
								<SizableText color='#E8242F'>
									Episode: {store.episode}
								</SizableText>
							</YStack>
						</XStack>
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
