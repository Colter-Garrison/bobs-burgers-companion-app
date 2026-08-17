import { useCallback, useEffect, useState } from 'react';
import { loadFromCache, saveToCache } from '../lib/dataCache';
import { useNetworkStatus } from './useNetworkStatus';

// Shared by all six category screens (Burgers, Characters, End Credits,
// Episodes, Pest Control Trucks, Stores) — pass the module-level fetch
// function directly (e.g. `useCategoryData(getBurgersOfTheDay, 'burgers')`),
// not an inline wrapper. A fresh inline function would change identity
// every render and re-trigger the fetch effect on every render; the
// imported fetch functions are stable references, so this dependency is
// safe as-is.
//
// cacheKey identifies this category's slot in the on-device cache
// (lib/dataCache.ts) — network is always tried first; the cache is only
// ever read as a fallback, so there's no staleness policy to reason
// about here beyond "prefer live data whenever it's reachable."
export function useCategoryData<T>(
	fetchFn: () => Promise<T[]>,
	cacheKey: string,
) {
	const [data, setData] = useState<T[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [cachedAt, setCachedAt] = useState<number | null>(null);
	const { isOffline } = useNetworkStatus();

	// skipIfOffline is true only for the automatic load below — it's a
	// pure performance optimization (skip a fetch attempt that's very
	// likely doomed, per useNetworkStatus's best guess, rather than
	// waiting out its 10s timeout). An explicit user-initiated retry
	// (the OfflineBanner/ErrorState "Retry" button) always attempts a
	// real fetch regardless of what isOffline currently reports — web
	// connectivity detection isn't fully reliable (see
	// useNetworkStatus.ts), so a stuck isOffline: true must never be able
	// to make the user's own explicit "try again" a silent no-op.
	const load = useCallback(
		async (options?: { skipIfOffline?: boolean }) => {
			setLoading(true);
			setError(null);
			setCachedAt(null);

			if (options?.skipIfOffline && isOffline) {
				const cached = await loadFromCache<T[]>(cacheKey);
				if (cached) {
					setData(cached.data);
					setCachedAt(cached.cachedAt);
				} else {
					setData([]);
					setError('You’re offline, and there’s no saved data yet.');
				}
				setLoading(false);
				return;
			}

			try {
				const result = await fetchFn();
				setData(result);
				saveToCache(cacheKey, result);
			} catch (err) {
				const cached = await loadFromCache<T[]>(cacheKey);
				if (cached) {
					setData(cached.data);
					setCachedAt(cached.cachedAt);
				} else {
					setError(
						err instanceof Error ? err.message : 'Something went wrong.',
					);
				}
			} finally {
				setLoading(false);
			}
		},
		[fetchFn, cacheKey, isOffline],
	);

	useEffect(() => {
		load({ skipIfOffline: true });
		// Re-running whenever isOffline flips is what makes a screen
		// automatically recover the moment connectivity is detected
		// coming back — see load's isOffline dependency above.
	}, [load]);

	const retry = useCallback(() => load(), [load]);

	return { data, loading, error, retry, cachedAt };
}
