import { act, renderHook } from '@testing-library/react-native'
import { FavoritesProvider, useFavorites } from './useFavorites'

describe('useFavorites', () => {
	it('starts empty', () => {
		const { result } = renderHook(() => useFavorites(), {
			wrapper: FavoritesProvider,
		})

		expect(result.current.loading).toBe(false)
		expect(result.current.favorites).toEqual([])
	})

	it('addFavorite marks the item favorited, scoped to its category', async () => {
		const { result } = renderHook(() => useFavorites(), {
			wrapper: FavoritesProvider,
		})

		await act(async () => {
			await result.current.addFavorite('character', 7)
		})

		expect(result.current.isFavorited('character', 7)).toBe(true)
		expect(result.current.isFavorited('episode', 7)).toBe(false)
	})

	it('adding the same item twice keeps a single entry', async () => {
		const { result } = renderHook(() => useFavorites(), {
			wrapper: FavoritesProvider,
		})

		await act(async () => {
			await result.current.addFavorite('burger', 42)
			await result.current.addFavorite('burger', 42)
		})

		expect(result.current.favorites).toHaveLength(1)
	})

	it('removeFavorite unmarks the item', async () => {
		const { result } = renderHook(() => useFavorites(), {
			wrapper: FavoritesProvider,
		})

		await act(async () => {
			await result.current.addFavorite('burger', 42)
		})
		await act(async () => {
			await result.current.removeFavorite('burger', 42)
		})

		expect(result.current.isFavorited('burger', 42)).toBe(false)
	})

	it('throws when used outside a FavoritesProvider', () => {
		jest.spyOn(console, 'error').mockImplementation(() => {})
		expect(() => renderHook(() => useFavorites())).toThrow(
			'useFavorites must be used within a FavoritesProvider',
		)
	})
})
