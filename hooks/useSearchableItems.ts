import { useCallback, useEffect, useState } from 'react';
import { FavoriteCategory } from '../lib/apiClient';
import { loadFromCache, saveToCache } from '../lib/dataCache';
import { getBurgersOfTheDay } from './fetchBurgersOfTheDay';
import { getCharacters } from './fetchCharacters';
import { getEndCreditsSequences } from './fetchEndCreditsSequences';
import { getEpisodes } from './fetchEpisodes';
import { getPestControlTrucks } from './fetchPestControlTrucks';
import { getStoresNextDoor } from './fetchStoresNextDoor';
import { useNetworkStatus } from './useNetworkStatus';

const CACHE_KEY = 'searchableItems';

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
	// Only ever populated for Characters — the only category the API
	// (and the attribute filter panel) has these for.
	gender?: string;
	hair?: string;
}

export function useSearchableItems() {
	const [items, setItems] = useState<SearchItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [cachedAt, setCachedAt] = useState<number | null>(null);
	const { isOffline } = useNetworkStatus();

	// skipIfOffline is true only for the automatic mount-time load below —
	// a pure performance optimization (skip a fetch attempt that's very
	// likely doomed, per useNetworkStatus's best guess, rather than
	// waiting out six categories' worth of 10s timeouts). Both the
	// OfflineBanner's "Retry" button and starting a new search always
	// call fetchData() with no options, forcing a real fetch regardless
	// of what isOffline currently reports — web connectivity detection
	// isn't fully reliable (see useNetworkStatus.ts), so a stuck
	// isOffline: true must never be able to make either of those actions
	// a silent no-op.
	const fetchData = useCallback(
		async (options?: { skipIfOffline?: boolean }) => {
			setLoading(true);
			setError(null);
			setCachedAt(null);

			if (options?.skipIfOffline && isOffline) {
				const cached = await loadFromCache<SearchItem[]>(CACHE_KEY);
				if (cached) {
					setItems(cached.data);
					setCachedAt(cached.cachedAt);
				} else {
					setItems([]);
					setError('You’re offline, and there’s no saved data yet.');
				}
				setLoading(false);
				return;
			}

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

			const results = [
				burgers,
				characters,
				endCredits,
				episodes,
				trucks,
				stores,
			];
			results.forEach((result) => {
				if (result.status === 'rejected') {
					console.error('Error fetching searchable data:', result.reason);
				}
			});
			const anyRejected = results.some(
				(result) => result.status === 'rejected',
			);
			const allRejected = results.every(
				(result) => result.status === 'rejected',
			);

			// Total failure (not just one or two categories) is treated the
			// same as being offline: fall back to the last full successful
			// snapshot rather than showing an empty screen. A partial failure
			// is left exactly as before — the categories that DID load are
			// fresher than anything a cached snapshot could offer for them.
			if (allRejected) {
				const cached = await loadFromCache<SearchItem[]>(CACHE_KEY);
				if (cached) {
					setItems(cached.data);
					setCachedAt(cached.cachedAt);
					setError(null);
					setLoading(false);
					return;
				}
			}

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
						gender: character.gender,
						hair: character.hair,
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
			// Only a clean, complete fetch is saved as the fallback snapshot —
			// caching a partial result would mean a later total failure
			// falls back to a snapshot that was already missing categories.
			if (!anyRejected) {
				saveToCache(CACHE_KEY, normalized);
			}
			setLoading(false);
		},
		[isOffline],
	);

	useEffect(() => {
		fetchData({ skipIfOffline: true });
		// Re-running whenever isOffline flips is what makes Home
		// automatically recover the moment connectivity is detected
		// coming back — see fetchData's isOffline dependency above.
	}, [fetchData]);

	const retry = useCallback(() => fetchData(), [fetchData]);

	return { items, loading, error, retry, cachedAt };
}
