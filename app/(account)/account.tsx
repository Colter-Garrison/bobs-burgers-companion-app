import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Platform, Pressable, Text, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export default function Account() {
	const router = useRouter();
	const { token, username, loading, deleteAccount } = useAuth();
	const [error, setError] = useState<string | null>(null);
	const [deleting, setDeleting] = useState(false);

	// This screen is reachable by direct URL, not just the drawer link
	// (which already hides itself when logged out) — so it needs its own
	// guard against a logged-out visit. Deliberately depends on `loading`
	// alone, not `token`: `loading` only flips true->false once, right
	// after the initial session restore, so this only checks "did we
	// arrive here already logged out" — it does NOT re-fire every time
	// `token` later changes. That matters because Drawer screens never
	// unmount, so this component is still mounted (and still has this
	// effect registered) after Delete Account clears the token, or after
	// Log Out is pressed in the drawer while this screen sits underneath
	// it — if `token` were a dependency, this guard would fire a redirect
	// to /login that races (and can override) those actions' own explicit
	// navigation to /. A session expiring for some other reason (e.g. a
	// 401 while mounted elsewhere) is already handled by
	// useFavorites' own logout()+redirect, so this guard doesn't need to
	// duplicate that.
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
		<View className='flex-1 items-center justify-center gap-[10px] bg-lightBg dark:bg-darkBg p-[10px]'>
			<Text className='font-chewy text-[32px] text-lightAccent dark:text-darkAccent'>
				Account
			</Text>
			<Text className='font-chewy text-lightAccent dark:text-darkAccent'>
				{username}
			</Text>

			{error ? (
				<Text className='font-chewy text-lightAccent dark:text-darkAccent'>
					{error}
				</Text>
			) : null}

			<Pressable
				className='w-full items-center justify-center rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-2'
				onPress={handleDeleteAccount}
				disabled={deleting}
				accessibilityRole='button'
			>
				<Text className='font-chewy text-[20px] text-lightAccent dark:text-darkAccent'>
					{deleting ? 'Deleting...' : 'Delete Account'}
				</Text>
			</Pressable>
		</View>
	);
}
