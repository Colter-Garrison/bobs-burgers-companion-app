import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { Appearance, View } from 'react-native';
import { colorScheme, useColorScheme, vars } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
	ColorblindMode,
	COLORBLIND_MODES,
	COLORBLIND_PALETTES,
} from '../lib/colorblindPalettes';
import { SplashOverlay } from '../components/SplashOverlay';

const THEME_PREFERENCE_KEY = 'bbca_theme_preference';
const COLORBLIND_MODE_KEY = 'bbca_colorblind_mode';

interface ThemeColors {
	bg: string;
	surface: string;
	accent: string;
	// Text/icon color for anything sitting ON an accent-filled surface
	// (e.g. a selected filter pill) — see colorblindPalettes.ts for why
	// this can't just be `surface` or a fixed off-white/dark.
	onAccent: string;
}

interface ThemeContextValue {
	isDark: boolean;
	toggleTheme: () => void;
	colorblindMode: ColorblindMode;
	setColorblindMode: (mode: ColorblindMode) => void;
	// Resolved for the CURRENT isDark + colorblindMode combination — for
	// the handful of colors that can't be reached via a `dark:` Tailwind
	// class (React Navigation's screenOptions, MaterialCommunityIcons'
	// `color` prop, TextInput's placeholderTextColor) and so wouldn't
	// otherwise pick up a selected colorblind palette at all.
	colors: ThemeColors;
	// False until the AsyncStorage read below has resolved (one way or
	// another) and colorScheme.set() has actually been called — used by
	// components/SplashOverlay.tsx to keep covering the screen until
	// then. Without this, the very first render happens in nativewind's
	// un-set default (light) before that async read resolves, which on
	// a device with a saved dark preference was visible as a real flash:
	// light mode (and, on web, the drawer starting open) for a moment,
	// then flipping to dark and closing.
	isThemeReady: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	// nativewind's useColorScheme() is backed by a global observable, not
	// local component state — every component calling it (here or
	// elsewhere) re-renders independently when the scheme changes, so
	// this doesn't need to be threaded through props.
	const { colorScheme: activeScheme } = useColorScheme();
	const [colorblindMode, setColorblindModeState] =
		useState<ColorblindMode>('none');
	const [isThemeReady, setIsThemeReady] = useState(false);

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
		AsyncStorage.getItem(THEME_PREFERENCE_KEY)
			.then((saved) => {
				if (saved === 'light' || saved === 'dark') {
					colorScheme.set(saved);
				} else {
					colorScheme.set(Appearance.getColorScheme() ?? 'light');
				}
			})
			// AsyncStorage.getItem can reject (e.g. a browser blocking
			// storage access), not just resolve — without this, a reject
			// would skip both branches above AND skip marking the theme
			// ready, leaving SplashOverlay covering the screen forever.
			// Falls back to the same system/light default the "no saved
			// preference" branch above already uses.
			.catch(() => {
				colorScheme.set(Appearance.getColorScheme() ?? 'light');
			})
			.finally(() => setIsThemeReady(true));
	}, []);

	useEffect(() => {
		AsyncStorage.getItem(COLORBLIND_MODE_KEY).then((saved) => {
			// Validated against the current mode list, not trusted as-is —
			// a device that saved a value under the original 7-type scheme
			// (e.g. 'tritanopia', from before it was collapsed to 3) would
			// otherwise restore a key COLORBLIND_PALETTES no longer has,
			// and every color lookup derived from it would crash trying to
			// read .light/.dark off undefined.
			if (COLORBLIND_MODES.includes(saved as ColorblindMode)) {
				setColorblindModeState(saved as ColorblindMode);
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

	const setColorblindMode = useCallback((mode: ColorblindMode) => {
		setColorblindModeState(mode);
		AsyncStorage.setItem(COLORBLIND_MODE_KEY, mode);
	}, []);

	const isDark = activeScheme === 'dark';
	const palette = COLORBLIND_PALETTES[colorblindMode];
	const colors = useMemo(
		() => (isDark ? palette.dark : palette.light),
		[isDark, palette],
	);
	// Applied to a root-level wrapper in app/_layout.tsx via nativewind's
	// vars() — every existing `text-lightAccent dark:text-darkAccent`
	// style className in the app reads these CSS custom properties at
	// runtime, so a selected colorblind palette reaches the whole app
	// without any of those classNames needing to change. Both light AND
	// dark values are always set here regardless of the CURRENT isDark —
	// nativewind's own `dark:` selector is what picks which one is
	// actually painted; colorblindMode only controls what those two
	// variants' values ARE.
	const themeVars = useMemo(
		() =>
			vars({
				'--light-bg': palette.light.bg,
				'--light-surface': palette.light.surface,
				'--light-accent': palette.light.accent,
				'--dark-bg': palette.dark.bg,
				'--dark-surface': palette.dark.surface,
				'--dark-accent': palette.dark.accent,
				'--dark-on-accent': palette.dark.onAccent,
			}),
		[palette],
	);

	return (
		<ThemeContext.Provider
			value={{
				isDark,
				toggleTheme,
				colorblindMode,
				setColorblindMode,
				colors,
				isThemeReady,
			}}
		>
			{/* Wraps the whole app so every screen's existing Tailwind
			classNames (e.g. text-lightAccent dark:text-darkAccent)
			inherit these CSS custom properties — the actual mechanism
			that lets a selected colorblind palette reach the app
			without editing any of those classNames. */}
			<View style={[{ flex: 1 }, themeVars]}>
				{children}
				{/* Rendered here (inside the Provider, alongside children,
				not blocking their mount) so it can read isThemeReady via
				the same useTheme() everything else uses, and so the rest
				of the app is already mounting/fetching underneath it
				rather than being delayed until the overlay lifts. */}
				<SplashOverlay />
			</View>
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
