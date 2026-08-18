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
			// 22px icon with no hitSlop measured out to ~22x22pt — well
			// under the 44x44 minimum touch target guideline. 11pt per
			// edge brings the effective target up to 44x44 exactly.
			hitSlop={11}
			accessibilityRole='button'
			accessibilityLabel={
				isDark ? 'Switch to light mode' : 'Switch to dark mode'
			}
		>
			<MaterialCommunityIcons
				name={isDark ? 'moon-waning-crescent' : 'white-balance-sunny'}
				size={22}
				color={isDark ? '#F0F0F0' : '#2C4A63'}
			/>
		</Pressable>
	);
}
