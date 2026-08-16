import React, { useState, useEffect, useCallback } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { getEndCreditsSequences } from '../hooks/fetchEndCreditsSequences';
import { useFavorites } from '../hooks/useFavorites';
import { FavoriteButton } from '../components/FavoriteButton';

export default function EndCredits() {
	interface EndCredit {
		id: number;
		image: string;
		season: number;
		episode: number;
		episodeUrl: string;
		url: string;
	}

	const { isFavorited, addFavorite, removeFavorite } = useFavorites();
	const [endCredits, setEndCredits] = useState<EndCredit[]>([]);
	const [loading, setLoading] = useState(true);
	const [dots, setDots] = useState(1);

	const fetchData = useCallback(async () => {
		try {
			const creditData = await getEndCreditsSequences();
			setEndCredits(creditData);
		} catch (error) {
			console.error('Error fetching end credits data:', error);
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
				{endCredits.length > 0 ? (
					endCredits.map((credits) => (
						<View
							key={credits.id}
							className='flex-row items-center justify-between gap-2 rounded-lg border-4 border-bbRed bg-bbYellow p-2'
						>
							<View className='flex-1 flex-row items-center gap-2'>
								{credits.image ? (
									<Image
										source={{ width: 100, height: 100, uri: credits.image }}
										width={100}
										height={100}
										resizeMode='contain'
									/>
								) : null}
								<View className='max-w-[70%] flex-col'>
									<Text className='font-chewy text-base text-bbRed'>
										Season: {credits.season}
									</Text>
									<Text className='font-chewy text-base text-bbRed'>
										Episode: {credits.episode}
									</Text>
								</View>
							</View>
							<FavoriteButton
								favorited={isFavorited('end_credit', credits.id)}
								onToggle={() =>
									isFavorited('end_credit', credits.id)
										? removeFavorite('end_credit', credits.id)
										: addFavorite('end_credit', credits.id)
								}
							/>
						</View>
					))
				) : (
					<View className='flex-1 flex-col items-center justify-center'>
						<Text className='font-chewy text-[44px]'>End Credits UH OH...</Text>
					</View>
				)}
			</View>
		</ScrollView>
	);
}
