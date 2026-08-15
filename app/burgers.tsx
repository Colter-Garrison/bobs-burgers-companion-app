import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, Text, View } from 'react-native';
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

	const fetchData = useCallback(async () => {
		try {
			const burgerData = await getBurgersOfTheDay();
			setBurgers(burgerData);
		} catch (error) {
			console.error('Error fetching burger of the day data:', error);
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
				{burgers.length > 0 ? (
					burgers.map((burger) => (
						<View
							key={burger.id}
							className='flex-col rounded-lg border-4 border-bbRed bg-bbYellow p-2'
						>
							<Text className='font-chewy text-base text-bbRed'>
								Name: {burger.name}
							</Text>
							<Text className='font-chewy text-base text-bbRed'>
								Price: {burger.price}
							</Text>
							<Text className='font-chewy text-base text-bbRed'>
								Season: {burger.season}
							</Text>
							<Text className='font-chewy text-base text-bbRed'>
								Episode: {burger.episode}
							</Text>
						</View>
					))
				) : (
					<View className='flex-1 flex-col items-center justify-center'>
						<Text className='font-chewy text-[44px]'>
							Burger of the Day UH OH...
						</Text>
					</View>
				)}
			</View>
		</ScrollView>
	);
}
