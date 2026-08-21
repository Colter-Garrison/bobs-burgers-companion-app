import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Platform, Pressable, Text, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export default function Account() {
	const router = useRouter();
	const { token, username, loading, deleteAccount } = useAuth();
	const [error, setError] = useState<string | null>(null);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		if (!loading && !token) {
			router.push('/login');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loading]);

	if (!token) {
		return null;
	}

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
				onPress={handleDeleteAccount}
				disabled={deleting}
				accessibilityRole='button'
				accessibilityState={{ busy: deleting }}
			>
				<Text className='font-chewy text-[20px] text-lightAccent dark:text-darkAccent'>
					{deleting ? 'Deleting...' : 'Delete Account'}
				</Text>
			</Pressable>
		</View>
	);
}
