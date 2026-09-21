import React, { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'expo-router'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DrawerActions } from '@react-navigation/native'
import {
	DrawerContentComponentProps,
	DrawerContentScrollView,
	DrawerItem,
	DrawerItemList,
} from '@react-navigation/drawer'
import { useTheme } from '../hooks/useTheme'
import { ThemeToggleButton } from './ThemeToggleButton'
import { ColorblindModeButton } from './ColorblindModeButton'

const boxedItemLabelStyle = { fontFamily: 'Chewy', fontSize: 16 }

export function DrawerContent(props: DrawerContentComponentProps) {
	const router = useRouter()
	const pathname = usePathname()
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

			<DrawerItemList {...props} />

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

			<View style={{ height: insets.bottom }} />
		</DrawerContentScrollView>
	)
}
