import '../global.css'

import { useEffect } from 'react'
import { useFonts } from 'expo-font'
import { SplashScreen } from 'expo-router'
import { Drawer } from 'expo-router/drawer'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { DrawerToggleButton } from '@react-navigation/drawer'
import { AuthProvider } from '../hooks/useAuth'
import { FavoritesProvider } from '../hooks/useFavorites'
import { ThemeProvider, useTheme } from '../hooks/useTheme'
import { DrawerContent } from '../components/DrawerContent'
import { SplashOverlay } from '../components/SplashOverlay'

SplashScreen.preventAutoHideAsync()

function ThemedDrawer() {
	const { isDark, colors } = useTheme()

	return (
		<Drawer
			drawerContent={(props) => <DrawerContent {...props} />}
			screenOptions={{
				headerStyle: {
					backgroundColor: isDark ? '#3C3C3C' : colors.accent,
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
			<Drawer.Screen
				name='aboutTheDev'
				options={{
					title: 'About the Dev',
					drawerItemStyle: { display: 'none' },
				}}
			/>
			<Drawer.Screen
				name='detail/[category]/[id]'
				options={{
					title: 'Details',
					drawerItemStyle: { display: 'none' },
				}}
			/>
		</Drawer>
	)
}

export default function RootLayout() {
	const [fontLoaded] = useFonts({
		BobsBurgers: require('../assets/fonts/BobsBurgers.ttf'),
		BobsBurgers2: require('../assets/fonts/BobsBurgers2.ttf'),
		Chewy: require('../assets/fonts/Chewy.ttf'),
	})

	useEffect(() => {
		if (fontLoaded) {
			SplashScreen.hideAsync()
		}
	}, [fontLoaded])

	if (!fontLoaded) {
		return null
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
			<SplashOverlay />
		</ThemeProvider>
	)
}
