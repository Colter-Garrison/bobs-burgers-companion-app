import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react'
import { Appearance, Platform, View } from 'react-native'
import { colorScheme, useColorScheme, vars } from 'nativewind'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
	ColorblindMode,
	COLORBLIND_MODES,
	COLORBLIND_PALETTES,
} from '../lib/colorblindPalettes'

const THEME_PREFERENCE_KEY = 'bbca_theme_preference'
const COLORBLIND_MODE_KEY = 'bbca_colorblind_mode'

interface ThemeColors {
	bg: string
	surface: string
	accent: string
	onAccent: string
}

interface ThemeContextValue {
	isDark: boolean
	toggleTheme: () => void
	colorblindMode: ColorblindMode
	setColorblindMode: (mode: ColorblindMode) => void
	colors: ThemeColors
	isThemeReady: boolean
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const { colorScheme: activeScheme } = useColorScheme()
	const [colorblindMode, setColorblindModeState] =
		useState<ColorblindMode>('none')
	const [isThemeReady, setIsThemeReady] = useState(false)

	useEffect(() => {
		AsyncStorage.getItem(THEME_PREFERENCE_KEY)
			.then((saved) => {
				if (saved === 'light' || saved === 'dark') {
					colorScheme.set(saved)
				} else {
					colorScheme.set(Appearance.getColorScheme() ?? 'light')
				}
			})
			.catch(() => {
				colorScheme.set(Appearance.getColorScheme() ?? 'light')
			})
			.finally(() => setIsThemeReady(true))
	}, [])

	useEffect(() => {
		AsyncStorage.getItem(COLORBLIND_MODE_KEY).then((saved) => {
			if (COLORBLIND_MODES.includes(saved as ColorblindMode)) {
				setColorblindModeState(saved as ColorblindMode)
			}
		})
	}, [])

	const toggleTheme = useCallback(() => {
		const next = activeScheme === 'dark' ? 'light' : 'dark'
		colorScheme.set(next)
		AsyncStorage.setItem(THEME_PREFERENCE_KEY, next)
	}, [activeScheme])

	const setColorblindMode = useCallback((mode: ColorblindMode) => {
		setColorblindModeState(mode)
		AsyncStorage.setItem(COLORBLIND_MODE_KEY, mode)
	}, [])

	const isDark = activeScheme === 'dark'
	const palette = COLORBLIND_PALETTES[colorblindMode]
	const colors = useMemo(
		() => (isDark ? palette.dark : palette.light),
		[isDark, palette],
	)
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
	)

	useEffect(() => {
		if (Platform.OS !== 'web') {
			return
		}
		Object.entries(themeVars).forEach(([property, value]) => {
			document.documentElement.style.setProperty(property, String(value))
		})
	}, [themeVars])

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
			<View style={[{ flex: 1 }, themeVars]}>{children}</View>
		</ThemeContext.Provider>
	)
}

export function useTheme(): ThemeContextValue {
	const context = useContext(ThemeContext)
	if (!context) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}
	return context
}
