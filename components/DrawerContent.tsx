import React, { useEffect, useRef } from 'react'
import { usePathname } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DrawerActions, useLinkBuilder } from 'expo-router/react-navigation'
import {
	DrawerContentComponentProps,
	DrawerContentScrollView,
} from 'expo-router/drawer'
import { useTheme } from '../hooks/useTheme'
import { ThemeToggleButton } from './ThemeToggleButton'
import { ColorblindModeButton } from './ColorblindModeButton'
import { DrawerLink } from './DrawerLink'

export function DrawerContent(props: DrawerContentComponentProps) {
	const pathname = usePathname()
	const { colors } = useTheme()
	const { buildHref } = useLinkBuilder()
	const { state, descriptors, navigation } = props
	const insets = useSafeAreaInsets()

	const isFirstRender = useRef(true)
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false
			return
		}
		navigation.dispatch(DrawerActions.closeDrawer())
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname])

	return (
		<DrawerContentScrollView
			{...props}
			className='bg-lightBg dark:bg-darkBg'
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<View className='flex-row items-center justify-end gap-2 p-2'>
				<ColorblindModeButton />
				<ThemeToggleButton />
			</View>

			{/* Every Drawer.Screen in app/_layout.tsx that isn't hidden, in the
			    order declared there — titles and styles stay defined in one
			    place. */}
			{state.routes.map((route, index) => {
				const options = descriptors[route.key].options
				const itemStyle = StyleSheet.flatten(options.drawerItemStyle)
				if (itemStyle?.display === 'none') return null
				const focused = index === state.index
				const label =
					typeof options.drawerLabel === 'string'
						? options.drawerLabel
						: (options.title ?? route.name)
				return (
					<DrawerLink
						key={route.key}
						href={buildHref(route.name, route.params) ?? '/'}
						label={label}
						focused={focused}
						color={
							(focused
								? options.drawerActiveTintColor
								: options.drawerInactiveTintColor) ?? colors.accent
						}
						style={options.drawerItemStyle}
						labelStyle={options.drawerLabelStyle}
						// Already on this screen: nothing to navigate to, so the
						// pathname effect above won't close the drawer — do it here.
						onPress={
							focused
								? () => navigation.dispatch(DrawerActions.closeDrawer())
								: undefined
						}
					/>
				)
			})}

			<View style={{ height: insets.bottom }} />
		</DrawerContentScrollView>
	)
}
