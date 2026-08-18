import React from 'react';
import { Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

// Shows only one icon at a time, reflecting the CURRENT mode (sun while
// light, moon while dark) — tapping switches both the icon and the mode.
export function ThemeToggleButton() {
	const { isDark, toggleTheme } = useTheme();

	return (
		<Pressable
			onPress={toggleTheme}
			accessibilityRole='button'
			accessibilityLabel={
				isDark ? 'Switch to light mode' : 'Switch to dark mode'
			}
		>
			<MaterialCommunityIcons
				name={isDark ? 'moon-waning-crescent' : 'white-balance-sunny'}
				size={22}
				color={isDark ? '#F0F0F0' : '#E8242F'}
			/>
		</Pressable>
	);
}
