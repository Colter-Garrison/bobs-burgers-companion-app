import { loadFromCache, saveToCache } from './dataCache'

export const OFFLINE_NO_CACHE_MESSAGE =
	'You’re offline, and there’s no saved data yet.'

// What a load should change in a hook's state. `data` is omitted when the
// existing data should be left alone (a failed fetch with nothing cached).
export interface LoadOutcome<T> {
	data?: T
	error: string | null
	cachedAt: number | null
}

// Network-first, cache-as-fallback (see priority #7 in CLAUDE.md). With
// `cacheOnly` (already known to be offline) it skips the network and its
// timeout entirely. Returns the outcome instead of setting state, so hooks
// can apply it from an effect's .then — and ignore it if it went stale.
export async function loadWithCache<T>(
	fetchFn: () => Promise<T>,
	cacheKey: string,
	{ cacheOnly, emptyValue }: { cacheOnly: boolean; emptyValue: T },
): Promise<LoadOutcome<T>> {
	if (cacheOnly) {
		const cached = await loadFromCache<T>(cacheKey)
		return cached
			? { data: cached.data, error: null, cachedAt: cached.cachedAt }
			: { data: emptyValue, error: OFFLINE_NO_CACHE_MESSAGE, cachedAt: null }
	}

	try {
		const result = await fetchFn()
		saveToCache(cacheKey, result)
		return { data: result, error: null, cachedAt: null }
	} catch (err) {
		const cached = await loadFromCache<T>(cacheKey)
		return cached
			? { data: cached.data, error: null, cachedAt: cached.cachedAt }
			: {
					error: err instanceof Error ? err.message : 'Something went wrong.',
					cachedAt: null,
				}
	}
}
