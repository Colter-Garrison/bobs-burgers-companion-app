import { useCallback, useEffect, useState } from 'react';
import { getBurgersOfTheDay } from './fetchBurgersOfTheDay';
import { getCharacters } from './fetchCharacters';
import { getEndCreditsSequences } from './fetchEndCreditsSequences';
import { getEpisodes } from './fetchEpisodes';
import { getPestControlTrucks } from './fetchPestControlTrucks';
import { getStoresNextDoor } from './fetchStoresNextDoor';

export type SearchCategory =
	| 'Burgers of the Day'
	| 'Characters'
	| 'End Credits'
	| 'Episodes'
	| 'Pest Control Trucks'
	| 'Stores Next Door';

export interface SearchItem {
	id: string;
	category: SearchCategory;
	label: string;
	image?: string;
	linkUrl?: string;
}

interface RawBurger {
	id: number;
	name: string;
	episodeUrl: string;
}
interface RawCharacter {
	id: number;
	name: string;
	image: string;
	wikiUrl: string;
}
interface RawEndCredit {
	id: number;
	image: string;
	season: number;
	episode: number;
	episodeUrl: string;
}
interface RawEpisode {
	id: number;
	name: string;
	wikiUrl: string;
}
interface RawTruck {
	id: number;
	name: string;
	image: string;
	episodeUrl: string;
}
interface RawStore {
	id: number;
	name: string;
	image: string;
	episodeUrl: string;
}

export function useSearchableItems() {
	const [items, setItems] = useState<SearchItem[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchData = useCallback(async () => {
		try {
			// The fetch* hooks don't declare return types, so Promise.all resolves to
			// `any[]` here; cast to the shapes we actually read from the API responses.
			const [burgers, characters, endCredits, episodes, trucks, stores] =
				(await Promise.all([
					getBurgersOfTheDay(),
					getCharacters(),
					getEndCreditsSequences(),
					getEpisodes(),
					getPestControlTrucks(),
					getStoresNextDoor(),
				])) as [
					RawBurger[],
					RawCharacter[],
					RawEndCredit[],
					RawEpisode[],
					RawTruck[],
					RawStore[],
				];

			const normalized: SearchItem[] = [
				...(burgers ?? []).map((burger) => ({
					id: `burger-${burger.id}`,
					category: 'Burgers of the Day' as const,
					label: burger.name,
					linkUrl: burger.episodeUrl,
				})),
				...(characters ?? []).map((character) => ({
					id: `character-${character.id}`,
					category: 'Characters' as const,
					label: character.name,
					image: character.image,
					linkUrl: character.wikiUrl,
				})),
				...(endCredits ?? []).map((credit) => ({
					id: `endCredits-${credit.id}`,
					category: 'End Credits' as const,
					label: `Season ${credit.season}, Episode ${credit.episode}`,
					image: credit.image,
					linkUrl: credit.episodeUrl,
				})),
				...(episodes ?? []).map((episode) => ({
					id: `episode-${episode.id}`,
					category: 'Episodes' as const,
					label: episode.name,
					linkUrl: episode.wikiUrl,
				})),
				...(trucks ?? []).map((truck) => ({
					id: `truck-${truck.id}`,
					category: 'Pest Control Trucks' as const,
					label: truck.name,
					image: truck.image,
					linkUrl: truck.episodeUrl,
				})),
				...(stores ?? []).map((store) => ({
					id: `store-${store.id}`,
					category: 'Stores Next Door' as const,
					label: store.name,
					image: store.image,
					linkUrl: store.episodeUrl,
				})),
			];

			setItems(normalized);
		} catch (error) {
			console.error('Error fetching searchable data:', error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return { items, loading };
}
