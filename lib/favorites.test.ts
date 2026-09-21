import AsyncStorage from '@react-native-async-storage/async-storage'
import { loadFavorites, saveFavorites } from './favorites'

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
