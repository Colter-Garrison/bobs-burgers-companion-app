import React, { useState, useEffect, useCallback } from 'react';
import {
	Image,
	Linking,
	Pressable,
	ScrollView,
	Text,
	View,
} from 'react-native';
import { getCharacters } from '../hooks/fetchCharacters';

export default function Characters() {
	interface Character {
		id: number;
		name: string;
		relatives: Relative[];
		wikiUrl: string;
		image: string;
		gender: string;
		hair: string;
		occupation: string;
		allOccupations: string[];
		firstEpisode: string;
		voicedBy: string;
		url: string;
	}
	interface Relative {
		name: string;
		relationship: string;
		wikiUrl: string;
		url: string;
	}

	const [characters, setCharacters] = useState<Character[]>([]);
	const [loading, setLoading] = useState(true);
	const handlePress = (character: Character) => {
		Linking.openURL(character.wikiUrl);
	};
	const [dots, setDots] = useState(1);

	const fetchData = useCallback(async () => {
		try {
			const characterData = await getCharacters();
			setCharacters(characterData);
		} catch (error) {
			console.error('Error fetching character data:', error);
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
				{characters.length > 0 ? (
					characters.map((character) => {
						return (
							<Pressable
								key={character.id}
								onPress={() => handlePress(character)}
							>
								<View className='flex-row items-center gap-2 rounded-lg border-4 border-bbRed bg-bbYellow p-2'>
									{character.image ? (
										<Image
											source={{ width: 100, height: 100, uri: character.image }}
											width={100}
											height={100}
											resizeMode='contain'
										/>
									) : null}
									<View className='max-w-[70%] flex-col md:max-w-[90%]'>
										<Text className='font-chewy text-base text-bbRed'>
											Name: {character.name}
										</Text>
										<Text>
											{character.relatives.length > 0 ? (
												<Text className='font-chewy text-base text-bbRed'>
													Relatives:{' '}
													{character.relatives
														.map((relative) => relative.name)
														.join(', ')}
												</Text>
											) : (
												<Text className='font-chewy text-base text-bbRed'>
													Relatives: None
												</Text>
											)}
										</Text>
										<Text>
											{character.occupation ? (
												<Text className='font-chewy text-base text-bbRed'>
													Occupation: {character.occupation}
												</Text>
											) : (
												<Text className='font-chewy text-base text-bbRed'>
													Occupation: None
												</Text>
											)}
										</Text>
										<Text className='font-chewy text-base text-bbRed'>
											First Episode: {character.firstEpisode}
										</Text>
										<Text>
											{character.voicedBy ? (
												<Text className='font-chewy text-base text-bbRed'>
													Voiced By: {character.voicedBy}
												</Text>
											) : (
												<Text className='font-chewy text-base text-bbRed'>
													Voiced By: Unknown
												</Text>
											)}
										</Text>
									</View>
								</View>
							</Pressable>
						);
					})
				) : (
					<View className='flex-1 flex-col items-center justify-center'>
						<Text className='font-chewy text-[44px]'>Character UH OH...</Text>
					</View>
				)}
			</View>
		</ScrollView>
	);
}
