import React, { useState, useEffect } from 'react';
import { H1, ScrollView, SizableText, YStack } from 'tamagui';
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
	interface Character {
		id: number;
		name: string;
		relatives: string[];
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
	const [EndCredit, setEndCredits] = useState<EndCredit[]>([]);
	const [Episode, setEpisodes] = useState<Episode[]>([]);
	const [Truck, setTrucks] = useState<Truck[]>([]);
	const [Store, setStores] = useState<Store[]>([]);
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
				{burgers.length > 0 ? (
					burgers.map((burger) => (
						<SizableText key={burger.id} size='$5'>
							{burger.name}
						</SizableText>
					))
				) : (
					<YStack flex={1} justifyContent='center' alignItems='center'>
						<H1>UH OH...</H1>
					</YStack>
				)}
				{characters.length > 0 ? (
					characters.map((character) => (
						<SizableText key={character.id} size='$5'>
							{character.name} - {character.occupation}
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
