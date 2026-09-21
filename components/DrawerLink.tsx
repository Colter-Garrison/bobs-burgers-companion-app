import React from 'react'
import { Href, Link } from 'expo-router'
import {
	ColorValue,
	Pressable,
	StyleProp,
	StyleSheet,
	Text,
	TextStyle,
	View,
	ViewStyle,
} from 'react-native'

interface DrawerLinkProps {
	href: string
	label: string
	focused: boolean
	color: ColorValue
	style?: StyleProp<ViewStyle>
	labelStyle?: StyleProp<TextStyle>
	onPress?: () => void
}

// A drawer entry rendered as a real link (<a href> on web), unlike the
// drawer's own DrawerItem, which hardcodes role="button". A plain click
// still navigates in place through the router, in the same tab — Link
// only lets the browser take over for a deliberate Ctrl/⌘/middle-click.
export function DrawerLink({
	href,
	label,
	focused,
	color,
	style,
	labelStyle,
	onPress,
}: DrawerLinkProps) {
	return (
		<Link href={href as Href} asChild onPress={onPress}>
			<Pressable
				accessibilityRole='link'
				aria-current={focused ? 'page' : undefined}
				// One flat object: Link's asChild merge passes a nested style array
				// straight through to the DOM on web, which crashes.
				style={StyleSheet.flatten([styles.container, style])}
			>
				<View style={styles.wrapper}>
					<Text numberOfLines={1} style={[styles.label, { color }, labelStyle]}>
						{label}
					</Text>
				</View>
			</Pressable>
		</Link>
	)
}

// Matches the padding of the drawer's built-in DrawerItem, so switching
// to links doesn't change how the menu looks.
const styles = StyleSheet.create({
	container: {
		overflow: 'hidden',
	},
	wrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 11,
		paddingStart: 16,
		paddingEnd: 24,
	},
	label: {
		flex: 1,
		marginVertical: 4,
		lineHeight: 24,
	},
})
