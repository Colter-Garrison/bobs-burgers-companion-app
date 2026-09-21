import { useCallback, useEffect, useState } from 'react'
import { FavoriteCategory } from '../lib/favorites'
import { composeCharacterShortBio } from '../lib/categoryBio'
import { loadFromCache, saveToCache } from '../lib/dataCache'
import { LoadOutcome, OFFLINE_NO_CACHE_MESSAGE } from '../lib/loadWithCache'
import {
	DEV_CHARACTER_ID,
	DEV_CHARACTER_SHORT_BIO,
	getCharactersWithDev,
} from '../lib/devCharacter'
import { getBurgersOfTheDay } from './fetchBurgersOfTheDay'
import { getEndCreditsSequences } from './fetchEndCreditsSequences'
import { getEpisodes } from './fetchEpisodes'
import { getPestControlTrucks } from './fetchPestControlTrucks'
import { getStoresNextDoor } from './fetchStoresNextDoor'
import { useNetworkStatus } from './useNetworkStatus'

const CACHE_KEY = 'searchableItems'

export type SearchCategory =
	| 'Burgers of the Day'
	| 'Characters'
	| 'End Credits'
	| 'Episodes'
	| 'Pest Control Trucks'
	| 'Stores Next Door'

export interface SearchItem {
	id: string
	category: SearchCategory
	label: string
	image?: string
	itemId: number
	favoriteCategory: FavoriteCategory
	gender?: string
	hair?: string
	bio?: string
}

// Returns what the hook's state should become, rather than setting it, so
// the hook can apply it from an effect's .then (see useCategoryData).
async function loadSearchableItems(
	cacheOnly: boolean,
): Promise<LoadOutcome<SearchItem[]>> {
	if (cacheOnly) {
		const cached = await loadFromCache<SearchItem[]>(CACHE_KEY)
		return cached
			? { data: cached.data, error: null, cachedAt: cached.cachedAt }
			: { data: [], error: OFFLINE_NO_CACHE_MESSAGE, cachedAt: null }
	}

	const [burgers, characters, endCredits, episodes, trucks, stores] =
		await Promise.allSettled([
			getBurgersOfTheDay(),
			getCharactersWithDev(),
			getEndCreditsSequences(),
			getEpisodes(),
			getPestControlTrucks(),
			getStoresNextDoor(),
		])

	const results = [burgers, characters, endCredits, episodes, trucks, stores]
	results.forEach((result) => {
		if (result.status === 'rejected') {
			console.error('Error fetching searchable data:', result.reason)
		}
	})
	const anyRejected = results.some((result) => result.status === 'rejected')
	const allRejected = results.every((result) => result.status === 'rejected')

	if (allRejected) {
		const cached = await loadFromCache<SearchItem[]>(CACHE_KEY)
		if (cached) {
			return { data: cached.data, error: null, cachedAt: cached.cachedAt }
		}
	}

	const normalized: SearchItem[] = [
		...(burgers.status === 'fulfilled' ? burgers.value : []).map((burger) => ({
			id: `burger-${burger.id}`,
			category: 'Burgers of the Day' as const,
			label: burger.name,
			itemId: burger.id,
			favoriteCategory: 'burger' as const,
		})),
		...(characters.status === 'fulfilled' ? characters.value : []).map(
			(character) => ({
				id: `character-${character.id}`,
				category: 'Characters' as const,
				label: character.name,
				image: character.image,
				itemId: character.id,
				favoriteCategory: 'character' as const,
				gender: character.gender,
				hair: character.hair,
				bio:
					character.id === DEV_CHARACTER_ID
						? DEV_CHARACTER_SHORT_BIO
						: composeCharacterShortBio(character),
			}),
		),
		...(endCredits.status === 'fulfilled' ? endCredits.value : []).map(
			(credit) => ({
				id: `endCredits-${credit.id}`,
				category: 'End Credits' as const,
				label: `Season ${credit.season}, Episode ${credit.episode}`,
				image: credit.image,
				itemId: credit.id,
				favoriteCategory: 'end_credit' as const,
			}),
		),
		...(episodes.status === 'fulfilled' ? episodes.value : []).map(
			(episode) => ({
				id: `episode-${episode.id}`,
				category: 'Episodes' as const,
				label: episode.name,
				itemId: episode.id,
				favoriteCategory: 'episode' as const,
			}),
		),
		...(trucks.status === 'fulfilled' ? trucks.value : []).map((truck) => ({
			id: `truck-${truck.id}`,
			category: 'Pest Control Trucks' as const,
			label: truck.name,
			image: truck.image,
			itemId: truck.id,
			favoriteCategory: 'pest_control_truck' as const,
		})),
		...(stores.status === 'fulfilled' ? stores.value : []).map((store) => ({
			id: `store-${store.id}`,
			category: 'Stores Next Door' as const,
			label: store.name,
			image: store.image,
			itemId: store.id,
			favoriteCategory: 'store' as const,
		})),
	]

	if (!anyRejected) {
		saveToCache(CACHE_KEY, normalized)
	}
	return {
		data: normalized,
		error: anyRejected ? 'Some results may be missing.' : null,
		cachedAt: null,
	}
}

export function useSearchableItems() {
	const [items, setItems] = useState<SearchItem[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [cachedAt, setCachedAt] = useState<number | null>(null)
	const { isOffline } = useNetworkStatus()

	// See useCategoryData: reset during render when the inputs change, so
	// the effect below only runs the async load.
	const [prevIsOffline, setPrevIsOffline] = useState(isOffline)
	if (isOffline !== prevIsOffline) {
		setPrevIsOffline(isOffline)
		setLoading(true)
		setError(null)
		setCachedAt(null)
	}

	const applyOutcome = useCallback((outcome: LoadOutcome<SearchItem[]>) => {
		if (outcome.data !== undefined) setItems(outcome.data)
		setError(outcome.error)
		setCachedAt(outcome.cachedAt)
		setLoading(false)
	}, [])

	useEffect(() => {
		let ignore = false
		loadSearchableItems(isOffline).then((outcome) => {
			if (!ignore) applyOutcome(outcome)
		})
		return () => {
			ignore = true
		}
	}, [isOffline, applyOutcome])

	// Retry always tries the network, even when known to be offline.
	const retry = useCallback(async () => {
		setLoading(true)
		setError(null)
		setCachedAt(null)
		applyOutcome(await loadSearchableItems(false))
	}, [applyOutcome])

	return { items, loading, error, retry, cachedAt }
}
