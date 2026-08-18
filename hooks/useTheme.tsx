import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
} from 'react';
import { Appearance } from 'react-native';
import { colorScheme, useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_PREFERENCE_KEY = 'bbca_theme_preference';

interface ThemeContextValue {
	isDark: boolean;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	// nativewind's useColorScheme() is backed by a global observable, not
	// local component state — every component calling it (here or
	// elsewhere) re-renders independently when the scheme changes, so
	// this doesn't need to be threaded through props.
	const { colorScheme: activeScheme } = useColorScheme();

	// Runs once, on app launch: if the user has manually picked a theme
	// before, restore that override.
	//
	// If they never have, seed explicitly from the OS/browser setting
	// instead of doing nothing. This step turns out to be required, not
	// just a nice-to-have: nativewind's "class" dark-mode strategy (see
	// tailwind.config.js's comment — it's the only strategy that allows
	// colorScheme.set() at all, which the toggle button needs) reflects
	// only an explicit class on <html>/an explicit .set() call, unlike
	// its "media" strategy or native's own default, neither of which
	// this app can use here — it does NOT fall back to following the
	// system preference on its own. Without this, every fresh launch
	// would silently start in light mode regardless of device setting.
	// One consequence of needing "class" mode this way: a system theme
	// change is only picked up on the next cold launch, not live while
	// the app is already running — session-live tracking would need a
	// standing Appearance change-listener that keeps re-syncing for as
	// long as no manual override exists, which isn't worth the added
	// complexity for what's a rare mid-session event.
	useEffect(() => {
		AsyncStorage.getItem(THEME_PREFERENCE_KEY).then((saved) => {
			if (saved === 'light' || saved === 'dark') {
				colorScheme.set(saved);
			} else {
				colorScheme.set(Appearance.getColorScheme() ?? 'light');
			}
		});
	}, []);

	const toggleTheme = useCallback(() => {
		const next = activeScheme === 'dark' ? 'light' : 'dark';
		colorScheme.set(next);
		// Persisted so a manual choice survives the next app launch,
		// instead of reverting to system every time — the standard
		// pattern most apps with a manual theme toggle use.
		AsyncStorage.setItem(THEME_PREFERENCE_KEY, next);
	}, [activeScheme]);

	return (
		<ThemeContext.Provider
			value={{ isDark: activeScheme === 'dark', toggleTheme }}
		>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme(): ThemeContextValue {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
}
