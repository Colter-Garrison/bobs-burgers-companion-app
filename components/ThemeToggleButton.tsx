import React from 'react'
import { Pressable } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '../hooks/useTheme'

export function ThemeToggleButton() {
	const { isDark, toggleTheme, colors } = useTheme()

	return (
		<Pressable
			onPress={toggleTheme}
			hitSlop={11}
			accessibilityRole='button'
			accessibilityLabel={
				isDark ? 'Switch to light mode' : 'Switch to dark mode'
			}
		>
			<MaterialCommunityIcons
				name={isDark ? 'moon-waning-crescent' : 'white-balance-sunny'}
				size={22}
				color={isDark ? '#F0F0F0' : colors.accent}
			/>
		</Pressable>
	)
}
