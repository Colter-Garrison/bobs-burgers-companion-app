import React, { createContext, useCallback, useContext, useState } from 'react'
import { Favorite, FavoriteCategory } from '../lib/favorites'

// Favorites live only in memory for now — they reset on reload. Accounts
// were removed, and the persistent storage that replaces the server-backed
// list lands separately.

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

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
	const [favorites, setFavorites] = useState<Favorite[]>([])

	const isFavorited = useCallback(
		(category: FavoriteCategory, itemId: number) =>
			favorites.some((f) => f.category === category && f.itemId === itemId),
		[favorites],
	)

	const addFavorite = useCallback(
		async (category: FavoriteCategory, itemId: number) => {
			setFavorites((prev) =>
				prev.some((f) => f.category === category && f.itemId === itemId)
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
			setFavorites((prev) =>
				prev.filter((f) => !(f.category === category && f.itemId === itemId)),
			)
		},
		[],
	)

	return (
		<FavoritesContext.Provider
			value={{
				favorites,
				loading: false,
				isFavorited,
				addFavorite,
				removeFavorite,
			}}
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
