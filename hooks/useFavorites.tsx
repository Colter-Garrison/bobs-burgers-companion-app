import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import { useRouter } from 'expo-router';
import {
	ApiError,
	Favorite,
	FavoriteCategory,
	addFavoriteRequest,
	fetchFavorites,
	removeFavoriteRequest,
} from '../lib/apiClient';
import { useAuth } from './useAuth';

interface FavoritesContextValue {
	favorites: Favorite[];
	loading: boolean;
	isFavorited: (category: FavoriteCategory, itemId: number) => boolean;
	addFavorite: (category: FavoriteCategory, itemId: number) => Promise<void>;
	removeFavorite: (category: FavoriteCategory, itemId: number) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
	undefined,
);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
	const { token, logout } = useAuth();
	const router = useRouter();
	const [favorites, setFavorites] = useState<Favorite[]>([]);
	const [loading, setLoading] = useState(true);

	const handleSessionExpired = useCallback(
		(err: unknown) => {
			if (err instanceof ApiError && err.status === 401) {
				logout();
				router.push('/login');
				return true;
			}
			return false;
		},
		[logout, router],
	);

	useEffect(() => {
		if (!token) {
			setFavorites([]);
			setLoading(false);
			return;
		}
		setLoading(true);
		fetchFavorites(token)
			.then(setFavorites)
			.catch((err) => {
				handleSessionExpired(err);
			})
			.finally(() => setLoading(false));
	}, [token, handleSessionExpired]);

	const isFavorited = useCallback(
		(category: FavoriteCategory, itemId: number) =>
			favorites.some((f) => f.category === category && f.itemId === itemId),
		[favorites],
	);

	const addFavorite = useCallback(
		async (category: FavoriteCategory, itemId: number) => {
			if (!token) return;

			const optimistic: Favorite = {
				id: -Date.now(),
				userId: -1,
				category,
				itemId,
				createdAt: new Date().toISOString(),
			};
			setFavorites((prev) => [...prev, optimistic]);

			try {
				const saved = await addFavoriteRequest(token, category, itemId);
				setFavorites((prev) => prev.map((f) => (f === optimistic ? saved : f)));
			} catch (err) {
				if (err instanceof ApiError && err.status === 409) return;

				setFavorites((prev) => prev.filter((f) => f !== optimistic));
				handleSessionExpired(err);
			}
		},
		[token, handleSessionExpired],
	);

	const removeFavorite = useCallback(
		async (category: FavoriteCategory, itemId: number) => {
			if (!token) return;

			const previous = favorites;
			setFavorites((prev) =>
				prev.filter((f) => !(f.category === category && f.itemId === itemId)),
			);

			try {
				await removeFavoriteRequest(token, category, itemId);
			} catch (err) {
				if (err instanceof ApiError && err.status === 404) return;

				setFavorites(previous);
				handleSessionExpired(err);
			}
		},
		[token, favorites, handleSessionExpired],
	);

	return (
		<FavoritesContext.Provider
			value={{ favorites, loading, isFavorited, addFavorite, removeFavorite }}
		>
			{children}
		</FavoritesContext.Provider>
	);
}

export function useFavorites(): FavoritesContextValue {
	const context = useContext(FavoritesContext);
	if (!context) {
		throw new Error('useFavorites must be used within a FavoritesProvider');
	}
	return context;
}
