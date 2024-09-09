import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import tamaguiConfig from '@/tamagui.config';
import { TamaguiProvider, Theme } from 'tamagui';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [fontLoaded] = useFonts({
		BobsBurgers: require('../assets/fonts/BobsBurgers.ttf'),
		BobsBurgers2: require('../assets/fonts/BobsBurgers2.ttf'),
		Chewy: require('../assets/fonts/Chewy.ttf'),
		Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
		InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
	});

	const colorScheme = useColorScheme();

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
			<Theme name={colorScheme === 'dark' ? 'dark' : 'light'}>
				<Stack
					screenOptions={{
						headerStyle: {
							backgroundColor: '#5D74A6',
						},
						headerTitleStyle: {
							fontFamily: 'chewy',
							fontSize: 24,
						},
						headerBackTitleStyle: {
							fontFamily: 'chewy',
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
			</Theme>
		</TamaguiProvider>
	);
}
