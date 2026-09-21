import { useCallback, useEffect, useState } from 'react'
import { LoadOutcome, loadWithCache } from '../lib/loadWithCache'
import { useNetworkStatus } from './useNetworkStatus'

export function useCategoryItem<T>(
	fetchFn: (id: number) => Promise<T>,
	cacheKey: string,
	id: number | null,
) {
	const [data, setData] = useState<T | null>(null)
	const [loading, setLoading] = useState(id !== null)
	const [error, setError] = useState<string | null>(null)
	const [cachedAt, setCachedAt] = useState<number | null>(null)
	const { isOffline } = useNetworkStatus()

	// See useCategoryData: reset during render when the inputs change, so
	// the effect below only runs the async load.
	const requestKey = `${cacheKey}|${id}|${isOffline}`
	const [prevRequestKey, setPrevRequestKey] = useState(requestKey)
	if (requestKey !== prevRequestKey) {
		setPrevRequestKey(requestKey)
		setLoading(id !== null)
		setError(null)
		setCachedAt(null)
	}

	const applyOutcome = useCallback((outcome: LoadOutcome<T | null>) => {
		if (outcome.data !== undefined) setData(outcome.data)
		setError(outcome.error)
		setCachedAt(outcome.cachedAt)
		setLoading(false)
	}, [])

	useEffect(() => {
		if (id === null) return
		// The ignore flag drops a slow response for a previous id, so it
		// can't overwrite the item now being shown.
		let ignore = false
		loadWithCache<T | null>(() => fetchFn(id), cacheKey, {
			cacheOnly: isOffline,
			emptyValue: null,
		}).then((outcome) => {
			if (!ignore) applyOutcome(outcome)
		})
		return () => {
			ignore = true
		}
	}, [fetchFn, cacheKey, id, isOffline, applyOutcome])

	// Retry always tries the network, even when known to be offline.
	const retry = useCallback(async () => {
		if (id === null) return
		setLoading(true)
		setError(null)
		setCachedAt(null)
		applyOutcome(
			await loadWithCache<T | null>(() => fetchFn(id), cacheKey, {
				cacheOnly: false,
				emptyValue: null,
			}),
		)
	}, [fetchFn, cacheKey, id, applyOutcome])

	return { data, loading, error, retry, cachedAt }
}
