import React from 'react';
import { useRouter } from 'expo-router';
import { Linking, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
	DrawerContentComponentProps,
	DrawerContentScrollView,
	DrawerItem,
	DrawerItemList,
} from '@react-navigation/drawer';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { ThemeToggleButton } from './ThemeToggleButton';
import { ColorblindModeButton } from './ColorblindModeButton';

// For the auth block and Log Out, which intentionally stay plain (no
// yellow box) — matches the font of react-navigation's own DrawerItem
// label (screenOptions.drawerLabelStyle in app/_layout.tsx).
const navLinkClassName =
	'rounded-lg px-4 py-3 font-chewy text-[16px] text-lightAccent dark:text-darkAccent';

const boxedItemLabelStyle = { fontFamily: 'Chewy', fontSize: 16 };

// A real embedded Buy Me a Coffee widget only works in a browser (it's a
// third-party <script> that manipulates the DOM directly) — there's no
// equivalent on iOS/Android, since a React Native app has no DOM or
// <script> tags to run at all. Linking.openURL to the actual donation
// page instead works identically on all three platforms, matching the
// same pattern this app already uses for "View on Fandom" links (see
// components/DetailLayout.tsx) — and needs no new script dependency.
const BUY_ME_A_COFFEE_URL = 'https://www.buymeacoffee.com/colterg';

export function DrawerContent(props: DrawerContentComponentProps) {
	const router = useRouter();
	const { token, username, logout } = useAuth();
	const { colors } = useTheme();
	const insets = useSafeAreaInsets();

	// Matches app/_layout.tsx's screenOptions.drawerItemStyle so the
	// Favorites link — rendered outside DrawerItemList, via the actual
	// DrawerItem component rather than a hand-rolled one, for a
	// guaranteed pixel match — looks identical to Home and the six
	// category items. DrawerItem's style/labelStyle props are plain
	// style objects, not classNames, so (like _layout.tsx's
	// screenOptions) the colors have to be picked explicitly here rather
	// than via a dark: Tailwind variant. `colors` is already resolved
	// for the current isDark + colorblindMode combination.
	const boxedItemStyle = {
		borderWidth: 4,
		borderColor: colors.accent,
		backgroundColor: colors.surface,
		borderRadius: 8,
	};

	const handleLogout = async () => {
		await logout();
		router.push('/');
	};

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
				<DrawerItem
					label='Favorites'
					onPress={() => router.push('/favorites')}
					labelStyle={boxedItemLabelStyle}
					style={boxedItemStyle}
					activeTintColor={colors.accent}
					inactiveTintColor={colors.accent}
				/>
			) : null}

			<View className='flex-1' />

			<View className='gap-1 p-2'>
				<Pressable
					onPress={() => Linking.openURL(BUY_ME_A_COFFEE_URL)}
					accessibilityRole='button'
					accessibilityLabel='Buy me a beer, opens a support page'
				>
					<Text className={navLinkClassName}>Buy me a beer 🍺</Text>
				</Pressable>
				{token ? (
					<Pressable onPress={handleLogout} accessibilityRole='button'>
						<Text className={navLinkClassName}>Log Out</Text>
					</Pressable>
				) : null}
			</View>
			<View style={{ height: insets.bottom }} />
		</DrawerContentScrollView>
	);
}
