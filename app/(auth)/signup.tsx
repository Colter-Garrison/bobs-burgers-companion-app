import React, { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export default function Signup() {
	const router = useRouter();
	const { isDark, colors } = useTheme();
	const { signup } = useAuth();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	// Separate from `error` (which is for server-side failures like a
	// taken username) and rendered right under the username field itself,
	// not sharing the generic error spot below the password field — a
	// symbol the user just typed should be explained right where they
	// typed it, not after a round trip to the server.
	const [usernameError, setUsernameError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	// A Drawer.Screen stays mounted when you navigate away from it (unlike
	// Stack, which unmounts), so this state would otherwise sit here
	// unchanged — still showing whatever was typed — the next time this
	// screen comes back into view. Clearing on blur means it's always
	// fresh, whether that's from switching screens mid-typing or from a
	// later log out.
	useFocusEffect(
		useCallback(() => {
			return () => {
				setUsername('');
				setPassword('');
				setError(null);
				setUsernameError(null);
			};
		}, []),
	);

	const handleUsernameChange = (text: string) => {
		setUsername(text);
		// Clears the moment they start fixing it, rather than leaving a
		// stale error sitting there while they're actively correcting it.
		if (usernameError) setUsernameError(null);
	};

	const handleSubmit = async () => {
		setError(null);
		// Checked client-side first, before ever touching the network —
		// the same rule server/src/routes/auth.ts enforces (letters and
		// numbers only, 2-25 characters; the 25-char half of that is
		// already unreachable here thanks to the input's own maxLength).
		if (username.length < 2) {
			setUsernameError('Username must be at least 2 characters.');
			return;
		}
		if (!/^[a-zA-Z0-9]+$/.test(username)) {
			setUsernameError('Username can only contain letters and numbers.');
			return;
		}
		setUsernameError(null);

		setSubmitting(true);
		try {
			await signup(username, password);
			// router.replace('/') is a no-op here — /signup is a
			// Drawer.Screen, and expo-router's replace() doesn't
			// navigate away from a screen inside a drawer navigator in
			// this version. push() does, and drawer screens are
			// siblings with no back-stack anyway, so there's no
			// leftover history entry to worry about.
			router.push('/');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Something went wrong');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<View className='flex-1 items-center justify-center gap-[10px] bg-lightBg dark:bg-darkBg p-[10px]'>
			<Text
				accessibilityRole='header'
				className='font-chewy text-[32px] text-lightAccent dark:text-darkAccent'
			>
				Sign Up
			</Text>

			<TextInput
				placeholder='Username (2-25 chars)'
				placeholderTextColor={isDark ? '#F0F0F0' : colors.accent}
				value={username}
				onChangeText={handleUsernameChange}
				autoCapitalize='none'
				maxLength={25}
				accessibilityLabel='Username, 2 to 25 letters and numbers'
				className='w-full rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-2 text-[18px] text-lightAccent dark:text-darkAccent'
			/>
			{usernameError ? (
				<Text
					accessibilityRole='alert'
					accessibilityLiveRegion='polite'
					className='font-chewy text-[14px] text-lightAccent dark:text-darkAccent'
				>
					{usernameError}
				</Text>
			) : null}
			<TextInput
				placeholder='Password (min. 8 characters)'
				placeholderTextColor={isDark ? '#F0F0F0' : colors.accent}
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				textContentType='newPassword'
				autoComplete='new-password'
				accessibilityLabel='Password, minimum 8 characters'
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
				disabled={submitting}
				accessibilityRole='button'
				accessibilityState={{ busy: submitting }}
			>
				<Text className='font-chewy text-[20px] text-lightAccent dark:text-darkAccent'>
					{submitting ? 'Signing Up...' : 'Sign Up'}
				</Text>
			</Pressable>

			<Pressable
				onPress={() => router.push('/login')}
				// Plain underlined text with no padding at all measures
				// well under the 44x44 minimum touch target guideline.
				hitSlop={12}
				accessibilityRole='button'
			>
				<Text className='font-chewy text-lightAccent dark:text-darkAccent underline'>
					Already have an account? Log In
				</Text>
			</Pressable>
		</View>
	);
}
