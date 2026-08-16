import { useCallback, useEffect, useState } from 'react';
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

// Call this once per screen, not once per favorite button — a 50-item
// list must not fire 50 concurrent GET /favorites calls. Screens pass
// isFavorited/addFavorite/removeFavorite down as props instead.
export function useFavorites() {
	const { token, logout } = useAuth();
	const router = useRouter();
	const [favorites, setFavorites] = useState<Favorite[]>([]);
	const [loading, setLoading] = useState(true);

	// A 401 here means the token expired or the account it names was
	// since deleted (requireAuth re-checks the user still exists on
	// every request) — either way, that's a session-expired signal, not
	// a generic error, so it logs the user out and sends them to log in
	// again rather than surfacing a confusing failure.
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
				// 409 means the backend already considers this item
				// favorited — the optimistic entry already reflects that
				// correctly, so there's nothing to roll back.
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
				// 404 means the backend already has no such favorite — the
				// optimistic removal already reflects that correctly.
				if (err instanceof ApiError && err.status === 404) return;

				setFavorites(previous);
				handleSessionExpired(err);
			}
		},
		[token, favorites, handleSessionExpired],
	);

	return { favorites, loading, isFavorited, addFavorite, removeFavorite };
}
