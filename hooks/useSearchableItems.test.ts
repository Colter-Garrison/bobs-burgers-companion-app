import { act, renderHook, waitFor } from '@testing-library/react-native'
import { useSearchableItems } from './useSearchableItems'
import { getBurgersOfTheDay } from './fetchBurgersOfTheDay'
import { getCharacters } from './fetchCharacters'
import { getEndCreditsSequences } from './fetchEndCreditsSequences'
import { getEpisodes } from './fetchEpisodes'
import { getPestControlTrucks } from './fetchPestControlTrucks'
import { getStoresNextDoor } from './fetchStoresNextDoor'
import { loadFromCache, saveToCache } from '../lib/dataCache'
import { useNetworkStatus } from './useNetworkStatus'

jest.mock('./fetchBurgersOfTheDay')
jest.mock('./fetchCharacters')
jest.mock('./fetchEndCreditsSequences')
jest.mock('./fetchEpisodes')
jest.mock('./fetchPestControlTrucks')
jest.mock('./fetchStoresNextDoor')
jest.mock('../lib/dataCache')
jest.mock('./useNetworkStatus')

describe('useSearchableItems', () => {
	beforeEach(() => {
		;(getBurgersOfTheDay as jest.Mock).mockResolvedValue([
			{ id: 1, name: 'Burger A', episodeUrl: 'https://a' },
		])
		;(getCharacters as jest.Mock).mockResolvedValue([
			{ id: 2, name: 'Bob', image: 'https://img', wikiUrl: 'https://wiki' },
		])
		;(getEndCreditsSequences as jest.Mock).mockResolvedValue([
			{
				id: 3,
				image: 'https://img2',
				season: 1,
				episode: 2,
				episodeUrl: 'https://ec',
			},
		])
		;(getEpisodes as jest.Mock).mockResolvedValue([])
		;(getPestControlTrucks as jest.Mock).mockResolvedValue([])
		;(getStoresNextDoor as jest.Mock).mockResolvedValue([])

		;(useNetworkStatus as jest.Mock).mockReturnValue({ isOffline: false })
		;(loadFromCache as jest.Mock).mockResolvedValue(null)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('starts loading, then normalizes and id-prefixes items from every source', async () => {
		const { result } = renderHook(() => useSearchableItems())

		expect(result.current.loading).toBe(true)

		await waitFor(() => expect(result.current.loading).toBe(false))

		expect(result.current.items).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: 'burger-1',
					category: 'Burgers of the Day',
					label: 'Burger A',
				}),
				expect.objectContaining({
					id: 'character-2',
					category: 'Characters',
					label: 'Bob',
				}),
				expect.objectContaining({
					id: 'endCredits-3',
					category: 'End Credits',
					label: 'Season 1, Episode 2',
				}),
			]),
		)
	})

	it("keeps the other five sources' results and surfaces an error when one source rejects", async () => {
		;(getCharacters as jest.Mock).mockRejectedValue(new Error('boom'))

		const { result } = renderHook(() => useSearchableItems())
		await waitFor(() => expect(result.current.loading).toBe(false))

		expect(result.current.items).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ id: 'burger-1' }),
				expect.objectContaining({ id: 'endCredits-3' }),
			]),
		)
		expect(
			result.current.items.some((item) => item.id.startsWith('character-')),
		).toBe(false)
		expect(result.current.error).toBe('Some results may be missing.')
	})

	it('retry re-runs every source and can clear a prior error', async () => {
		;(getCharacters as jest.Mock).mockRejectedValueOnce(new Error('boom'))

		const { result } = renderHook(() => useSearchableItems())
		await waitFor(() => expect(result.current.loading).toBe(false))
		expect(result.current.error).toBe('Some results may be missing.')

		await act(async () => {
			await result.current.retry()
		})

		expect(result.current.error).toBeNull()
		expect(result.current.items).toEqual(
			expect.arrayContaining([expect.objectContaining({ id: 'character-2' })]),
		)
	})

	it('saves a clean, fully-successful fetch to the cache', async () => {
		const { result } = renderHook(() => useSearchableItems())
		await waitFor(() => expect(result.current.loading).toBe(false))

		expect(saveToCache).toHaveBeenCalledWith(
			'searchableItems',
			expect.arrayContaining([expect.objectContaining({ id: 'burger-1' })]),
		)
	})

	it('does not cache a partial (some-sources-failed) result', async () => {
		;(getCharacters as jest.Mock).mockRejectedValue(new Error('boom'))

		const { result } = renderHook(() => useSearchableItems())
		await waitFor(() => expect(result.current.loading).toBe(false))

		expect(saveToCache).not.toHaveBeenCalled()
	})

	it('falls back to a cached snapshot (no hard error) when every source fails', async () => {
		;(getBurgersOfTheDay as jest.Mock).mockRejectedValue(new Error('boom'))
		;(getCharacters as jest.Mock).mockRejectedValue(new Error('boom'))
		;(getEndCreditsSequences as jest.Mock).mockRejectedValue(new Error('boom'))
		;(getEpisodes as jest.Mock).mockRejectedValue(new Error('boom'))
		;(getPestControlTrucks as jest.Mock).mockRejectedValue(new Error('boom'))
		;(getStoresNextDoor as jest.Mock).mockRejectedValue(new Error('boom'))
		;(loadFromCache as jest.Mock).mockResolvedValue({
			data: [{ id: 'burger-1', category: 'Burgers of the Day' }],
			cachedAt: 789,
		})

		const { result } = renderHook(() => useSearchableItems())
		await waitFor(() => expect(result.current.loading).toBe(false))

		expect(result.current.error).toBeNull()
		expect(result.current.cachedAt).toBe(789)
		expect(result.current.items).toEqual([
			{ id: 'burger-1', category: 'Burgers of the Day' },
		])
	})

	it('skips every network call when already known to be offline, and uses the cache', async () => {
		;(useNetworkStatus as jest.Mock).mockReturnValue({ isOffline: true })
		;(loadFromCache as jest.Mock).mockResolvedValue({
			data: [{ id: 'burger-1', category: 'Burgers of the Day' }],
			cachedAt: 321,
		})

		const { result } = renderHook(() => useSearchableItems())
		await waitFor(() => expect(result.current.loading).toBe(false))

		expect(getBurgersOfTheDay).not.toHaveBeenCalled()
		expect(getCharacters).not.toHaveBeenCalled()
		expect(result.current.cachedAt).toBe(321)
	})

	it('shows an error when offline with no cache available', async () => {
		;(useNetworkStatus as jest.Mock).mockReturnValue({ isOffline: true })

		const { result } = renderHook(() => useSearchableItems())
		await waitFor(() => expect(result.current.loading).toBe(false))

		expect(result.current.items).toEqual([])
		expect(result.current.error).toBeTruthy()
	})

	it('retry always attempts a real fetch, even while isOffline is (possibly incorrectly) still true', async () => {
		;(useNetworkStatus as jest.Mock).mockReturnValue({ isOffline: true })
		;(loadFromCache as jest.Mock).mockResolvedValue({
			data: [{ id: 'burger-1', category: 'Burgers of the Day' }],
			cachedAt: 321,
		})

		const { result } = renderHook(() => useSearchableItems())
		await waitFor(() => expect(result.current.loading).toBe(false))
		expect(getBurgersOfTheDay).not.toHaveBeenCalled()
		expect(result.current.cachedAt).toBe(321)

		await act(async () => {
			await result.current.retry()
		})

		expect(getBurgersOfTheDay).toHaveBeenCalledTimes(1)
		expect(result.current.cachedAt).toBeNull()
		expect(result.current.items).toEqual(
			expect.arrayContaining([expect.objectContaining({ id: 'burger-1' })]),
		)
	})

	it('automatically re-fetches for real once isOffline flips back to false', async () => {
		;(useNetworkStatus as jest.Mock).mockReturnValue({ isOffline: true })
		;(loadFromCache as jest.Mock).mockResolvedValue({
			data: [{ id: 'burger-1', category: 'Burgers of the Day' }],
			cachedAt: 321,
		})

		const { result, rerender } = renderHook(() => useSearchableItems())
		await waitFor(() => expect(result.current.loading).toBe(false))
		expect(getBurgersOfTheDay).not.toHaveBeenCalled()

		;(useNetworkStatus as jest.Mock).mockReturnValue({ isOffline: false })
		rerender({})
		await waitFor(() => expect(getBurgersOfTheDay).toHaveBeenCalledTimes(1))

		expect(result.current.cachedAt).toBeNull()
	})
})
