import React from 'react';
import {
	Image,
	ImageStyle,
	Linking,
	Pressable,
	ScrollView,
	StyleProp,
	Text,
	View,
} from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { CategorySkeleton } from './CategorySkeleton';
import { ErrorState } from './ErrorState';
import { OfflineBanner } from './OfflineBanner';

interface DetailLayoutProps {
	loading: boolean;
	error: string | null;
	onRetry: () => void;
	cachedAt: number | null;
	name: string;
	image?: string;
	bio: string;
	fandomUrl?: string;
}

export function DetailLayout({
	loading,
	error,
	onRetry,
	cachedAt,
	name,
	image,
	bio,
	fandomUrl,
}: DetailLayoutProps) {
	if (loading) {
		return <CategorySkeleton />;
	}

	if (error) {
		return <ErrorState message={error} onRetry={onRetry} />;
	}

	return (
		<>
			<Drawer.Screen options={{ title: name }} />
			<ScrollView className='flex-1 bg-lightBg dark:bg-darkBg'>
				<View className='flex-col items-center gap-[10px] p-[16px]'>
					{cachedAt ? (
						<OfflineBanner cachedAt={cachedAt} onRetry={onRetry} />
					) : null}
					<View className='w-full max-w-[420px] items-center gap-[10px] rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-[16px]'>
						{image ? (
							<Image
								source={{ width: 260, height: 190, uri: image }}
								width={260}
								height={190}
								resizeMode='contain'
								style={
									{
										borderRadius: 8,
										objectFit: 'contain',
									} as StyleProp<ImageStyle>
								}
								accessibilityIgnoresInvertColors
								accessible={false}
								accessibilityElementsHidden
								importantForAccessibility='no-hide-descendants'
							/>
						) : null}
						<Text
							accessibilityRole='header'
							className='font-chewy text-center text-[24px] text-lightAccent dark:text-darkAccent'
						>
							{name}
						</Text>
						<Text className='font-chewy text-center text-[16px] text-lightAccent dark:text-darkAccent'>
							{bio}
						</Text>
						{fandomUrl ? (
							<Pressable
								onPress={() => Linking.openURL(fandomUrl)}
								hitSlop={12}
								accessibilityRole='button'
								accessibilityLabel={`View ${name} on the Bob's Burgers Fandom wiki`}
							>
								<Text className='font-chewy text-lightAccent dark:text-darkAccent underline'>
									View on Fandom
								</Text>
							</Pressable>
						) : null}
					</View>
				</View>
			</ScrollView>
		</>
	);
}
