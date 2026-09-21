import { act, renderHook, waitFor } from '@testing-library/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { FavoritesProvider, useFavorites } from './useFavorites'
import { loadFavorites } from '../lib/favorites'

const savedBurger = {
	category: 'burger' as const,
	itemId: 42,
	createdAt: '2026-09-21T00:00:00.000Z',
}

async function renderLoaded() {
	const hook = renderHook(() => useFavorites(), {
		wrapper: FavoritesProvider,
	})
	await waitFor(() => expect(hook.result.current.loading).toBe(false))
	return hook
}

describe('useFavorites', () => {
	it('is loading until saved favorites have been read', async () => {
		const { result } = renderHook(() => useFavorites(), {
			wrapper: FavoritesProvider,
		})

		expect(result.current.loading).toBe(true)
		await waitFor(() => expect(result.current.loading).toBe(false))
		expect(result.current.favorites).toEqual([])
	})

	it('restores favorites saved by a previous visit', async () => {
		await AsyncStorage.setItem('bbca_favorites', JSON.stringify([savedBurger]))

		const { result } = await renderLoaded()

		expect(result.current.isFavorited('burger', 42)).toBe(true)
	})

	it('addFavorite marks the item favorited, scoped to its category, and saves it', async () => {
		const { result } = await renderLoaded()

		await act(async () => {
			await result.current.addFavorite('character', 7)
		})

		expect(result.current.isFavorited('character', 7)).toBe(true)
		expect(result.current.isFavorited('episode', 7)).toBe(false)
		await waitFor(async () =>
			expect(await loadFavorites()).toEqual([
				expect.objectContaining({ category: 'character', itemId: 7 }),
			]),
		)
	})

	it('adding the same item twice keeps a single entry', async () => {
		const { result } = await renderLoaded()

		await act(async () => {
			await result.current.addFavorite('burger', 42)
			await result.current.addFavorite('burger', 42)
		})

		expect(result.current.favorites).toHaveLength(1)
	})

	it('removeFavorite unmarks the item and removes it from storage', async () => {
		await AsyncStorage.setItem('bbca_favorites', JSON.stringify([savedBurger]))
		const { result } = await renderLoaded()

		await act(async () => {
			await result.current.removeFavorite('burger', 42)
		})

		expect(result.current.isFavorited('burger', 42)).toBe(false)
		await waitFor(async () => expect(await loadFavorites()).toEqual([]))
	})

	it('does not overwrite saved favorites before they have been loaded', async () => {
		await AsyncStorage.setItem('bbca_favorites', JSON.stringify([savedBurger]))
		// The AsyncStorage mock is shared across tests, so drop calls
		// recorded by earlier ones before checking this test's writes.
		const setItem = jest.spyOn(AsyncStorage, 'setItem')
		setItem.mockClear()

		await renderLoaded()

		expect(setItem).not.toHaveBeenCalledWith('bbca_favorites', '[]')
		expect(await loadFavorites()).toEqual([savedBurger])
	})

	it('keeps a favorite added before storage finished loading', async () => {
		await AsyncStorage.setItem('bbca_favorites', JSON.stringify([savedBurger]))
		const { result } = renderHook(() => useFavorites(), {
			wrapper: FavoritesProvider,
		})

		await act(async () => {
			await result.current.addFavorite('character', 7)
		})
		await waitFor(() => expect(result.current.loading).toBe(false))

		expect(result.current.isFavorited('burger', 42)).toBe(true)
		expect(result.current.isFavorited('character', 7)).toBe(true)
	})

	it('throws when used outside a FavoritesProvider', () => {
		jest.spyOn(console, 'error').mockImplementation(() => {})
		expect(() => renderHook(() => useFavorites())).toThrow(
			'useFavorites must be used within a FavoritesProvider',
		)
	})
})
