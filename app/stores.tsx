import React, { useState, useEffect, useCallback } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
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
	const [dots, setDots] = useState(1);

	const fetchData = useCallback(async () => {
		try {
			const storeData = await getStoresNextDoor();
			setStores(storeData);
		} catch (error) {
			console.error('Error fetching store data:', error);
		} finally {
			setTimeout(() => {
				setLoading(false);
			}, 3000);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	useEffect(() => {
		const interval = setInterval(() => {
			setDots((prevDots) => (prevDots % 3) + 1);
		}, 500);

		return () => clearInterval(interval);
	}, []);

	if (loading) {
		return (
			<View className='flex-1 flex-col items-center justify-center bg-bbGreen'>
				<View className='flex-row items-center rounded-lg border-4 border-bbRed bg-bbYellow p-2'>
					<Text className='font-chewy text-[44px] text-bbRed'>
						Loading{'.'.repeat(dots)}
					</Text>
				</View>
			</View>
		);
	}

	return (
		<ScrollView className='bg-bbGreen'>
			<View className='flex-col gap-2 p-2'>
				{stores.length > 0 ? (
					stores.map((store) => (
						<View
							key={store.id}
							className='flex-row items-center gap-2 rounded-lg border-4 border-bbRed bg-bbYellow p-2'
						>
							{store.image ? (
								<Image
									source={{ width: 100, height: 100, uri: store.image }}
									width={100}
									height={100}
									resizeMode='contain'
								/>
							) : null}
							<View className='max-w-[70%] flex-col'>
								<Text className='font-chewy text-base text-bbRed'>
									Name: {store.name}
								</Text>
								<Text className='font-chewy text-base text-bbRed'>
									Season: {store.season}
								</Text>
								<Text className='font-chewy text-base text-bbRed'>
									Episode: {store.episode}
								</Text>
							</View>
						</View>
					))
				) : (
					<View className='flex-1 flex-col items-center justify-center'>
						<Text className='font-chewy text-[44px]'>
							Store Next Door UH OH...
						</Text>
					</View>
				)}
			</View>
		</ScrollView>
	);
}
