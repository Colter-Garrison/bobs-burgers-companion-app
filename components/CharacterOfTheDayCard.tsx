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
					// cover, not contain (unlike the smaller thumbnails
					// elsewhere in the app) — these character images are wide
					// show screenshots (roughly 16:9), not square portraits,
					// so `contain` inside a square box leaves visible empty
					// letterboxing above and below. This is the one prominent
					// showcase image on the screen, so filling the box
					// (cropping the edges) reads better than a smaller,
					// gapped image would.
					<Image
						source={{ width: 220, height: 160, uri: character.image }}
						width={220}
						height={160}
						resizeMode='cover'
						style={{ borderRadius: 8 }}
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
