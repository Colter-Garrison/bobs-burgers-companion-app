import '../global.css';

import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { AuthProvider } from '../hooks/useAuth';

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
			<Stack
				screenOptions={{
					headerStyle: {
						backgroundColor: '#5D74A6',
					},
					headerTitleStyle: {
						fontFamily: 'Chewy',
						fontSize: 24,
					},
					headerBackTitleStyle: {
						fontFamily: 'Chewy',
						fontSize: 18,
					},
					headerTintColor: '#E4E4E5',
				}}
			>
				<Stack.Screen name='index' options={{ title: 'Home' }} />
				<Stack.Screen
					name='burgers'
					options={{ title: 'Burgers of the Day' }}
				/>
				<Stack.Screen name='characters' options={{ title: 'Characters' }} />
				<Stack.Screen name='endCredits' options={{ title: 'End Credits' }} />
				<Stack.Screen name='episodes' options={{ title: 'Episodes' }} />
				<Stack.Screen
					name='pestControl'
					options={{ title: 'Pest Control Trucks' }}
				/>
				<Stack.Screen name='stores' options={{ title: 'Stores Next Door' }} />
			</Stack>
		</AuthProvider>
	);
}
