import React from 'react';
import { Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

// Shows only one icon at a time, reflecting the CURRENT mode (sun while
// light, moon while dark) — tapping switches both the icon and the mode.
export function ThemeToggleButton() {
	const { isDark, toggleTheme, colors } = useTheme();

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
				// Dark-mode half stays a fixed off-white — it sits on the
				// plain drawer background, not an accent fill, so it's
				// safe/readable regardless of which colorblind palette (if
				// any) is active, unlike the light half which needs to
				// track the active accent color.
				color={isDark ? '#F0F0F0' : colors.accent}
			/>
		</Pressable>
	);
}
