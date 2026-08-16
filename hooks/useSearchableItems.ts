import { useCallback, useEffect, useState } from 'react';
import { FavoriteCategory } from '../lib/apiClient';
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
	// The item's raw numeric id from the external API and the backend's
	// category enum value — distinct from `id`/`category` above, which
	// are display/list-key concerns, not what favoriting needs.
	itemId: number;
	favoriteCategory: FavoriteCategory;
}

export function useSearchableItems() {
	const [items, setItems] = useState<SearchItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = useCallback(async () => {
		setLoading(true);
		setError(null);

		// allSettled (not all) so one category's failure doesn't discard
		// the results the other five sources already got back —
		// partial search results are still useful, unlike an all-or-nothing
		// failure that blanks out everything.
		const [burgers, characters, endCredits, episodes, trucks, stores] =
			await Promise.allSettled([
				getBurgersOfTheDay(),
				getCharacters(),
				getEndCreditsSequences(),
				getEpisodes(),
				getPestControlTrucks(),
				getStoresNextDoor(),
			]);

		[burgers, characters, endCredits, episodes, trucks, stores].forEach(
			(result) => {
				if (result.status === 'rejected') {
					console.error('Error fetching searchable data:', result.reason);
				}
			},
		);
		const anyRejected = [
			burgers,
			characters,
			endCredits,
			episodes,
			trucks,
			stores,
		].some((result) => result.status === 'rejected');
		setError(anyRejected ? 'Some results may be missing.' : null);

		const normalized: SearchItem[] = [
			...(burgers.status === 'fulfilled' ? burgers.value : []).map(
				(burger) => ({
					id: `burger-${burger.id}`,
					category: 'Burgers of the Day' as const,
					label: burger.name,
					linkUrl: burger.episodeUrl,
					itemId: burger.id,
					favoriteCategory: 'burger' as const,
				}),
			),
			...(characters.status === 'fulfilled' ? characters.value : []).map(
				(character) => ({
					id: `character-${character.id}`,
					category: 'Characters' as const,
					label: character.name,
					image: character.image,
					linkUrl: character.wikiUrl,
					itemId: character.id,
					favoriteCategory: 'character' as const,
				}),
			),
			...(endCredits.status === 'fulfilled' ? endCredits.value : []).map(
				(credit) => ({
					id: `endCredits-${credit.id}`,
					category: 'End Credits' as const,
					label: `Season ${credit.season}, Episode ${credit.episode}`,
					image: credit.image,
					linkUrl: credit.episodeUrl,
					itemId: credit.id,
					favoriteCategory: 'end_credit' as const,
				}),
			),
			...(episodes.status === 'fulfilled' ? episodes.value : []).map(
				(episode) => ({
					id: `episode-${episode.id}`,
					category: 'Episodes' as const,
					label: episode.name,
					linkUrl: episode.wikiUrl,
					itemId: episode.id,
					favoriteCategory: 'episode' as const,
				}),
			),
			...(trucks.status === 'fulfilled' ? trucks.value : []).map((truck) => ({
				id: `truck-${truck.id}`,
				category: 'Pest Control Trucks' as const,
				label: truck.name,
				image: truck.image,
				linkUrl: truck.episodeUrl,
				itemId: truck.id,
				favoriteCategory: 'pest_control_truck' as const,
			})),
			...(stores.status === 'fulfilled' ? stores.value : []).map((store) => ({
				id: `store-${store.id}`,
				category: 'Stores Next Door' as const,
				label: store.name,
				image: store.image,
				linkUrl: store.episodeUrl,
				itemId: store.id,
				favoriteCategory: 'store' as const,
			})),
		];

		setItems(normalized);
		setLoading(false);
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return { items, loading, error, retry: fetchData };
}
