import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme, useColorScheme } from 'nativewind';
import { ThemeProvider, useTheme } from './useTheme';

jest.mock('nativewind', () => ({
	colorScheme: { set: jest.fn() },
	useColorScheme: jest.fn(),
	// The real vars() returns nativewind's own internal CSS-variable
	// representation — tests here only care that ThemeProvider doesn't
	// crash wiring it up and passes something through to style, not its
	// exact shape, so an identity function is enough.
	vars: (input: Record<string, string>) => input,
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

	it('defaults to no colorblind mode, resolving colors from the normal palette', () => {
		const { result } = renderHook(() => useTheme(), { wrapper });

		expect(result.current.colorblindMode).toBe('none');
		expect(result.current.colors).toEqual({
			bg: '#8FCBEA',
			surface: '#C9D9E4',
			accent: '#2C4A63',
			onAccent: '#C9D9E4',
		});
	});

	it('restores a saved colorblind mode on mount', async () => {
		await AsyncStorage.setItem('bbca_colorblind_mode', 'achromatopsia');

		const { result } = renderHook(() => useTheme(), { wrapper });

		await waitFor(() =>
			expect(result.current.colorblindMode).toBe('achromatopsia'),
		);
	});

	it('ignores a saved value that is no longer a valid mode, instead of crashing', async () => {
		// Regression coverage: colorblind mode originally had 7 clinically-
		// named values (e.g. 'tritanopia') before being collapsed to 3 —
		// a device that saved one of those old values would otherwise
		// restore a key COLORBLIND_PALETTES no longer has, and `colors`
		// would crash trying to read .light/.dark off undefined.
		await AsyncStorage.setItem('bbca_colorblind_mode', 'tritanopia');

		const { result } = renderHook(() => useTheme(), { wrapper });

		// Give the AsyncStorage.getItem effect a tick to resolve — asserting
		// immediately would trivially pass either way, before the (invalid)
		// saved value could have been applied at all.
		await waitFor(() => expect(result.current.colorblindMode).toBe('none'));
		expect(() => result.current.colors).not.toThrow();
	});

	it('setColorblindMode updates colors and persists the choice', async () => {
		const setItemSpy = jest.spyOn(AsyncStorage, 'setItem');
		const { result } = renderHook(() => useTheme(), { wrapper });

		act(() => result.current.setColorblindMode('blueYellow'));

		expect(result.current.colorblindMode).toBe('blueYellow');
		expect(result.current.colors.accent).toBe('#7A2E45');
		await waitFor(() =>
			expect(setItemSpy).toHaveBeenCalledWith(
				'bbca_colorblind_mode',
				'blueYellow',
			),
		);
	});

	it('resolves the dark variant of the active palette when isDark is true', () => {
		(useColorScheme as jest.Mock).mockReturnValue({ colorScheme: 'dark' });
		const { result } = renderHook(() => useTheme(), { wrapper });

		act(() => result.current.setColorblindMode('achromatopsia'));

		expect(result.current.colors).toEqual({
			bg: '#222222',
			surface: '#323233',
			accent: '#F0F0F0',
			onAccent: '#222222',
		});
	});

	it('reports isThemeReady false until the theme preference lookup resolves, then true', async () => {
		const { result } = renderHook(() => useTheme(), { wrapper });

		expect(result.current.isThemeReady).toBe(false);

		await waitFor(() => expect(result.current.isThemeReady).toBe(true));
	});

	it('still reports isThemeReady true even if the AsyncStorage read rejects', async () => {
		// Regression coverage: isThemeReady is what SplashOverlay covers
		// the screen with — a rejected (not just empty) read must still
		// mark it ready, or a storage failure would leave the overlay
		// covering the app forever instead of just falling back to the
		// system/light default.
		jest
			.spyOn(AsyncStorage, 'getItem')
			.mockRejectedValueOnce(new Error('storage unavailable'));

		const { result } = renderHook(() => useTheme(), { wrapper });

		await waitFor(() => expect(result.current.isThemeReady).toBe(true));
	});
});
