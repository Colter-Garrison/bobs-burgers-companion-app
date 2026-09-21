import AsyncStorage from '@react-native-async-storage/async-storage'
import {
	loadFavorites,
	saveFavorites,
	subscribeToFavoriteChanges,
} from './favorites'

const bob = {
	category: 'character' as const,
	itemId: 1,
	createdAt: '2026-09-21T00:00:00.000Z',
}

describe('favorites storage', () => {
	it('returns an empty list when nothing has been saved', async () => {
		expect(await loadFavorites()).toEqual([])
	})

	it('round-trips saved favorites', async () => {
		await saveFavorites([bob])

		expect(await loadFavorites()).toEqual([bob])
	})

	it('returns an empty list for corrupt JSON instead of throwing', async () => {
		await AsyncStorage.setItem('bbca_favorites', '{not json')

		expect(await loadFavorites()).toEqual([])
	})

	it('drops entries that no longer match the expected shape', async () => {
		await AsyncStorage.setItem(
			'bbca_favorites',
			JSON.stringify([
				bob,
				{ category: 'villain', itemId: 2, createdAt: bob.createdAt },
				{ category: 'burger', itemId: '3', createdAt: bob.createdAt },
				{ category: 'burger', itemId: 4 },
				null,
			]),
		)

		expect(await loadFavorites()).toEqual([bob])
	})

	it('returns an empty list when the stored value is not an array', async () => {
		await AsyncStorage.setItem('bbca_favorites', JSON.stringify(bob))

		expect(await loadFavorites()).toEqual([])
	})

	it('swallows storage write failures', async () => {
		jest
			.spyOn(AsyncStorage, 'setItem')
			.mockRejectedValueOnce(new Error('quota exceeded'))

		await expect(saveFavorites([bob])).resolves.toBeUndefined()
	})
})

// Jest's window has no event methods, so these tests lend it a real
// EventTarget and dispatch storage events the way another tab would.
describe('subscribeToFavoriteChanges', () => {
	const target = new EventTarget()
	const storageEvent = (key: string | null) =>
		Object.assign(new Event('storage'), { key })

	beforeEach(() => {
		Object.assign(window, {
			addEventListener: target.addEventListener.bind(target),
			removeEventListener: target.removeEventListener.bind(target),
		})
	})

	afterEach(() => {
		Object.assign(window, {
			addEventListener: undefined,
			removeEventListener: undefined,
		})
	})

	it('calls back when another tab changes favorites or clears storage', () => {
		const onChange = jest.fn()
		const unsubscribe = subscribeToFavoriteChanges(onChange)

		target.dispatchEvent(storageEvent('bbca_favorites'))
		target.dispatchEvent(storageEvent(null))

		expect(onChange).toHaveBeenCalledTimes(2)
		unsubscribe()
	})

	it('ignores changes to other storage keys', () => {
		const onChange = jest.fn()
		const unsubscribe = subscribeToFavoriteChanges(onChange)

		target.dispatchEvent(storageEvent('bbca_cache_characters'))

		expect(onChange).not.toHaveBeenCalled()
		unsubscribe()
	})

	it('stops calling back after unsubscribing', () => {
		const onChange = jest.fn()
		subscribeToFavoriteChanges(onChange)()

		target.dispatchEvent(storageEvent('bbca_favorites'))

		expect(onChange).not.toHaveBeenCalled()
	})

	it('is a harmless no-op where window has no event listeners', () => {
		Object.assign(window, { addEventListener: undefined })

		expect(() => subscribeToFavoriteChanges(jest.fn())()).not.toThrow()
	})
})
