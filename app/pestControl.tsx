import React, { useState, useEffect, useCallback } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
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

	const fetchData = useCallback(async () => {
		try {
			const truckData = await getPestControlTrucks();
			setTrucks(truckData);
		} catch (error) {
			console.error('Error fetching pest control truck data:', error);
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
				{trucks.length > 0 ? (
					trucks.map((truck) => (
						<View
							key={truck.id}
							className='flex-row items-center gap-2 rounded-lg border-4 border-bbRed bg-bbYellow p-2'
						>
							{truck.image ? (
								<Image
									source={{ width: 100, height: 100, uri: truck.image }}
									width={100}
									height={100}
									resizeMode='contain'
								/>
							) : null}
							<View className='max-w-[70%] flex-col'>
								<Text className='font-chewy text-base text-bbRed'>
									Name: {truck.name}
								</Text>
								<Text className='font-chewy text-base text-bbRed'>
									Season: {truck.season}
								</Text>
								<Text className='font-chewy text-base text-bbRed'>
									Episode: {truck.episode}
								</Text>
							</View>
						</View>
					))
				) : (
					<View className='flex-1 flex-col items-center justify-center'>
						<Text className='font-chewy text-[44px]'>
							Pest Control Truck UH OH...
						</Text>
					</View>
				)}
			</View>
		</ScrollView>
	);
}
