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
						}}
					>
						<Drawer.Screen name='index' options={{ title: 'Home' }} />
						<Drawer.Screen
							name='burgers'
							options={{ title: 'Burgers of the Day' }}
						/>
						<Drawer.Screen
							name='characters'
							options={{ title: 'Characters' }}
						/>
						<Drawer.Screen
							name='endCredits'
							options={{ title: 'End Credits' }}
						/>
						<Drawer.Screen name='episodes' options={{ title: 'Episodes' }} />
						<Drawer.Screen
							name='pestControl'
							options={{ title: 'Pest Control Trucks' }}
						/>
						<Drawer.Screen
							name='stores'
							options={{ title: 'Stores Next Door' }}
						/>
						<Drawer.Screen
							name='login'
							options={{
								title: 'Log In',
								drawerItemStyle: { display: 'none' },
							}}
						/>
						<Drawer.Screen
							name='signup'
							options={{
								title: 'Sign Up',
								drawerItemStyle: { display: 'none' },
							}}
						/>
						<Drawer.Screen
							name='account'
							options={{
								title: 'Account',
								drawerItemStyle: { display: 'none' },
							}}
						/>
						<Drawer.Screen
							name='favorites'
							options={{
								title: 'My Favorites',
								drawerItemStyle: { display: 'none' },
							}}
						/>
					</Drawer>
				</GestureHandlerRootView>
			</FavoritesProvider>
		</AuthProvider>
	);
}
