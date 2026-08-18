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

// For the auth block and Log Out, which intentionally stay plain (no
// yellow box) — matches the font of react-navigation's own DrawerItem
// label (screenOptions.drawerLabelStyle in app/_layout.tsx).
const navLinkClassName =
	'rounded-lg px-4 py-3 font-chewy text-[16px] text-bbRed dark:text-darkRed';

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
	const { isDark } = useTheme();
	const insets = useSafeAreaInsets();

	// Matches app/_layout.tsx's screenOptions.drawerItemStyle so the
	// Favorites link — rendered outside DrawerItemList, via the actual
	// DrawerItem component rather than a hand-rolled one, for a
	// guaranteed pixel match — looks identical to Home and the six
	// category items. DrawerItem's style/labelStyle props are plain
	// style objects, not classNames, so (like _layout.tsx's
	// screenOptions) the dark-mode colors have to be picked explicitly
	// here rather than via a dark: Tailwind variant.
	const boxedItemStyle = {
		borderWidth: 4,
		borderColor: isDark ? '#F2545B' : '#E8242F',
		backgroundColor: isDark ? '#373108' : '#F8DF24',
		borderRadius: 8,
	};

	const handleLogout = async () => {
		await logout();
		router.push('/');
	};

	return (
		<DrawerContentScrollView
			{...props}
			className='bg-bbGreen dark:bg-darkBg'
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<View className='flex-row items-center justify-between gap-1 p-2'>
				<View className='flex-1'>
					{token ? (
						<Pressable
							onPress={() => router.push('/account')}
							accessibilityRole='button'
						>
							<Text className={navLinkClassName}>Hello, {username}!</Text>
						</Pressable>
					) : (
						// Drawer.Screens (and this drawer itself) never unmount — the
						// login screen's own submit button says the exact same
						// thing, so this needs a distinct accessible name to stay
						// unambiguous to assistive tech (and to Playwright). Sign Up
						// isn't a separate drawer link — it's reached from the Log In
						// screen's own "Need an account? Sign Up" link instead.
						<Pressable
							onPress={() => router.push('/login')}
							accessibilityRole='button'
							accessibilityLabel='Log In (menu)'
						>
							<Text className={navLinkClassName}>Log In</Text>
						</Pressable>
					)}
				</View>
				{/* Right side of the Hello/Log In row, per the user's own
				request — usernames are capped at 25 characters
				specifically so this can never collide with the icon. */}
				<ThemeToggleButton />
			</View>

			<DrawerItemList {...props} />

			{token ? (
				<DrawerItem
					label='Favorites'
					onPress={() => router.push('/favorites')}
					labelStyle={boxedItemLabelStyle}
					style={boxedItemStyle}
					activeTintColor={isDark ? '#F2545B' : '#E8242F'}
					inactiveTintColor={isDark ? '#F2545B' : '#E8242F'}
				/>
			) : null}

			{/* Pushes Buy Me a Beer/Log Out to the true bottom of the drawer,
			not just after Favorites, however short the category list
			leaves the content — contentContainerStyle's flexGrow: 1 above
			is what lets this spacer actually grow. */}
			<View className='flex-1' />

			{/* Same className as the top auth block's wrapper — kept free
			of any inline style prop, so its padding (including the left
			inset that lines it up with "Hello {username}!") comes entirely
			from className, with nothing for a className/style interop
			quirk to clobber. */}
			<View className='gap-1 p-2'>
				{/* Support link, not an account action — unlike Log Out,
				stays visible regardless of auth state. Same plain
				navLinkClassName treatment as Hello/Log In/Log Out (no
				yellow/red box) so it reads as part of the drawer's own
				furniture rather than an ad. */}
				<Pressable
					onPress={() => Linking.openURL(BUY_ME_A_COFFEE_URL)}
					accessibilityRole='button'
				>
					<Text className={navLinkClassName}>Buy me a beer 🍺</Text>
				</Pressable>
				{token ? (
					<Pressable onPress={handleLogout} accessibilityRole='button'>
						<Text className={navLinkClassName}>Log Out</Text>
					</Pressable>
				) : null}
			</View>
			{/* A separate plain spacer for the device's real safe-area
			inset (home indicator / rounded corner), so the last item
			doesn't get visually clipped by the screen's own curvature on
			phones like the iPhone 15 — a fixed pixel value here would
			only be correct for one specific device. */}
			<View style={{ height: insets.bottom }} />
		</DrawerContentScrollView>
	);
}
