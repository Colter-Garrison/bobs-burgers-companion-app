import '../global.css';

import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { AuthProvider } from '../hooks/useAuth';
import { FavoritesProvider } from '../hooks/useFavorites';
import { ThemeProvider, useTheme } from '../hooks/useTheme';
import { DrawerContent } from '../components/DrawerContent';

SplashScreen.preventAutoHideAsync();

// React Navigation's screenOptions are plain style objects, not
// classNames — NativeWind's dark: variant can't reach them, so the
// header/drawer chrome colors have to be picked explicitly here based on
// the current theme, unlike every other screen's own dark:-prefixed
// Tailwind classes.
function ThemedDrawer() {
	const { isDark, colors } = useTheme();

	return (
		<Drawer
			drawerContent={(props) => <DrawerContent {...props} />}
			screenOptions={{
				headerStyle: {
					// Light-mode header was an unrelated arbitrary blue
					// (#5D74A6) — now matches the active accent color
					// exactly, both for visual cohesion with the rest of
					// the palette and because it raises the header text's
					// own contrast from ~3.66:1 to ~7.29:1 as a side
					// effect. `colors` (from useTheme) is already resolved
					// for the current isDark + colorblindMode combination,
					// so a plain isDark ternary would be wrong once a
					// colorblind palette is active — dark mode itself
					// still stays a fixed neutral gray regardless of
					// palette, so that half stays a literal.
					backgroundColor: isDark ? '#3C3C3C' : colors.accent,
					// React Navigation's default header carries its own
					// border-bottom/shadow (a platform-default light
					// gray/white, unrelated to our own color scheme) —
					// without disabling it explicitly, that shows up as a
					// thin light seam between the header and the body
					// background in both themes, most visible in dark
					// mode against the darker body color.
					borderBottomWidth: 0,
					elevation: 0,
					shadowOpacity: 0,
				},
				headerTitleStyle: {
					fontFamily: 'Chewy',
					fontSize: 24,
				},
				headerTintColor: '#E4E4E5',
				headerLeft: (props) => (
					<DrawerToggleButton
						{...props}
						accessibilityLabel='Open navigation menu'
					/>
				),
				drawerStyle: {
					backgroundColor: colors.bg,
				},
				drawerActiveTintColor: colors.accent,
				drawerInactiveTintColor: colors.accent,
				drawerLabelStyle: {
					fontFamily: 'Chewy',
					fontSize: 16,
				},
				// The yellow-box-red-trim look used elsewhere in the app
				// (e.g. the Delete Account button, the Home search bar).
				// components/DrawerContent.tsx applies this same style to
				// the Favorites link, which is rendered outside
				// DrawerItemList and so doesn't pick this up automatically.
				drawerItemStyle: {
					borderWidth: 4,
					borderColor: colors.accent,
					backgroundColor: colors.surface,
					borderRadius: 8,
				},
			}}
		>
			<Drawer.Screen name='index' options={{ title: 'Home' }} />
			<Drawer.Screen
				name='(categories)/burgers'
				options={{ title: 'Burgers of the Day' }}
			/>
			<Drawer.Screen
				name='(categories)/characters'
				options={{ title: 'Characters' }}
			/>
			<Drawer.Screen
				name='(categories)/endCredits'
				options={{ title: 'End Credits' }}
			/>
			<Drawer.Screen
				name='(categories)/episodes'
				options={{ title: 'Episodes' }}
			/>
			<Drawer.Screen
				name='(categories)/pestControl'
				options={{ title: 'Pest Control Trucks' }}
			/>
			<Drawer.Screen
				name='(categories)/stores'
				options={{ title: 'Stores Next Door' }}
			/>
			<Drawer.Screen
				name='(auth)/login'
				options={{
					title: 'Log In',
					drawerItemStyle: { display: 'none' },
				}}
			/>
			<Drawer.Screen
				name='(auth)/signup'
				options={{
					title: 'Sign Up',
					drawerItemStyle: { display: 'none' },
				}}
			/>
			<Drawer.Screen
				name='(account)/account'
				options={{
					title: 'Account',
					drawerItemStyle: { display: 'none' },
				}}
			/>
			<Drawer.Screen
				name='(account)/favorites'
				options={{
					title: 'My Favorites',
					drawerItemStyle: { display: 'none' },
				}}
			/>
			{/* Not a real category to pick from the menu — reached only
			by tapping a card, on a category screen or in search
			results (see lib/detailRoute.ts). Hidden from the drawer
			list the same way login/signup/account/favorites are. */}
			<Drawer.Screen
				name='detail/[category]/[id]'
				options={{
					title: 'Details',
					drawerItemStyle: { display: 'none' },
				}}
			/>
		</Drawer>
	);
}

export default function RootLayout() {
	const [fontLoaded] = useFonts({
		BobsBurgers: require('../assets/fonts/BobsBurgers.ttf'),
		BobsBurgers2: require('../assets/fonts/BobsBurgers2.ttf'),
		Chewy: require('../assets/fonts/Chewy.ttf'),
	});

	useEffect(() => {
		if (fontLoaded) {
			SplashScreen.hideAsync();
		}
	}, [fontLoaded]);

	if (!fontLoaded) {
		return null;
	}

	return (
		<ThemeProvider>
			<AuthProvider>
				<FavoritesProvider>
					<GestureHandlerRootView style={{ flex: 1 }}>
						<ThemedDrawer />
					</GestureHandlerRootView>
				</FavoritesProvider>
			</AuthProvider>
		</ThemeProvider>
	);
}
