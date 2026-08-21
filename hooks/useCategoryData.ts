import { useCallback, useEffect, useState } from 'react';
import { loadFromCache, saveToCache } from '../lib/dataCache';
import { useNetworkStatus } from './useNetworkStatus';

export function useCategoryData<T>(
	fetchFn: () => Promise<T[]>,
	cacheKey: string,
) {
	const [data, setData] = useState<T[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [cachedAt, setCachedAt] = useState<number | null>(null);
	const { isOffline } = useNetworkStatus();

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
	}, [load]);

	const retry = useCallback(() => load(), [load]);

	return { data, loading, error, retry, cachedAt };
}
