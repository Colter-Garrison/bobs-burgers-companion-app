import React, { useCallback, useState } from 'react'
import { useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { Pressable, Text, TextInput, View } from 'react-native'
import { requestUsernameRecovery } from '../../lib/apiClient'
import { useTheme } from '../../hooks/useTheme'

export default function ForgotUsername() {
	const router = useRouter()
	const { isDark, colors } = useTheme()
	const [email, setEmail] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [message, setMessage] = useState<string | null>(null)
	const [submitting, setSubmitting] = useState(false)

	useFocusEffect(
		useCallback(() => {
			return () => {
				setEmail('')
				setError(null)
				setMessage(null)
			}
		}, []),
	)

	const handleSubmit = async () => {
		setError(null)
		setMessage(null)
		setSubmitting(true)
		try {
			const result = await requestUsernameRecovery(email)
			setMessage(result.message)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Something went wrong')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<View className='flex-1 items-center justify-center gap-[10px] bg-lightBg dark:bg-darkBg p-[10px]'>
			<Text
				accessibilityRole='header'
				className='font-chewy text-[32px] text-lightAccent dark:text-darkAccent'
			>
				Forgot Username
			</Text>

			<TextInput
				placeholder='Email'
				placeholderTextColor={isDark ? '#F0F0F0' : colors.accent}
				value={email}
				onChangeText={setEmail}
				autoCapitalize='none'
				keyboardType='email-address'
				textContentType='emailAddress'
				autoComplete='email'
				accessibilityLabel='Email'
				className='w-full rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-2 text-[18px] text-lightAccent dark:text-darkAccent'
			/>

			{message ? (
				<Text
					accessibilityRole='alert'
					accessibilityLiveRegion='polite'
					className='font-chewy text-center text-lightAccent dark:text-darkAccent'
				>
					{message}
				</Text>
			) : null}
			{error ? (
				<Text
					accessibilityRole='alert'
					accessibilityLiveRegion='polite'
					className='font-chewy text-lightAccent dark:text-darkAccent'
				>
					{error}
				</Text>
			) : null}

			<Pressable
				className='w-full items-center justify-center rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-2'
				onPress={handleSubmit}
				disabled={submitting}
				accessibilityRole='button'
				accessibilityState={{ busy: submitting }}
			>
				<Text className='font-chewy text-[20px] text-lightAccent dark:text-darkAccent'>
					{submitting ? 'Sending...' : 'Send'}
				</Text>
			</Pressable>

			<Pressable
				onPress={() => router.push('/login')}
				hitSlop={12}
				accessibilityRole='button'
			>
				<Text className='font-chewy text-lightAccent dark:text-darkAccent underline'>
					Back to Log In
				</Text>
			</Pressable>
		</View>
	)
}
