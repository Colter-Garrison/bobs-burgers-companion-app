import tamaguiConfig from '@/tamagui.config';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { TamaguiProvider } from 'tamagui';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [fontLoaded] = useFonts({
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
			</Stack>
		</TamaguiProvider>
	);
}
