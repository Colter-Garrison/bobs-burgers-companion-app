import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'

export default function NotFound() {
	const router = useRouter()

	return (
		<View className='flex-1 items-center justify-center gap-[10px] bg-lightBg dark:bg-darkBg p-[10px]'>
			<Text
				accessibilityRole='header'
				className='font-chewy text-[32px] text-lightAccent dark:text-darkAccent'
			>
				Page Not Found
			</Text>
			<Text className='font-chewy text-center text-lightAccent dark:text-darkAccent'>
				This page doesn&apos;t exist.
			</Text>
			<Pressable
				onPress={() => router.push('/')}
				hitSlop={12}
				accessibilityRole='button'
			>
				<Text className='font-chewy text-lightAccent dark:text-darkAccent underline'>
					Go to Home
				</Text>
			</Pressable>
		</View>
	)
}
