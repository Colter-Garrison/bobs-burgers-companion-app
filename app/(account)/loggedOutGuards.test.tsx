import React from 'react'
import { Platform } from 'react-native'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import { AuthProvider } from '../../hooks/useAuth'
import { FavoritesProvider } from '../../hooks/useFavorites'
import { tokenStorage } from '../../lib/tokenStorage'
import { deleteAccountRequest, fetchFavorites } from '../../lib/apiClient'
import Account from './account'
import Favorites from './favorites'

jest.mock('../../lib/tokenStorage')
jest.mock('../../lib/apiClient', () => ({
	...jest.requireActual('../../lib/apiClient'),
	deleteAccountRequest: jest.fn(),
	fetchFavorites: jest.fn(),
}))
jest.mock('../../hooks/useSearchableItems', () => ({
	useSearchableItems: () => ({ items: [], loading: false }),
}))
jest.mock('../../hooks/useTheme', () => ({
	useTheme: () => ({
		isDark: false,
		toggleTheme: jest.fn(),
		colors: { bg: '#8FCBEA', surface: '#C9D9E4', accent: '#2C4A63' },
	}),
}))
jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}))
jest.mock('@react-navigation/native', () => ({
	useFocusEffect: (callback: () => void | (() => void)) => {
		callback()
	},
}))

describe('guarded screens sharing one AuthProvider', () => {
	const mockPush = jest.fn()

	beforeEach(() => {
		;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
		;(tokenStorage.getToken as jest.Mock).mockResolvedValue('token-abc')
		;(tokenStorage.getUsername as jest.Mock).mockResolvedValue('bobbelcher')
		;(tokenStorage.clear as jest.Mock).mockResolvedValue(undefined)
		;(fetchFavorites as jest.Mock).mockResolvedValue([])
	})

	afterEach(() => {
		jest.clearAllMocks()
		Platform.OS = 'ios'
		delete (global as { window?: Window }).window
	})

	it('deleting the account navigates home, not to /login, even with Favorites also mounted', async () => {
		;(deleteAccountRequest as jest.Mock).mockResolvedValue(undefined)
		Platform.OS = 'web'
		global.window = {
			confirm: jest.fn().mockReturnValue(true),
		} as unknown as Window & typeof globalThis

		render(
			<AuthProvider>
				<FavoritesProvider>
					<Favorites />
					<Account />
				</FavoritesProvider>
			</AuthProvider>,
		)
		await act(async () => {
			await Promise.resolve()
		})

		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Delete Account' }))
		})

		expect(deleteAccountRequest).toHaveBeenCalledWith('token-abc')
		expect(mockPush).toHaveBeenLastCalledWith('/')
		expect(mockPush).not.toHaveBeenCalledWith('/login')
	})
})
