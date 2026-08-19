import React from 'react';
import { Image, Text, View } from 'react-native';
import { Character } from '../hooks/fetchCharacters';

interface CharacterOfTheDayCardProps {
	character: Character;
	blurb: string;
}

// Shown centered on Home in place of search results, only while the
// search bar is empty (see app/index.tsx) — the same character and blurb
// for every visitor on a given calendar day (see
// lib/characterOfTheDay.ts's date-seeded pick).
export function CharacterOfTheDayCard({
	character,
	blurb,
}: CharacterOfTheDayCardProps) {
	return (
		<View className='flex-1 items-center justify-center p-[10px]'>
			<View className='max-w-[320px] items-center gap-[10px] rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-[16px]'>
				<Text className='font-chewy text-[14px] text-lightAccent dark:text-darkAccent'>
					Character of the Day
				</Text>
				{character.image ? (
					// Was 'cover' — most character images are wide show
					// screenshots (roughly 16:9), and filling this box
					// avoided empty letterboxing for those. But not every
					// image is that shape: a handful (e.g. "Double Butt")
					// are portrait-oriented, and cover-cropping a portrait
					// image into a landscape box cut off the top and
					// bottom of the actual subject — cropping is a much
					// worse failure mode than an occasional letterboxed
					// gap, so 'contain' (same as the smaller thumbnails
					// elsewhere in the app) never crops, full stop.
					<Image
						source={{ width: 220, height: 160, uri: character.image }}
						width={220}
						height={160}
						resizeMode='contain'
						style={{ borderRadius: 8 }}
						// iOS's Smart Invert Colors accessibility setting
						// would otherwise flip this photo's colors along
						// with the rest of the UI, which looks wrong for
						// real photographic content.
						accessibilityIgnoresInvertColors
						// Decorative — the character's name is right below it
						// as its own text, so a screen reader announcing the
						// image too would just repeat that.
						accessible={false}
						accessibilityElementsHidden
						importantForAccessibility='no-hide-descendants'
					/>
				) : null}
				<Text
					accessibilityRole='header'
					className='font-chewy text-center text-[22px] text-lightAccent dark:text-darkAccent'
				>
					{character.name}
				</Text>
				<Text className='font-chewy text-center text-[14px] text-lightAccent dark:text-darkAccent'>
					{blurb}
				</Text>
			</View>
		</View>
	);
}
