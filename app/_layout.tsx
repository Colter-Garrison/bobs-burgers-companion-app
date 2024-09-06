import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import tamaguiConfig from '@/tamagui.config';
import { TamaguiProvider } from 'tamagui';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [fontLoaded] = useFonts({
		BobsBurgers: require('../assets/fonts/BobsBurgers.ttf'),
		BobsBurgers2: require('../assets/fonts/BobsBurgers2.ttf'),
		Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
		InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
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
		<TamaguiProvider config={tamaguiConfig}>
			<Stack>
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
		</TamaguiProvider>
	);
}
