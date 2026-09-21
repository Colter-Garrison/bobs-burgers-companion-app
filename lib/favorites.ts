import AsyncStorage from '@react-native-async-storage/async-storage'

export type FavoriteCategory =
	| 'burger'
	| 'character'
	| 'end_credit'
	| 'episode'
	| 'pest_control_truck'
	| 'store'

export interface Favorite {
	category: FavoriteCategory
	itemId: number
	createdAt: string
}

const FAVORITES_KEY = 'bbca_favorites'

const FAVORITE_CATEGORIES: readonly FavoriteCategory[] = [
	'burger',
	'character',
	'end_credit',
	'episode',
	'pest_control_truck',
	'store',
]

// Storage is user-editable (devtools) and outlives app versions, so only
// entries that still match today's shape are trusted — the same lesson as
// the stale colorblind-mode value that once crashed useTheme on launch.
function isFavorite(value: unknown): value is Favorite {
	if (typeof value !== 'object' || value === null) return false
	const { category, itemId, createdAt } = value as Record<string, unknown>
	return (
		FAVORITE_CATEGORIES.includes(category as FavoriteCategory) &&
		typeof itemId === 'number' &&
		Number.isInteger(itemId) &&
		typeof createdAt === 'string'
	)
}

export async function loadFavorites(): Promise<Favorite[]> {
	try {
		const raw = await AsyncStorage.getItem(FAVORITES_KEY)
		if (!raw) return []
		const parsed: unknown = JSON.parse(raw)
		return Array.isArray(parsed) ? parsed.filter(isFavorite) : []
	} catch {
		return []
	}
}

export async function saveFavorites(favorites: Favorite[]): Promise<void> {
	try {
		await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
	} catch {
		// Private browsing or full storage: favorites still work for this
		// visit, they just won't survive a reload.
	}
}
