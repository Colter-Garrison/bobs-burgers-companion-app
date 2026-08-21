import React from 'react';
import { Image, Text, View } from 'react-native';
import { Character } from '../hooks/fetchCharacters';

interface CharacterOfTheDayCardProps {
	character: Character;
	blurb: string;
}

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
					<Image
						source={{ width: 220, height: 160, uri: character.image }}
						width={220}
						height={160}
						resizeMode='contain'
						style={{ borderRadius: 8 }}
						accessibilityIgnoresInvertColors
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
