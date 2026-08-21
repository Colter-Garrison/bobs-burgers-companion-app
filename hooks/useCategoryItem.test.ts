import { act, renderHook, waitFor } from '@testing-library/react-native'
import { useCategoryItem } from './useCategoryItem'
import { loadFromCache, saveToCache } from '../lib/dataCache'
import { useNetworkStatus } from './useNetworkStatus'

jest.mock('../lib/dataCache')
jest.mock('./useNetworkStatus')

describe('useCategoryItem', () => {
	beforeEach(() => {
		;(useNetworkStatus as jest.Mock).mockReturnValue({ isOffline: false })
		;(loadFromCache as jest.Mock).mockResolvedValue(null)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('starts loading, then resolves to the fetched item', async () => {
		const fetchFn = jest.fn().mockResolvedValue({ id: 1, name: 'Bob' })

		const { result } = renderHook(() => useCategoryItem(fetchFn, 'testKey', 1))

		expect(result.current.loading).toBe(true)
		await waitFor(() => expect(result.current.loading).toBe(false))

		expect(fetchFn).toHaveBeenCalledWith(1)
		expect(result.current.data).toEqual({ id: 1, name: 'Bob' })
		expect(result.current.error).toBeNull()
	})

	it('saves a successful fetch to the cache', async () => {
		const fetchFn = jest.fn().mockResolvedValue({ id: 1, name: 'Bob' })

		renderHook(() => useCategoryItem(fetchFn, 'testKey', 1))
		await waitFor(() => expect(saveToCache).toHaveBeenCalled())

		expect(saveToCache).toHaveBeenCalledWith('testKey', { id: 1, name: 'Bob' })
	})

	it('exposes the error message and null data when the fetch fails and there is no cache', async () => {
		const fetchFn = jest.fn().mockRejectedValue(new Error('network down'))

		const { result } = renderHook(() => useCategoryItem(fetchFn, 'testKey', 1))
		await waitFor(() => expect(result.current.loading).toBe(false))

		expect(result.current.data).toBeNull()
		expect(result.current.error).toBe('network down')
	})

	it('falls back to cached data (no hard error) when the fetch fails and a cache exists', async () => {
		const fetchFn = jest.fn().mockRejectedValue(new Error('network down'))
		;(loadFromCache as jest.Mock).mockResolvedValue({
			data: { id: 1, name: 'Bob' },
			cachedAt: 123,
		})

		const { result } = renderHook(() => useCategoryItem(fetchFn, 'testKey', 1))
		await waitFor(() => expect(result.current.loading).toBe(false))

		expect(result.current.data).toEqual({ id: 1, name: 'Bob' })
		expect(result.current.error).toBeNull()
		expect(result.current.cachedAt).toBe(123)
	})

	it('skips the network call entirely when already known to be offline, and uses the cache', async () => {
		;(useNetworkStatus as jest.Mock).mockReturnValue({ isOffline: true })
		;(loadFromCache as jest.Mock).mockResolvedValue({
			data: { id: 1, name: 'Bob' },
			cachedAt: 456,
		})
		const fetchFn = jest.fn()

		const { result } = renderHook(() => useCategoryItem(fetchFn, 'testKey', 1))
		await waitFor(() => expect(result.current.loading).toBe(false))

		expect(fetchFn).not.toHaveBeenCalled()
		expect(result.current.data).toEqual({ id: 1, name: 'Bob' })
		expect(result.current.cachedAt).toBe(456)
	})

	it('retry always attempts a real fetch, even while isOffline is still true', async () => {
		;(useNetworkStatus as jest.Mock).mockReturnValue({ isOffline: true })
		;(loadFromCache as jest.Mock).mockResolvedValue({
			data: { id: 1, name: 'stale' },
			cachedAt: 456,
		})
		const fetchFn = jest.fn().mockResolvedValue({ id: 1, name: 'fresh' })

		const { result } = renderHook(() => useCategoryItem(fetchFn, 'testKey', 1))
		await waitFor(() => expect(result.current.loading).toBe(false))
		expect(fetchFn).not.toHaveBeenCalled()

		await act(async () => {
			await result.current.retry()
		})

		expect(fetchFn).toHaveBeenCalledTimes(1)
		expect(result.current.data).toEqual({ id: 1, name: 'fresh' })
		expect(result.current.cachedAt).toBeNull()
	})

	it('does not fetch (or error) when id is null, and just settles as not-loading', async () => {
		const fetchFn = jest.fn()

		const { result } = renderHook(() =>
			useCategoryItem(fetchFn, 'testKey', null),
		)
		await waitFor(() => expect(result.current.loading).toBe(false))

		expect(fetchFn).not.toHaveBeenCalled()
		expect(result.current.data).toBeNull()
		expect(result.current.error).toBeNull()
	})

	it('starts fetching once a null id becomes a real one', async () => {
		const fetchFn = jest.fn().mockResolvedValue({ id: 5, name: 'Linda' })

		const { result, rerender } = renderHook(
			({ id }: { id: number | null }) =>
				useCategoryItem(fetchFn, 'testKey', id),
			{ initialProps: { id: null } },
		)
		await waitFor(() => expect(result.current.loading).toBe(false))
		expect(fetchFn).not.toHaveBeenCalled()

		rerender({ id: 5 })
		await waitFor(() => expect(fetchFn).toHaveBeenCalledWith(5))
		await waitFor(() =>
			expect(result.current.data).toEqual({ id: 5, name: 'Linda' }),
		)
	})

	it('re-fetches when the id changes', async () => {
		const fetchFn = jest
			.fn()
			.mockResolvedValueOnce({ id: 1, name: 'first' })
			.mockResolvedValueOnce({ id: 2, name: 'second' })

		const { result, rerender } = renderHook(
			({ id }: { id: number }) => useCategoryItem(fetchFn, 'testKey', id),
			{ initialProps: { id: 1 } },
		)
		await waitFor(() => expect(result.current.loading).toBe(false))
		expect(result.current.data).toEqual({ id: 1, name: 'first' })

		rerender({ id: 2 })
		await waitFor(() =>
			expect(result.current.data).toEqual({ id: 2, name: 'second' }),
		)

		expect(fetchFn).toHaveBeenNthCalledWith(2, 2)
	})
})
