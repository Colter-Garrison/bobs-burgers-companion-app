import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react'
import {
	Favorite,
	FavoriteCategory,
	loadFavorites,
	saveFavorites,
	subscribeToFavoriteChanges,
} from '../lib/favorites'

interface FavoritesContextValue {
	favorites: Favorite[]
	loading: boolean
	isFavorited: (category: FavoriteCategory, itemId: number) => boolean
	addFavorite: (category: FavoriteCategory, itemId: number) => Promise<void>
	removeFavorite: (category: FavoriteCategory, itemId: number) => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
	undefined,
)

function matches(f: Favorite, category: FavoriteCategory, itemId: number) {
	return f.category === category && f.itemId === itemId
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
	const [favorites, setFavorites] = useState<Favorite[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		loadFavorites().then((saved) => {
			// Merge rather than replace: anything favorited in the moment
			// before storage finished loading would otherwise be dropped.
			setFavorites((current) => [
				...saved,
				...current.filter(
					(f) => !saved.some((s) => matches(s, f.category, f.itemId)),
				),
			])
			setLoading(false)
		})
	}, [])

	useEffect(
		() =>
			subscribeToFavoriteChanges(() => {
				loadFavorites().then(setFavorites)
			}),
		[],
	)

	// Only save after the initial load — saving the empty starting list
	// first would wipe out what's stored before it was ever read.
	useEffect(() => {
		if (!loading) {
			saveFavorites(favorites)
		}
	}, [favorites, loading])

	const isFavorited = useCallback(
		(category: FavoriteCategory, itemId: number) =>
			favorites.some((f) => matches(f, category, itemId)),
		[favorites],
	)

	const addFavorite = useCallback(
		async (category: FavoriteCategory, itemId: number) => {
			setFavorites((prev) =>
				prev.some((f) => matches(f, category, itemId))
					? prev
					: [
							...prev,
							{ category, itemId, createdAt: new Date().toISOString() },
						],
			)
		},
		[],
	)

	const removeFavorite = useCallback(
		async (category: FavoriteCategory, itemId: number) => {
			setFavorites((prev) => prev.filter((f) => !matches(f, category, itemId)))
		},
		[],
	)

	return (
		<FavoritesContext.Provider
			value={{ favorites, loading, isFavorited, addFavorite, removeFavorite }}
		>
			{children}
		</FavoritesContext.Provider>
	)
}

export function useFavorites(): FavoritesContextValue {
	const context = useContext(FavoritesContext)
	if (!context) {
		throw new Error('useFavorites must be used within a FavoritesProvider')
	}
	return context
}
