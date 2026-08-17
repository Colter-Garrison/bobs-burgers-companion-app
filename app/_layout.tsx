import '../global.css';

import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { AuthProvider } from '../hooks/useAuth';
import { FavoritesProvider } from '../hooks/useFavorites';
import { DrawerContent } from '../components/DrawerContent';

SplashScreen.preventAutoHideAsync();

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
		<AuthProvider>
			<FavoritesProvider>
				<GestureHandlerRootView style={{ flex: 1 }}>
					<Drawer
						drawerContent={(props) => <DrawerContent {...props} />}
						screenOptions={{
							headerStyle: {
								backgroundColor: '#5D74A6',
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
								backgroundColor: '#BDFB73',
							},
							drawerActiveTintColor: '#E8242F',
							drawerInactiveTintColor: '#E8242F',
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
								borderColor: '#E8242F',
								backgroundColor: '#F8DF24',
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
				</GestureHandlerRootView>
			</FavoritesProvider>
		</AuthProvider>
	);
}
