import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
	const router = useRouter();
	const { login } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async () => {
		setError(null);
		setSubmitting(true);
		try {
			await login(email, password);
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
		<View className='flex-1 items-center justify-center gap-[10px] bg-bbGreen p-[10px]'>
			<Text className='font-chewy text-[32px] text-bbRed'>Log In</Text>

			<TextInput
				placeholder='Email'
				placeholderTextColor='#E8242F'
				value={email}
				onChangeText={setEmail}
				autoCapitalize='none'
				keyboardType='email-address'
				className='w-full rounded-lg border-4 border-bbRed bg-bbYellow p-2 text-[18px] text-bbRed'
			/>
			<TextInput
				placeholder='Password'
				placeholderTextColor='#E8242F'
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				className='w-full rounded-lg border-4 border-bbRed bg-bbYellow p-2 text-[18px] text-bbRed'
			/>

			{error ? <Text className='font-chewy text-bbRed'>{error}</Text> : null}

			<Pressable
				className='w-full items-center justify-center rounded-lg border-4 border-bbRed bg-bbYellow p-2'
				onPress={handleSubmit}
				disabled={submitting}
				accessibilityRole='button'
			>
				<Text className='font-chewy text-[20px] text-bbRed'>
					{submitting ? 'Logging In...' : 'Log In'}
				</Text>
			</Pressable>

			<Pressable onPress={() => router.push('/signup')}>
				<Text className='font-chewy text-bbRed underline'>
					Need an account? Sign Up
				</Text>
			</Pressable>
		</View>
	);
}
