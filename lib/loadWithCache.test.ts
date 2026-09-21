import { loadWithCache, OFFLINE_NO_CACHE_MESSAGE } from './loadWithCache'
import { loadFromCache, saveToCache } from './dataCache'

jest.mock('./dataCache')

describe('loadWithCache', () => {
	beforeEach(() => {
		;(loadFromCache as jest.Mock).mockResolvedValue(null)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('returns fresh data and saves it to the cache', async () => {
		const fetchFn = jest.fn().mockResolvedValue([1, 2])

		const outcome = await loadWithCache(fetchFn, 'key', {
			cacheOnly: false,
			emptyValue: [],
		})

		expect(outcome).toEqual({ data: [1, 2], error: null, cachedAt: null })
		expect(saveToCache).toHaveBeenCalledWith('key', [1, 2])
	})

	it('falls back to the cache when the fetch fails', async () => {
		;(loadFromCache as jest.Mock).mockResolvedValue({
			data: [9],
			cachedAt: 123,
		})

		const outcome = await loadWithCache(
			jest.fn().mockRejectedValue(new Error('down')),
			'key',
			{ cacheOnly: false, emptyValue: [] },
		)

		expect(outcome).toEqual({ data: [9], error: null, cachedAt: 123 })
	})

	it('reports the error and leaves data untouched when the fetch fails with nothing cached', async () => {
		const outcome = await loadWithCache(
			jest.fn().mockRejectedValue(new Error('down')),
			'key',
			{ cacheOnly: false, emptyValue: [] },
		)

		expect(outcome).toEqual({ error: 'down', cachedAt: null })
		expect('data' in outcome).toBe(false)
	})

	it('skips the network entirely in cache-only mode', async () => {
		const fetchFn = jest.fn()
		;(loadFromCache as jest.Mock).mockResolvedValue({ data: [9], cachedAt: 5 })

		const outcome = await loadWithCache(fetchFn, 'key', {
			cacheOnly: true,
			emptyValue: [],
		})

		expect(fetchFn).not.toHaveBeenCalled()
		expect(outcome).toEqual({ data: [9], error: null, cachedAt: 5 })
	})

	it('returns the empty value and the offline message in cache-only mode with nothing cached', async () => {
		const outcome = await loadWithCache(jest.fn(), 'key', {
			cacheOnly: true,
			emptyValue: [],
		})

		expect(outcome).toEqual({
			data: [],
			error: OFFLINE_NO_CACHE_MESSAGE,
			cachedAt: null,
		})
	})
})
