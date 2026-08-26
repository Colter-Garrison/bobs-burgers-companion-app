import React, { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DrawerActions } from '@react-navigation/native'
import {
	DrawerContentComponentProps,
	DrawerContentScrollView,
	DrawerItem,
	DrawerItemList,
} from '@react-navigation/drawer'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { ThemeToggleButton } from './ThemeToggleButton'
import { ColorblindModeButton } from './ColorblindModeButton'

// For the auth block and Log Out, which intentionally stay plain (no
// yellow box) — matches the font of react-navigation's own DrawerItem
// label (screenOptions.drawerLabelStyle in app/_layout.tsx).
const navLinkClassName =
	'rounded-lg px-4 py-3 font-chewy text-[16px] text-lightAccent dark:text-darkAccent'

const boxedItemLabelStyle = { fontFamily: 'Chewy', fontSize: 16 }

export function DrawerContent(props: DrawerContentComponentProps) {
	const router = useRouter()
	const pathname = usePathname()
	const { token, username, logout } = useAuth()
	const { colors } = useTheme()
	const insets = useSafeAreaInsets()

	const isFirstRender = useRef(true)
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false
			return
		}
		props.navigation.dispatch(DrawerActions.closeDrawer())
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname])

	const boxedItemStyle = {
		borderWidth: 4,
		borderColor: colors.accent,
		backgroundColor: colors.surface,
		borderRadius: 8,
	}

	const handleLogout = async () => {
		await logout()
		router.push('/')
	}

	return (
		<DrawerContentScrollView
			{...props}
			className='bg-lightBg dark:bg-darkBg'
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<View className='flex-row items-center justify-between gap-1 p-2'>
				<View className='flex-1'>
					{token ? (
						<Pressable
							onPress={() => router.push('/account')}
							accessibilityRole='button'
							accessibilityLabel={`Account settings for ${username}`}
						>
							<Text className={navLinkClassName}>Hello, {username}!</Text>
						</Pressable>
					) : (
						<Pressable
							onPress={() => router.push('/login')}
							accessibilityRole='button'
							accessibilityLabel='Log In (menu)'
						>
							<Text className={navLinkClassName}>Log In</Text>
						</Pressable>
					)}
				</View>
				<View className='flex-row items-center gap-2'>
					<ColorblindModeButton />
					<ThemeToggleButton />
				</View>
			</View>

			<DrawerItemList {...props} />

			{token ? (
				<>
					<DrawerItem
						label='Favorites'
						onPress={() => router.push('/favorites')}
						labelStyle={boxedItemLabelStyle}
						style={boxedItemStyle}
						activeTintColor={colors.accent}
						inactiveTintColor={colors.accent}
					/>
					<DrawerItem
						label='About the Dev'
						onPress={() => router.push('/aboutTheDev')}
						labelStyle={boxedItemLabelStyle}
						style={boxedItemStyle}
						activeTintColor={colors.accent}
						inactiveTintColor={colors.accent}
					/>
				</>
			) : (
				<DrawerItem
					label='About the Dev'
					onPress={() => router.push('/aboutTheDev')}
					labelStyle={boxedItemLabelStyle}
					style={boxedItemStyle}
					activeTintColor={colors.accent}
					inactiveTintColor={colors.accent}
				/>
			)}

			<View className='flex-1' />

			{token ? (
				<View className='gap-1 p-2'>
					<Pressable onPress={handleLogout} accessibilityRole='button'>
						<Text className={navLinkClassName}>Log Out</Text>
					</Pressable>
				</View>
			) : null}
			<View style={{ height: insets.bottom }} />
		</DrawerContentScrollView>
	)
}
