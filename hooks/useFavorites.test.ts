import { act, renderHook, waitFor } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import { FavoritesProvider, useFavorites } from './useFavorites'
import { useAuth } from './useAuth'
import {
	ApiError,
	addFavoriteRequest,
	fetchFavorites,
	removeFavoriteRequest,
} from '../lib/apiClient'

jest.mock('./useAuth')
jest.mock('../lib/apiClient', () => ({
	...jest.requireActual('../lib/apiClient'),
	fetchFavorites: jest.fn(),
	addFavoriteRequest: jest.fn(),
	removeFavoriteRequest: jest.fn(),
}))
jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}))

const existingFavorite = {
	id: 1,
	userId: 1,
	category: 'burger' as const,
	itemId: 42,
	createdAt: '2024-01-01T00:00:00.000Z',
}

describe('useFavorites', () => {
	const mockLogout = jest.fn()
	const mockPush = jest.fn()

	beforeEach(() => {
		;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
		;(useAuth as jest.Mock).mockReturnValue({
			token: 'token-abc',
			logout: mockLogout,
		})
		;(fetchFavorites as jest.Mock).mockResolvedValue([existingFavorite])
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('stays empty and never calls the API when logged out', async () => {
		;(useAuth as jest.Mock).mockReturnValue({ token: null, logout: mockLogout })

		const { result } = renderHook(() => useFavorites(), {
			wrapper: FavoritesProvider,
		})

		await waitFor(() => expect(result.current.loading).toBe(false))
		expect(result.current.favorites).toEqual([])
		expect(fetchFavorites).not.toHaveBeenCalled()
	})

	it('fetches favorites when a token is present', async () => {
		const { result } = renderHook(() => useFavorites(), {
			wrapper: FavoritesProvider,
		})

		expect(result.current.loading).toBe(true)
		await waitFor(() => expect(result.current.loading).toBe(false))

		expect(fetchFavorites).toHaveBeenCalledWith('token-abc')
		expect(result.current.isFavorited('burger', 42)).toBe(true)
		expect(result.current.isFavorited('character', 99)).toBe(false)
	})

	it('addFavorite optimistically adds, then keeps it once the request resolves', async () => {
		;(addFavoriteRequest as jest.Mock).mockResolvedValue({
			id: 2,
			userId: 1,
			category: 'character',
			itemId: 7,
			createdAt: '2024-01-02T00:00:00.000Z',
		})
		const { result } = renderHook(() => useFavorites(), {
			wrapper: FavoritesProvider,
		})
		await waitFor(() => expect(result.current.loading).toBe(false))

		await act(async () => {
			await result.current.addFavorite('character', 7)
		})

		expect(addFavoriteRequest).toHaveBeenCalledWith('token-abc', 'character', 7)
		expect(result.current.isFavorited('character', 7)).toBe(true)
	})

	it('addFavorite rolls back on a non-409 failure', async () => {
		;(addFavoriteRequest as jest.Mock).mockRejectedValue(
			new ApiError(500, 'Server error'),
		)
		const { result } = renderHook(() => useFavorites(), {
			wrapper: FavoritesProvider,
		})
		await waitFor(() => expect(result.current.loading).toBe(false))

		await act(async () => {
			await result.current.addFavorite('character', 7)
		})

		expect(result.current.isFavorited('character', 7)).toBe(false)
	})

	it('addFavorite treats a 409 (already favorited) as a no-op, not a rollback', async () => {
		;(addFavoriteRequest as jest.Mock).mockRejectedValue(
			new ApiError(409, 'Already favorited'),
		)
		const { result } = renderHook(() => useFavorites(), {
			wrapper: FavoritesProvider,
		})
		await waitFor(() => expect(result.current.loading).toBe(false))

		await act(async () => {
			await result.current.addFavorite('character', 7)
		})

		expect(result.current.isFavorited('character', 7)).toBe(true)
	})

	it('removeFavorite optimistically removes, then stays removed once the request resolves', async () => {
		;(removeFavoriteRequest as jest.Mock).mockResolvedValue(undefined)
		const { result } = renderHook(() => useFavorites(), {
			wrapper: FavoritesProvider,
		})
		await waitFor(() => expect(result.current.loading).toBe(false))
		expect(result.current.isFavorited('burger', 42)).toBe(true)

		await act(async () => {
			await result.current.removeFavorite('burger', 42)
		})

		expect(removeFavoriteRequest).toHaveBeenCalledWith(
			'token-abc',
			'burger',
			42,
		)
		expect(result.current.isFavorited('burger', 42)).toBe(false)
	})

	it('removeFavorite rolls back on a non-404 failure', async () => {
		;(removeFavoriteRequest as jest.Mock).mockRejectedValue(
			new ApiError(500, 'Server error'),
		)
		const { result } = renderHook(() => useFavorites(), {
			wrapper: FavoritesProvider,
		})
		await waitFor(() => expect(result.current.loading).toBe(false))

		await act(async () => {
			await result.current.removeFavorite('burger', 42)
		})

		expect(result.current.isFavorited('burger', 42)).toBe(true)
	})

	it('removeFavorite treats a 404 (already gone) as a no-op, not a rollback', async () => {
		;(removeFavoriteRequest as jest.Mock).mockRejectedValue(
			new ApiError(404, 'Favorite not found'),
		)
		const { result } = renderHook(() => useFavorites(), {
			wrapper: FavoritesProvider,
		})
		await waitFor(() => expect(result.current.loading).toBe(false))

		await act(async () => {
			await result.current.removeFavorite('burger', 42)
		})

		expect(result.current.isFavorited('burger', 42)).toBe(false)
	})

	it('a 401 while fetching logs out and redirects to /login', async () => {
		;(fetchFavorites as jest.Mock).mockRejectedValue(
			new ApiError(401, 'Invalid or expired token'),
		)
		const { result } = renderHook(() => useFavorites(), {
			wrapper: FavoritesProvider,
		})

		await waitFor(() => expect(result.current.loading).toBe(false))

		expect(mockLogout).toHaveBeenCalled()
		expect(mockPush).toHaveBeenCalledWith('/login')
	})
})
