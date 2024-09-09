import React, { useState, useEffect } from 'react';
import { Image, Linking, Pressable } from 'react-native';
import { H1, ScrollView, SizableText, Spinner, XStack, YStack } from 'tamagui';
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

	useEffect(() => {
		const fetchData = async () => {
			try {
				const characterData = await getCharacters();
				setCharacters(characterData);
			} catch (error) {
				console.error('Error fetching character data:', error);
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
					<H1 color='#E8242F'>Loading </H1>
					<Spinner size='large' color='#E8242F' />
				</XStack>
			</YStack>
		);
	}

	return (
		<ScrollView backgroundColor='#BDFB73'>
			<YStack padding='$2' gap='$2'>
				{characters.length > 0 ? (
					characters.map((character) => {
						return (
							<Pressable
								key={character.id}
								onPress={() => handlePress(character)}
							>
								<XStack
									key={character.id}
									gap='$2'
									backgroundColor={'#F8DF24'}
									borderWidth={4}
									borderColor={'#E8242F'}
									borderRadius={8}
									padding='$2'
									alignItems='center'
								>
									{character.image ? (
										<Image
											source={{ width: 100, height: 100, uri: character.image }}
											width={100}
											height={100}
											resizeMode='contain'
										/>
									) : null}
									<YStack maxWidth='70%'>
										<SizableText color='#E8242F'>
											Name: {character.name}
										</SizableText>
										<SizableText>
											{character.relatives.length > 0 ? (
												<SizableText color='#E8242F'>
													Relatives:{' '}
													{character.relatives
														.map((relative) => relative.name)
														.join(', ')}
												</SizableText>
											) : (
												<SizableText color='#E8242F'>
													Relatives: None
												</SizableText>
											)}
										</SizableText>
										<SizableText>
											{character.occupation ? (
												<SizableText color='#E8242F'>
													Occupation: {character.occupation}
												</SizableText>
											) : (
												<SizableText color='#E8242F'>
													Occupation: None
												</SizableText>
											)}
										</SizableText>
										<SizableText color='#E8242F'>
											First Episode: {character.firstEpisode}
										</SizableText>
										<SizableText>
											{character.voicedBy ? (
												<SizableText color='#E8242F'>
													Voiced By: {character.voicedBy}
												</SizableText>
											) : (
												<SizableText color='#E8242F'>
													Voiced By: Unknown
												</SizableText>
											)}
										</SizableText>
									</YStack>
								</XStack>
							</Pressable>
						);
					})
				) : (
					<YStack flex={1} justifyContent='center' alignItems='center'>
						<H1>Character UH OH...</H1>
					</YStack>
				)}
			</YStack>
		</ScrollView>
	);
}
