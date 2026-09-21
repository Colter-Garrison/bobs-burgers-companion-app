import { useCallback, useEffect, useState } from 'react'
import { LoadOutcome, loadWithCache } from '../lib/loadWithCache'
import { useNetworkStatus } from './useNetworkStatus'

export function useCategoryData<T>(
	fetchFn: () => Promise<T[]>,
	cacheKey: string,
) {
	const [data, setData] = useState<T[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [cachedAt, setCachedAt] = useState<number | null>(null)
	const { isOffline } = useNetworkStatus()

	// Reset to a loading state when the inputs change during render, not
	// in the effect — React's recommended way to adjust state when inputs
	// change. The effect below then only runs the async load.
	const requestKey = `${cacheKey}|${isOffline}`
	const [prevRequestKey, setPrevRequestKey] = useState(requestKey)
	if (requestKey !== prevRequestKey) {
		setPrevRequestKey(requestKey)
		setLoading(true)
		setError(null)
		setCachedAt(null)
	}

	const applyOutcome = useCallback((outcome: LoadOutcome<T[]>) => {
		if (outcome.data !== undefined) setData(outcome.data)
		setError(outcome.error)
		setCachedAt(outcome.cachedAt)
		setLoading(false)
	}, [])

	useEffect(() => {
		let ignore = false
		loadWithCache(fetchFn, cacheKey, {
			cacheOnly: isOffline,
			emptyValue: [],
		}).then((outcome) => {
			if (!ignore) applyOutcome(outcome)
		})
		return () => {
			ignore = true
		}
	}, [fetchFn, cacheKey, isOffline, applyOutcome])

	// Retry always tries the network, even when known to be offline.
	const retry = useCallback(async () => {
		setLoading(true)
		setError(null)
		setCachedAt(null)
		applyOutcome(
			await loadWithCache(fetchFn, cacheKey, {
				cacheOnly: false,
				emptyValue: [],
			}),
		)
	}, [fetchFn, cacheKey, applyOutcome])

	return { data, loading, error, retry, cachedAt }
}
