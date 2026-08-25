import React, { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Pressable, Text, TextInput, View } from 'react-native'
import { resetPassword } from '../../lib/apiClient'
import { useTheme } from '../../hooks/useTheme'

export default function ResetPassword() {
	const router = useRouter()
	const { isDark, colors } = useTheme()
	const { token } = useLocalSearchParams<{ token: string }>()
	const [newPassword, setNewPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [submitting, setSubmitting] = useState(false)

	const handleSubmit = async () => {
		setError(null)
		setSubmitting(true)
		try {
			await resetPassword(token, newPassword)
			router.push('/login')
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
				Reset Password
			</Text>

			<TextInput
				placeholder='New password (min. 8 characters)'
				placeholderTextColor={isDark ? '#F0F0F0' : colors.accent}
				value={newPassword}
				onChangeText={setNewPassword}
				secureTextEntry
				textContentType='newPassword'
				autoComplete='new-password'
				accessibilityLabel='New password, minimum 8 characters'
				className='w-full rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-2 text-[18px] text-lightAccent dark:text-darkAccent'
			/>

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
				disabled={submitting || !token}
				accessibilityRole='button'
				accessibilityState={{ busy: submitting }}
			>
				<Text className='font-chewy text-[20px] text-lightAccent dark:text-darkAccent'>
					{submitting ? 'Resetting...' : 'Reset Password'}
				</Text>
			</Pressable>
		</View>
	)
}
