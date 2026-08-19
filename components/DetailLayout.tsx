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

// Shared chrome for every category's detail page
// (app/detail/[category]/[id].tsx) — each category's own container
// fetches its own shaped data and composes its own bio text (see
// lib/categoryBio.ts), then hands the result here for the actual
// rendering, so the six pages look and behave identically. Sets its own
// header title via <Drawer.Screen> once the name is known — the route's
// Drawer.Screen entry in app/_layout.tsx starts with a generic "Details"
// title specifically so this can fill it in dynamically instead.
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
								// Was 'cover' — cropped portrait-oriented images
								// (e.g. "Double Butt") right through the actual
								// subject to fill this landscape box. 'contain'
								// never crops, at the cost of an occasional
								// letterboxed gap for images whose aspect ratio
								// doesn't match the box — a much better trade.
								resizeMode='contain'
								// Belt-and-suspenders: computed style showed
								// object-fit: fill here despite resizeMode
								// (unlike CharacterOfTheDayCard with near-identical
								// props, which showed the same computed mismatch
								// yet still rendered correctly once fully painted —
								// this app has hit a few cases this session where
								// RN-Web's resizeMode -> object-fit translation
								// isn't reliably reflected in computed style).
								// objectFit isn't in this RN version's ImageStyle
								// type, so it's forced through directly with a
								// narrow cast, to guarantee the actual CSS
								// property is set correctly rather than depend on
								// resizeMode's translation.
								style={
									{
										borderRadius: 8,
										objectFit: 'contain',
									} as StyleProp<ImageStyle>
								}
								// iOS's Smart Invert Colors accessibility
								// setting would otherwise flip this photo's
								// colors along with the rest of the UI,
								// which looks wrong for real photographic
								// content.
								accessibilityIgnoresInvertColors
								// Decorative — the name is right below it as its
								// own text, so a screen reader announcing the
								// image too would just repeat that.
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
								// Plain underlined text with no padding at all
								// measures well under the 44x44 minimum touch
								// target guideline.
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
