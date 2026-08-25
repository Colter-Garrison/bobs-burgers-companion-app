import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { Alert, Platform, Pressable, Text, TextInput, View } from 'react-native'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { AccountActionModal } from '../../components/AccountActionModal'

const fieldClassName =
	'w-full rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-2 text-[16px] text-lightAccent dark:text-darkAccent'
const submitButtonClassName =
	'w-full items-center justify-center rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-2'
const submitButtonTextClassName =
	'font-chewy text-[18px] text-lightAccent dark:text-darkAccent'
const errorTextClassName = 'font-chewy text-lightAccent dark:text-darkAccent'

const actionButtonClassName =
	'w-full items-center justify-center rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-2'
const disabledActionButtonClassName =
	'w-full items-center justify-center rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-2 opacity-50'

export default function Account() {
	const router = useRouter()
	const { isDark, colors } = useTheme()
	const {
		token,
		username,
		email,
		emailVerified,
		loading,
		deleteAccount,
		refreshProfile,
		updateUsername,
		updatePassword,
		updateEmail,
	} = useAuth()
	const [error, setError] = useState<string | null>(null)
	const [deleting, setDeleting] = useState(false)

	useEffect(() => {
		if (!loading && !token) {
			router.push('/login')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loading])

	useFocusEffect(
		useCallback(() => {
			refreshProfile()
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []),
	)

	const [usernameModalOpen, setUsernameModalOpen] = useState(false)
	const [oldUsername, setOldUsername] = useState('')
	const [newUsername, setNewUsername] = useState('')
	const [usernameError, setUsernameError] = useState<string | null>(null)
	const [usernameSubmitting, setUsernameSubmitting] = useState(false)

	const closeUsernameModal = () => {
		setUsernameModalOpen(false)
		setOldUsername('')
		setNewUsername('')
		setUsernameError(null)
	}

	const handleUsernameSubmit = async () => {
		setUsernameError(null)
		setUsernameSubmitting(true)
		try {
			await updateUsername(oldUsername, newUsername)
			closeUsernameModal()
		} catch (err) {
			setUsernameError(
				err instanceof Error ? err.message : 'Something went wrong',
			)
		} finally {
			setUsernameSubmitting(false)
		}
	}

	const [passwordModalOpen, setPasswordModalOpen] = useState(false)
	const [oldPassword, setOldPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmNewPassword, setConfirmNewPassword] = useState('')
	const [passwordError, setPasswordError] = useState<string | null>(null)
	const [passwordSubmitting, setPasswordSubmitting] = useState(false)

	const closePasswordModal = () => {
		setPasswordModalOpen(false)
		setOldPassword('')
		setNewPassword('')
		setConfirmNewPassword('')
		setPasswordError(null)
	}

	const handlePasswordSubmit = async () => {
		setPasswordError(null)
		if (newPassword !== confirmNewPassword) {
			setPasswordError('New passwords do not match')
			return
		}
		setPasswordSubmitting(true)
		try {
			await updatePassword(oldPassword, newPassword)
			closePasswordModal()
		} catch (err) {
			setPasswordError(
				err instanceof Error ? err.message : 'Something went wrong',
			)
		} finally {
			setPasswordSubmitting(false)
		}
	}

	const [emailModalOpen, setEmailModalOpen] = useState(false)
	const [oldEmailField, setOldEmailField] = useState('')
	const [newEmailField, setNewEmailField] = useState('')
	const [emailError, setEmailError] = useState<string | null>(null)
	const [emailSubmitting, setEmailSubmitting] = useState(false)

	const closeEmailModal = () => {
		setEmailModalOpen(false)
		setOldEmailField('')
		setNewEmailField('')
		setEmailError(null)
	}

	const handleEmailSubmit = async () => {
		setEmailError(null)
		setEmailSubmitting(true)
		try {
			await updateEmail(newEmailField, email ? oldEmailField : undefined)
			closeEmailModal()
		} catch (err) {
			setEmailError(err instanceof Error ? err.message : 'Something went wrong')
		} finally {
			setEmailSubmitting(false)
		}
	}

	if (!token) {
		return null
	}

	const performDelete = async () => {
		setError(null)
		setDeleting(true)
		try {
			await deleteAccount()
			router.push('/')
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Something went wrong')
		} finally {
			setDeleting(false)
		}
	}

	const handleDeleteAccount = () => {
		if (Platform.OS === 'web') {
			if (window.confirm('Delete your account? This cannot be undone.')) {
				void performDelete()
			}
			return
		}

		Alert.alert('Delete Account', 'This cannot be undone.', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				style: 'destructive',
				onPress: () => void performDelete(),
			},
		])
	}

	const emailStatusText = !email
		? 'No email on file'
		: !emailVerified
			? `Verification email sent to ${email} — check your inbox`
			: `${email} (verified)`

	return (
		<View className='flex-1 items-center justify-center gap-[10px] bg-lightBg dark:bg-darkBg p-[10px]'>
			<Text
				accessibilityRole='header'
				className='font-chewy text-[32px] text-lightAccent dark:text-darkAccent'
			>
				Account
			</Text>
			<Text className='font-chewy text-lightAccent dark:text-darkAccent'>
				{username}
			</Text>
			<Text
				accessibilityLiveRegion='polite'
				className='font-chewy text-center text-[14px] text-lightAccent dark:text-darkAccent'
			>
				{emailStatusText}
			</Text>

			{error ? (
				<Text
					accessibilityRole='alert'
					accessibilityLiveRegion='polite'
					className={errorTextClassName}
				>
					{error}
				</Text>
			) : null}

			<Pressable
				className={
					emailVerified ? actionButtonClassName : disabledActionButtonClassName
				}
				onPress={() => emailVerified && setUsernameModalOpen(true)}
				disabled={!emailVerified}
				accessibilityRole='button'
				accessibilityState={{ disabled: !emailVerified }}
			>
				<Text className={submitButtonTextClassName}>Change Username</Text>
			</Pressable>

			<Pressable
				className={
					emailVerified ? actionButtonClassName : disabledActionButtonClassName
				}
				onPress={() => emailVerified && setPasswordModalOpen(true)}
				disabled={!emailVerified}
				accessibilityRole='button'
				accessibilityState={{ disabled: !emailVerified }}
			>
				<Text className={submitButtonTextClassName}>Change Password</Text>
			</Pressable>

			{!emailVerified ? (
				<Text className='font-chewy text-center text-[13px] text-lightAccent dark:text-darkAccent'>
					Verify an email to unlock username and password changes
				</Text>
			) : null}

			<Pressable
				className={actionButtonClassName}
				onPress={() => setEmailModalOpen(true)}
				accessibilityRole='button'
			>
				<Text className={submitButtonTextClassName}>
					{email ? 'Change Email' : 'Add Email'}
				</Text>
			</Pressable>

			<Pressable
				className={actionButtonClassName}
				onPress={handleDeleteAccount}
				disabled={deleting}
				accessibilityRole='button'
				accessibilityState={{ busy: deleting }}
			>
				<Text className={submitButtonTextClassName}>
					{deleting ? 'Deleting...' : 'Delete Account'}
				</Text>
			</Pressable>

			<AccountActionModal
				visible={usernameModalOpen}
				onClose={closeUsernameModal}
				title='Change Username'
			>
				<TextInput
					placeholder='Old username'
					placeholderTextColor={isDark ? '#F0F0F0' : colors.accent}
					value={oldUsername}
					onChangeText={setOldUsername}
					autoCapitalize='none'
					maxLength={25}
					accessibilityLabel='Old username'
					className={fieldClassName}
				/>
				<TextInput
					placeholder='New username'
					placeholderTextColor={isDark ? '#F0F0F0' : colors.accent}
					value={newUsername}
					onChangeText={setNewUsername}
					autoCapitalize='none'
					maxLength={25}
					accessibilityLabel='New username'
					className={fieldClassName}
				/>
				{usernameError ? (
					<Text
						accessibilityRole='alert'
						accessibilityLiveRegion='polite'
						className={errorTextClassName}
					>
						{usernameError}
					</Text>
				) : null}
				<Pressable
					className={submitButtonClassName}
					onPress={handleUsernameSubmit}
					disabled={usernameSubmitting}
					accessibilityRole='button'
					accessibilityState={{ busy: usernameSubmitting }}
				>
					<Text className={submitButtonTextClassName}>
						{usernameSubmitting ? 'Saving...' : 'Save'}
					</Text>
				</Pressable>
			</AccountActionModal>

			<AccountActionModal
				visible={passwordModalOpen}
				onClose={closePasswordModal}
				title='Change Password'
			>
				<TextInput
					placeholder='Old password'
					placeholderTextColor={isDark ? '#F0F0F0' : colors.accent}
					value={oldPassword}
					onChangeText={setOldPassword}
					secureTextEntry
					textContentType='password'
					autoComplete='current-password'
					accessibilityLabel='Old password'
					className={fieldClassName}
				/>
				<TextInput
					placeholder='New password'
					placeholderTextColor={isDark ? '#F0F0F0' : colors.accent}
					value={newPassword}
					onChangeText={setNewPassword}
					secureTextEntry
					textContentType='newPassword'
					autoComplete='new-password'
					accessibilityLabel='New password'
					className={fieldClassName}
				/>
				<TextInput
					placeholder='Verify new password'
					placeholderTextColor={isDark ? '#F0F0F0' : colors.accent}
					value={confirmNewPassword}
					onChangeText={setConfirmNewPassword}
					secureTextEntry
					textContentType='newPassword'
					autoComplete='new-password'
					accessibilityLabel='Verify new password'
					className={fieldClassName}
				/>
				{passwordError ? (
					<Text
						accessibilityRole='alert'
						accessibilityLiveRegion='polite'
						className={errorTextClassName}
					>
						{passwordError}
					</Text>
				) : null}
				<Pressable
					className={submitButtonClassName}
					onPress={handlePasswordSubmit}
					disabled={passwordSubmitting}
					accessibilityRole='button'
					accessibilityState={{ busy: passwordSubmitting }}
				>
					<Text className={submitButtonTextClassName}>
						{passwordSubmitting ? 'Saving...' : 'Save'}
					</Text>
				</Pressable>
			</AccountActionModal>

			<AccountActionModal
				visible={emailModalOpen}
				onClose={closeEmailModal}
				title={email ? 'Change Email' : 'Add Email'}
			>
				{email ? (
					<TextInput
						placeholder='Old email'
						placeholderTextColor={isDark ? '#F0F0F0' : colors.accent}
						value={oldEmailField}
						onChangeText={setOldEmailField}
						autoCapitalize='none'
						keyboardType='email-address'
						accessibilityLabel='Old email'
						className={fieldClassName}
					/>
				) : null}
				<TextInput
					placeholder='New email'
					placeholderTextColor={isDark ? '#F0F0F0' : colors.accent}
					value={newEmailField}
					onChangeText={setNewEmailField}
					autoCapitalize='none'
					keyboardType='email-address'
					accessibilityLabel='New email'
					className={fieldClassName}
				/>
				{emailError ? (
					<Text
						accessibilityRole='alert'
						accessibilityLiveRegion='polite'
						className={errorTextClassName}
					>
						{emailError}
					</Text>
				) : null}
				<Pressable
					className={submitButtonClassName}
					onPress={handleEmailSubmit}
					disabled={emailSubmitting}
					accessibilityRole='button'
					accessibilityState={{ busy: emailSubmitting }}
				>
					<Text className={submitButtonTextClassName}>
						{emailSubmitting ? 'Saving...' : 'Save'}
					</Text>
				</Pressable>
			</AccountActionModal>
		</View>
	)
}
