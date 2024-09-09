import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import tamaguiConfig from '@/tamagui.config';
import { TamaguiProvider, Theme } from 'tamagui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Drawer from 'expo-router/drawer';

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
				<GestureHandlerRootView style={{ flex: 1 }}>
					<Drawer>
						<Drawer.Screen
							name='index'
							options={{ drawerLabel: 'Home', title: 'Home' }}
						/>
						<Drawer.Screen
							name='burgers'
							options={{
								drawerLabel: 'Burgers of the Day',
								title: 'Burgers of the Day',
							}}
						/>
						<Drawer.Screen
							name='characters'
							options={{ drawerLabel: 'Characters', title: 'Characters' }}
						/>
						<Drawer.Screen
							name='endCredits'
							options={{ drawerLabel: 'End Credits', title: 'End Credits' }}
						/>
						<Drawer.Screen
							name='episodes'
							options={{ drawerLabel: 'Episodes', title: 'Episodes' }}
						/>
						<Drawer.Screen
							name='pestControl'
							options={{
								drawerLabel: 'Pest Control Trucks',
								title: 'Pest Control Trucks',
							}}
						/>
						<Drawer.Screen
							name='stores'
							options={{ drawerLabel: 'Stores', title: 'Stores' }}
						/>
					</Drawer>
				</GestureHandlerRootView>
			</Theme>
		</TamaguiProvider>
	);
}
