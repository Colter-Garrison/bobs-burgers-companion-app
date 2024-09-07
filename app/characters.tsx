import React, { useState, useEffect } from 'react';
import { H1, Image, ScrollView, SizableText, YStack } from 'tamagui';
import { getCharacters } from '../hooks/fetchCharacters';

export default function Characters() {
	interface Relative {
		name: string;
	}
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

	const [characters, setCharacters] = useState<Character[]>([]);
	const [loading, setLoading] = useState(true);

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
			<YStack flex={1} justifyContent='center' alignItems='center'>
				<H1>Loading...</H1>
			</YStack>
		);
	}

	return (
		<ScrollView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
			<YStack gap='$2' alignItems='center'>
				{characters.length > 0 ? (
					characters.map((character) => {
						return (
							<SizableText key={character.id} size='$5'>
								{character.image ? (
									<Image
										source={{ uri: character.image }}
										style={{
											width: 100,
											height: 100,
										}}
									/>
								) : null}
								Name: {character.name},{' '}
								{character.relatives.length > 0 && (
									<SizableText size='$5'>
										Relatives:{' '}
										{character.relatives
											.map((relative) => relative.name)
											.join(', ')}
										,
									</SizableText>
								)}{' '}
								{character.occupation && (
									<SizableText size='$5'>
										Occupation: {character.occupation},
									</SizableText>
								)}{' '}
								First Episode: {character.firstEpisode}, Voiced By:{' '}
								{character.voicedBy}
							</SizableText>
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
