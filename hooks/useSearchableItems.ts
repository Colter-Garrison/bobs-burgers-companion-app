import { useCallback, useEffect, useState } from 'react'
import { FavoriteCategory } from '../lib/apiClient'
import { composeCharacterShortBio } from '../lib/categoryBio'
import { loadFromCache, saveToCache } from '../lib/dataCache'
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

export function useSearchableItems() {
	const [items, setItems] = useState<SearchItem[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [cachedAt, setCachedAt] = useState<number | null>(null)
	const { isOffline } = useNetworkStatus()

	const fetchData = useCallback(
		async (options?: { skipIfOffline?: boolean }) => {
			setLoading(true)
			setError(null)
			setCachedAt(null)

			if (options?.skipIfOffline && isOffline) {
				const cached = await loadFromCache<SearchItem[]>(CACHE_KEY)
				if (cached) {
					setItems(cached.data)
					setCachedAt(cached.cachedAt)
				} else {
					setItems([])
					setError('You’re offline, and there’s no saved data yet.')
				}
				setLoading(false)
				return
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

			const results = [
				burgers,
				characters,
				endCredits,
				episodes,
				trucks,
				stores,
			]
			results.forEach((result) => {
				if (result.status === 'rejected') {
					console.error('Error fetching searchable data:', result.reason)
				}
			})
			const anyRejected = results.some((result) => result.status === 'rejected')
			const allRejected = results.every(
				(result) => result.status === 'rejected',
			)

			if (allRejected) {
				const cached = await loadFromCache<SearchItem[]>(CACHE_KEY)
				if (cached) {
					setItems(cached.data)
					setCachedAt(cached.cachedAt)
					setError(null)
					setLoading(false)
					return
				}
			}

			setError(anyRejected ? 'Some results may be missing.' : null)

			const normalized: SearchItem[] = [
				...(burgers.status === 'fulfilled' ? burgers.value : []).map(
					(burger) => ({
						id: `burger-${burger.id}`,
						category: 'Burgers of the Day' as const,
						label: burger.name,
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

			setItems(normalized)
			if (!anyRejected) {
				saveToCache(CACHE_KEY, normalized)
			}
			setLoading(false)
		},
		[isOffline],
	)

	useEffect(() => {
		fetchData({ skipIfOffline: true })
	}, [fetchData])

	const retry = useCallback(() => fetchData(), [fetchData])

	return { items, loading, error, retry, cachedAt }
}
