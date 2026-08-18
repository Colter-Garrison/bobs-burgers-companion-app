import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme, useColorScheme } from 'nativewind';
import { ThemeProvider, useTheme } from './useTheme';

jest.mock('nativewind', () => ({
	colorScheme: { set: jest.fn() },
	useColorScheme: jest.fn(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<ThemeProvider>{children}</ThemeProvider>
);

describe('useTheme', () => {
	beforeEach(() => {
		(useColorScheme as jest.Mock).mockReturnValue({ colorScheme: 'light' });
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('reports isDark false when nativewind reports light', () => {
		const { result } = renderHook(() => useTheme(), { wrapper });
		expect(result.current.isDark).toBe(false);
	});

	it('reports isDark true when nativewind reports dark', () => {
		(useColorScheme as jest.Mock).mockReturnValue({ colorScheme: 'dark' });
		const { result } = renderHook(() => useTheme(), { wrapper });
		expect(result.current.isDark).toBe(true);
	});

	it('seeds from the OS/browser setting on mount when no theme preference was ever saved', async () => {
		jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('dark');

		renderHook(() => useTheme(), { wrapper });

		await waitFor(() => expect(colorScheme.set).toHaveBeenCalledWith('dark'));
	});

	it('falls back to light when the OS/browser reports no preference at all', async () => {
		jest.spyOn(Appearance, 'getColorScheme').mockReturnValue(null);

		renderHook(() => useTheme(), { wrapper });

		await waitFor(() => expect(colorScheme.set).toHaveBeenCalledWith('light'));
	});

	it('restores a saved manual preference on mount', async () => {
		await AsyncStorage.setItem('bbca_theme_preference', 'dark');

		renderHook(() => useTheme(), { wrapper });

		await waitFor(() => expect(colorScheme.set).toHaveBeenCalledWith('dark'));
	});

	it('toggleTheme flips from light to dark and persists it', async () => {
		const setItemSpy = jest.spyOn(AsyncStorage, 'setItem');
		(useColorScheme as jest.Mock).mockReturnValue({ colorScheme: 'light' });
		const { result } = renderHook(() => useTheme(), { wrapper });

		act(() => result.current.toggleTheme());

		expect(colorScheme.set).toHaveBeenCalledWith('dark');
		await waitFor(() =>
			expect(setItemSpy).toHaveBeenCalledWith('bbca_theme_preference', 'dark'),
		);
	});

	it('toggleTheme flips from dark to light and persists it', async () => {
		const setItemSpy = jest.spyOn(AsyncStorage, 'setItem');
		(useColorScheme as jest.Mock).mockReturnValue({ colorScheme: 'dark' });
		const { result } = renderHook(() => useTheme(), { wrapper });

		act(() => result.current.toggleTheme());

		expect(colorScheme.set).toHaveBeenCalledWith('light');
		await waitFor(() =>
			expect(setItemSpy).toHaveBeenCalledWith('bbca_theme_preference', 'light'),
		);
	});

	it('throws when useTheme is called outside a ThemeProvider', () => {
		expect(() => renderHook(() => useTheme())).toThrow(
			'useTheme must be used within a ThemeProvider',
		);
	});
});
