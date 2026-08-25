import React, { useEffect, useState } from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import { useRootNavigationState, useRouter } from 'expo-router'

export default function NotFound() {
	const router = useRouter()
	const rootNavigationState = useRootNavigationState()
	const [checkedRedirect, setCheckedRedirect] = useState(false)

	useEffect(() => {
		if (!rootNavigationState?.key) {
			return
		}

		if (Platform.OS !== 'web') {
			setCheckedRedirect(true)
			return
		}

		const path = window.location.pathname.toLowerCase()
		const token = new URLSearchParams(window.location.search).get('token') ?? ''

		if (path === '/verifyemail') {
			router.push(`/verifyEmail?token=${token}`)
			return
		}
		if (path === '/resetpassword') {
			router.push(`/resetPassword?token=${token}`)
			return
		}

		setCheckedRedirect(true)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [rootNavigationState?.key])

	if (!checkedRedirect) {
		return null
	}

	return (
		<View className='flex-1 items-center justify-center gap-[10px] bg-lightBg dark:bg-darkBg p-[10px]'>
			<Text
				accessibilityRole='header'
				className='font-chewy text-[32px] text-lightAccent dark:text-darkAccent'
			>
				Page Not Found
			</Text>
			<Text className='font-chewy text-center text-lightAccent dark:text-darkAccent'>
				This page doesn't exist.
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
