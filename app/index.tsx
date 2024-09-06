import React, { useState, useEffect } from 'react';
import { H1, Image, ScrollView, SizableText, YStack } from 'tamagui';
import { getBurgersOfTheDay } from '../hooks/fetchBurgersOfTheDay';
import { getCharacters } from '../hooks/fetchCharacters';
import { getEndCreditsSequences } from '../hooks/fetchEndCreditsSequences';
import { getEpisodes } from '../hooks/fetchEpisodes';
import { getPestControlTrucks } from '../hooks/fetchPestControlTrucks';
import { getStoresNextDoor } from '../hooks/fetchStoresNextDoor';

export default function Index() {
	interface Burger {
		id: number;
		name: string;
		price: string;
		season: number;
		episode: number;
		episodeUrl: string;
		url: string;
	}
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
	interface EndCredit {
		id: number;
		image: string;
		season: number;
		episode: number;
		episodeUrl: string;
		url: string;
	}
	interface Episode {
		id: number;
		name: string;
		description: string;
		productionCode: string;
		airDate: string;
		season: number;
		episode: number;
		totalViews: string;
		url: string;
		wikiUrl: string;
	}
	interface Truck {
		id: number;
		name: string;
		image: string;
		season: number;
		episode: number;
		episodeUrl: string;
		url: string;
	}
	interface Store {
		id: number;
		name: string;
		image: string;
		season: number;
		episode: number;
		episodeUrl: string;
		url: string;
	}

	const [burgers, setBurgers] = useState<Burger[]>([]);
	const [characters, setCharacters] = useState<Character[]>([]);
	const [EndCredits, setEndCredits] = useState<EndCredit[]>([]);
	const [Episodes, setEpisodes] = useState<Episode[]>([]);
	const [Trucks, setTrucks] = useState<Truck[]>([]);
	const [Stores, setStores] = useState<Store[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const burgerData = await getBurgersOfTheDay();
				const characterData = await getCharacters();
				const creditData = await getEndCreditsSequences();
				const episodeData = await getEpisodes();
				const truckData = await getPestControlTrucks();
				const storeData = await getStoresNextDoor();
				setBurgers(burgerData);
				setCharacters(characterData);
				setEndCredits(creditData);
				setEpisodes(episodeData);
				setTrucks(truckData);
				setStores(storeData);
			} catch (error) {
				console.error('Error fetching data:', error);
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
				{/* {burgers.length > 0 ? (
					burgers.map((burger) => (
						<SizableText key={burger.id} size='$5'>
							Name: {burger.name}, Price:{burger.price}, Season: {burger.season}
							, Episode: {burger.episode}.
						</SizableText>
					))
				) : (
					<YStack flex={1} justifyContent='center' alignItems='center'>
						<H1>UH OH...</H1>
					</YStack>
				)} */}
				{/* {characters.length > 0 ? (
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
						<H1>UH OH...</H1>
					</YStack>
				)} */}
				{EndCredits.length > 0 ? (
					EndCredits.map((credits) => (
						<SizableText key={credits.id} size='$5'>
							{credits.image ? (
								<Image
									source={{ uri: credits.image }}
									style={{
										width: 100,
										height: 100,
									}}
								/>
							) : null}
							Season: {credits.season}, Episode: {credits.episode}
						</SizableText>
					))
				) : (
					<YStack flex={1} justifyContent='center' alignItems='center'>
						<H1>UH OH...</H1>
					</YStack>
				)}
			</YStack>
		</ScrollView>
	);
}
