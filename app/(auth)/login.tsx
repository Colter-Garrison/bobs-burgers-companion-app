import React, { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export default function Login() {
	const router = useRouter();
	const { isDark } = useTheme();
	const { login } = useAuth();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
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
			};
		}, []),
	);

	const handleSubmit = async () => {
		setError(null);
		setSubmitting(true);
		try {
			await login(username, password);
			// router.replace('/') is a no-op here — /login is a
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
				Log In
			</Text>

			<TextInput
				placeholder='Username'
				placeholderTextColor={isDark ? '#F0F0F0' : '#2C4A63'}
				value={username}
				onChangeText={setUsername}
				autoCapitalize='none'
				maxLength={25}
				accessibilityLabel='Username'
				className='w-full rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-2 text-[18px] text-lightAccent dark:text-darkAccent'
			/>
			<TextInput
				placeholder='Password'
				placeholderTextColor={isDark ? '#F0F0F0' : '#2C4A63'}
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				textContentType='password'
				autoComplete='current-password'
				accessibilityLabel='Password'
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
					{submitting ? 'Logging In...' : 'Log In'}
				</Text>
			</Pressable>

			<Pressable
				onPress={() => router.push('/signup')}
				accessibilityRole='button'
			>
				<Text className='font-chewy text-lightAccent dark:text-darkAccent underline'>
					Need an account? Sign Up
				</Text>
			</Pressable>
		</View>
	);
}
