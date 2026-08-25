import React from 'react'
import {
	Image,
	ImageStyle,
	Linking,
	Pressable,
	ScrollView,
	StyleProp,
	Text,
	View,
} from 'react-native'
import { Drawer } from 'expo-router/drawer'
import {
	DEV_CHARACTER,
	DEV_CHARACTER_LONG_BIO,
	DEV_GITHUB_URL,
	DEV_LINKEDIN_URL,
} from '../lib/devCharacter'

const BUY_ME_A_COFFEE_URL = 'https://www.buymeacoffee.com/colterg'

export default function AboutTheDev() {
	return (
		<>
			<Drawer.Screen options={{ title: 'About the Dev' }} />
			<ScrollView className='flex-1 bg-lightBg dark:bg-darkBg'>
				<View className='flex-col items-center gap-[10px] p-[16px]'>
					<View className='w-full max-w-[420px] items-center gap-[10px] rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-[16px]'>
						<Image
							source={require('../assets/images/my-character-image.png')}
							width={260}
							height={190}
							resizeMode='contain'
							style={
								{
									width: 260,
									height: 190,
									borderRadius: 8,
									objectFit: 'contain',
								} as StyleProp<ImageStyle>
							}
							accessibilityIgnoresInvertColors
							accessible={false}
							accessibilityElementsHidden
							importantForAccessibility='no-hide-descendants'
						/>
						<Text
							accessibilityRole='header'
							className='font-chewy text-center text-[24px] text-lightAccent dark:text-darkAccent'
						>
							{DEV_CHARACTER.name}
						</Text>
						<Text className='font-chewy text-center text-[16px] text-lightAccent dark:text-darkAccent'>
							{DEV_CHARACTER_LONG_BIO}
						</Text>
						<View className='flex-row gap-[16px]'>
							<Pressable
								onPress={() => Linking.openURL(DEV_LINKEDIN_URL)}
								hitSlop={12}
								accessibilityRole='button'
								accessibilityLabel="View Colter's LinkedIn profile"
							>
								<Text className='font-chewy text-lightAccent dark:text-darkAccent underline'>
									LinkedIn
								</Text>
							</Pressable>
							<Pressable
								onPress={() => Linking.openURL(DEV_GITHUB_URL)}
								hitSlop={12}
								accessibilityRole='button'
								accessibilityLabel="View this app's GitHub repository"
							>
								<Text className='font-chewy text-lightAccent dark:text-darkAccent underline'>
									GitHub
								</Text>
							</Pressable>
						</View>
					</View>
					<Pressable
						onPress={() => Linking.openURL(BUY_ME_A_COFFEE_URL)}
						hitSlop={12}
						accessibilityRole='button'
						accessibilityLabel='Buy me a coffee, opens a support page'
					>
						<Text className='font-chewy text-[16px] text-lightAccent dark:text-darkAccent underline'>
							Buy me a Coffee ☕
						</Text>
					</Pressable>
				</View>
			</ScrollView>
		</>
	)
}
