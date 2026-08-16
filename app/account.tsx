import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Platform, Pressable, Text, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export default function Account() {
	const router = useRouter();
	const { token, email, loading, logout, deleteAccount } = useAuth();
	const [error, setError] = useState<string | null>(null);
	const [deleting, setDeleting] = useState(false);

	// This screen is reachable by direct URL, not just the drawer link
	// (which already hides itself when logged out) — so it needs its own
	// guard against a logged-out visit.
	useEffect(() => {
		if (!loading && !token) {
			router.push('/login');
		}
	}, [loading, token, router]);

	if (!token) {
		return null;
	}

	const handleLogout = async () => {
		await logout();
		router.push('/');
	};

	const performDelete = async () => {
		setError(null);
		setDeleting(true);
		try {
			await deleteAccount();
			router.push('/');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Something went wrong');
		} finally {
			setDeleting(false);
		}
	};

	const handleDeleteAccount = () => {
		// Alert.alert is a no-op on react-native-web — window.confirm is
		// the web equivalent.
		if (Platform.OS === 'web') {
			if (window.confirm('Delete your account? This cannot be undone.')) {
				void performDelete();
			}
			return;
		}

		Alert.alert('Delete Account', 'This cannot be undone.', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				style: 'destructive',
				onPress: () => void performDelete(),
			},
		]);
	};

	return (
		<View className='flex-1 items-center justify-center gap-[10px] bg-bbGreen p-[10px]'>
			<Text className='font-chewy text-[32px] text-bbRed'>Account</Text>
			<Text className='font-chewy text-bbRed'>{email}</Text>

			{error ? <Text className='font-chewy text-bbRed'>{error}</Text> : null}

			<Pressable
				className='w-full items-center justify-center rounded-lg border-4 border-bbRed bg-bbYellow p-2'
				onPress={handleLogout}
				accessibilityRole='button'
			>
				<Text className='font-chewy text-[20px] text-bbRed'>Log Out</Text>
			</Pressable>

			<Pressable
				className='w-full items-center justify-center rounded-lg border-4 border-bbRed bg-bbYellow p-2'
				onPress={handleDeleteAccount}
				disabled={deleting}
				accessibilityRole='button'
			>
				<Text className='font-chewy text-[20px] text-bbRed'>
					{deleting ? 'Deleting...' : 'Delete Account'}
				</Text>
			</Pressable>
		</View>
	);
}
