import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { verifyEmail } from '../lib/apiClient'
import { useAuth } from '../hooks/useAuth'

export default function VerifyEmail() {
	const router = useRouter()
	const { token: authToken, refreshProfile } = useAuth()
	const { token } = useLocalSearchParams<{ token: string }>()
	const [status, setStatus] = useState<'checking' | 'success' | 'error'>(
		'checking',
	)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		async function verify() {
			if (!token) {
				setStatus('error')
				setError('This link is missing a verification token.')
				return
			}

			try {
				await verifyEmail(token)
				setStatus('success')
				// The link may have been opened in the same browser as an
				// active session — if so, sync that session's local
				// email-verified state with what the server now has. If not
				// logged in here, there's no local state to refresh.
				if (authToken) await refreshProfile()
			} catch (err) {
				setStatus('error')
				setError(err instanceof Error ? err.message : 'Something went wrong')
			}
		}
		verify()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token])

	return (
		<View className='flex-1 items-center justify-center gap-[10px] bg-lightBg dark:bg-darkBg p-[10px]'>
			<Text
				accessibilityRole='header'
				className='font-chewy text-[32px] text-lightAccent dark:text-darkAccent'
			>
				Verify Email
			</Text>

			{status === 'checking' ? (
				<Text className='font-chewy text-lightAccent dark:text-darkAccent'>
					Verifying...
				</Text>
			) : null}
			{status === 'success' ? (
				<Text
					accessibilityRole='alert'
					accessibilityLiveRegion='polite'
					className='font-chewy text-center text-lightAccent dark:text-darkAccent'
				>
					Your email is verified!
				</Text>
			) : null}
			{status === 'error' ? (
				<Text
					accessibilityRole='alert'
					accessibilityLiveRegion='polite'
					className='font-chewy text-center text-lightAccent dark:text-darkAccent'
				>
					{error}
				</Text>
			) : null}

			<Pressable
				onPress={() => router.push('/account')}
				hitSlop={12}
				accessibilityRole='button'
			>
				<Text className='font-chewy text-lightAccent dark:text-darkAccent underline'>
					Back to Account
				</Text>
			</Pressable>
		</View>
	)
}
