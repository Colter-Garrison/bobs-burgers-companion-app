import React from 'react';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
	DrawerContentComponentProps,
	DrawerContentScrollView,
	DrawerItem,
	DrawerItemList,
} from '@react-navigation/drawer';
import { useAuth } from '../hooks/useAuth';

// For the auth block and Log Out, which intentionally stay plain (no
// yellow box) — matches the font of react-navigation's own DrawerItem
// label (screenOptions.drawerLabelStyle in app/_layout.tsx).
const navLinkClassName =
	'rounded-lg px-4 py-3 font-chewy text-[16px] text-bbRed';

// Matches app/_layout.tsx's screenOptions.drawerItemStyle/drawerLabelStyle
// so the Favorites link — rendered outside DrawerItemList, via the actual
// DrawerItem component rather than a hand-rolled one, for a guaranteed
// pixel match — looks identical to Home and the six category items.
const boxedItemStyle = {
	borderWidth: 4,
	borderColor: '#E8242F',
	backgroundColor: '#F8DF24',
	borderRadius: 8,
};
const boxedItemLabelStyle = { fontFamily: 'Chewy', fontSize: 16 };

export function DrawerContent(props: DrawerContentComponentProps) {
	const router = useRouter();
	const { token, email, logout } = useAuth();
	const insets = useSafeAreaInsets();

	const handleLogout = async () => {
		await logout();
		router.push('/');
	};

	return (
		<DrawerContentScrollView
			{...props}
			className='bg-bbGreen'
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<View className='gap-1 border-b-2 border-bbRed p-2'>
				{token ? (
					<Pressable
						onPress={() => router.push('/account')}
						accessibilityRole='button'
					>
						<Text className={navLinkClassName}>Hello: {email}</Text>
					</Pressable>
				) : (
					<>
						{/* Drawer.Screens (and this drawer itself) never unmount —
						the login/signup screens' own submit buttons say the exact
						same thing, so these need a distinct accessible name to
						stay unambiguous to assistive tech (and to Playwright). */}
						<Pressable
							onPress={() => router.push('/login')}
							accessibilityRole='button'
							accessibilityLabel='Log In (menu)'
						>
							<Text className={navLinkClassName}>Log In</Text>
						</Pressable>
						<Pressable
							onPress={() => router.push('/signup')}
							accessibilityRole='button'
							accessibilityLabel='Sign Up (menu)'
						>
							<Text className={navLinkClassName}>Sign Up</Text>
						</Pressable>
					</>
				)}
			</View>

			<DrawerItemList {...props} />

			{token ? (
				<DrawerItem
					label='Favorites'
					onPress={() => router.push('/favorites')}
					labelStyle={boxedItemLabelStyle}
					style={boxedItemStyle}
					activeTintColor='#E8242F'
					inactiveTintColor='#E8242F'
				/>
			) : null}

			{/* Pushes Log Out to the true bottom of the drawer, not just
			after Favorites, however short the category list leaves the
			content — contentContainerStyle's flexGrow: 1 above is what
			lets this spacer actually grow. */}
			<View className='flex-1' />

			{token ? (
				<>
					{/* Same className as the top auth block's wrapper — kept
					free of any inline style prop, so its padding (including
					the left inset that lines it up with "Hello: email")
					comes entirely from className, with nothing for a
					className/style interop quirk to clobber. */}
					<View className='gap-1 border-t-2 border-bbRed p-2'>
						<Pressable onPress={handleLogout} accessibilityRole='button'>
							<Text className={navLinkClassName}>Log Out</Text>
						</Pressable>
					</View>
					{/* A separate plain spacer for the device's real
					safe-area inset (home indicator / rounded corner), so Log
					Out doesn't get visually clipped by the screen's own
					curvature on phones like the iPhone 15 — a fixed pixel
					value here would only be correct for one specific device. */}
					<View style={{ height: insets.bottom }} />
				</>
			) : null}
		</DrawerContentScrollView>
	);
}
