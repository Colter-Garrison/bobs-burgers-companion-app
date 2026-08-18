// Regression coverage for a real bug found while manually verifying
// Delete Account against a live backend: deleting the account correctly
// cleared auth state and called router.push('/'), but the browser ended
// up on /login instead. The cause wasn't a same-screen race — it was
// app/favorites.tsx's own logged-out guard, mounted independently
// (Drawer.Screens never unmount) and reacting to the same global
// AuthContext token change, firing its own router.push('/login') after
// Account's navigation. A test that only renders <Account /> in
// isolation can't reproduce this — it takes two guarded screens sharing
// one real AuthProvider, which is what this file sets up.
import React from 'react';
import { Platform } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { AuthProvider } from '../../hooks/useAuth';
import { FavoritesProvider } from '../../hooks/useFavorites';
import { tokenStorage } from '../../lib/tokenStorage';
import { deleteAccountRequest, fetchFavorites } from '../../lib/apiClient';
import Account from './account';
import Favorites from './favorites';

jest.mock('../../lib/tokenStorage');
jest.mock('../../lib/apiClient', () => ({
	...jest.requireActual('../../lib/apiClient'),
	deleteAccountRequest: jest.fn(),
	fetchFavorites: jest.fn(),
}));
jest.mock('../../hooks/useSearchableItems', () => ({
	useSearchableItems: () => ({ items: [], loading: false }),
}));
// Favorites now also calls useTheme — this file doesn't exercise theming
// itself, so a no-op stand-in is enough, same reasoning as the
// useFocusEffect mock below.
jest.mock('../../hooks/useTheme', () => ({
	useTheme: () => ({ isDark: false, toggleTheme: jest.fn() }),
}));
jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));
// Favorites now also calls useFocusEffect (to reset its category filter
// on blur) — this file doesn't exercise that behavior itself, so a
// no-op stand-in is enough to avoid needing a real NavigationContainer.
jest.mock('@react-navigation/native', () => ({
	useFocusEffect: (callback: () => void | (() => void)) => {
		callback();
	},
}));

describe('guarded screens sharing one AuthProvider', () => {
	const mockPush = jest.fn();

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
		(tokenStorage.getToken as jest.Mock).mockResolvedValue('token-abc');
		(tokenStorage.getUsername as jest.Mock).mockResolvedValue('bobbelcher');
		(tokenStorage.clear as jest.Mock).mockResolvedValue(undefined);
		(fetchFavorites as jest.Mock).mockResolvedValue([]);
	});

	afterEach(() => {
		jest.clearAllMocks();
		Platform.OS = 'ios';
		delete (global as { window?: Window }).window;
	});

	it('deleting the account navigates home, not to /login, even with Favorites also mounted', async () => {
		(deleteAccountRequest as jest.Mock).mockResolvedValue(undefined);
		Platform.OS = 'web';
		global.window = {
			confirm: jest.fn().mockReturnValue(true),
		} as unknown as Window & typeof globalThis;

		render(
			<AuthProvider>
				<FavoritesProvider>
					<Favorites />
					<Account />
				</FavoritesProvider>
			</AuthProvider>,
		);
		// Let the session-restore effect (AuthProvider) and Favorites'
		// initial fetch both settle before either screen's mount-time
		// guard runs its check.
		await act(async () => {
			await Promise.resolve();
		});

		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Delete Account' }));
		});

		expect(deleteAccountRequest).toHaveBeenCalledWith('token-abc');
		expect(mockPush).toHaveBeenLastCalledWith('/');
		expect(mockPush).not.toHaveBeenCalledWith('/login');
	});
});
