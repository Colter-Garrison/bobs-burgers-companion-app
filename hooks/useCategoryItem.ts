import { useCallback, useEffect, useState } from 'react';
import { loadFromCache, saveToCache } from '../lib/dataCache';
import { useNetworkStatus } from './useNetworkStatus';

// Single-item counterpart to useCategoryData.ts — same network-first,
// cache-as-fallback, offline-aware behavior, just for one record (the
// detail page, app/detail/[category]/[id].tsx) instead of a whole list
// (the six category screens). See useCategoryData.ts for the full
// reasoning; kept as a separate hook rather than a shared generic since
// "one item" vs "a list" changes the empty/initial state (null vs []) at
// every call site, not just internally.
//
// id may be null — used for the detail page's "associated episode"
// fetch (Burger/EndCredit/Truck/Store don't have their own wiki page,
// only the episode they're from does), whose id isn't known until the
// primary item has already loaded. Hooks can't be called conditionally,
// so this accepts null and simply doesn't fetch instead, rather than the
// call site needing a placeholder id that would trigger a wasted (and
// wrong) network request.
export function useCategoryItem<T>(
	fetchFn: (id: number) => Promise<T>,
	cacheKey: string,
	id: number | null,
) {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [cachedAt, setCachedAt] = useState<number | null>(null);
	const { isOffline } = useNetworkStatus();

	const load = useCallback(
		async (options?: { skipIfOffline?: boolean }) => {
			if (id === null) {
				setLoading(false);
				return;
			}

			setLoading(true);
			setError(null);
			setCachedAt(null);

			if (options?.skipIfOffline && isOffline) {
				const cached = await loadFromCache<T>(cacheKey);
				if (cached) {
					setData(cached.data);
					setCachedAt(cached.cachedAt);
				} else {
					setData(null);
					setError('You’re offline, and there’s no saved data yet.');
				}
				setLoading(false);
				return;
			}

			try {
				const result = await fetchFn(id);
				setData(result);
				saveToCache(cacheKey, result);
			} catch (err) {
				const cached = await loadFromCache<T>(cacheKey);
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
		[fetchFn, cacheKey, id, isOffline],
	);

	useEffect(() => {
		load({ skipIfOffline: true });
	}, [load]);

	const retry = useCallback(() => load(), [load]);

	return { data, loading, error, retry, cachedAt };
}
