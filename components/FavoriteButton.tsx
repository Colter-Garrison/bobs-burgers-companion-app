import React from 'react';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

interface FavoriteButtonProps {
	favorited: boolean;
	onToggle: () => void;
}

export function FavoriteButton({ favorited, onToggle }: FavoriteButtonProps) {
	const { token } = useAuth();
	const router = useRouter();

	return (
		<Pressable
			onPress={() => (token ? onToggle() : router.push('/login'))}
			hitSlop={8}
			accessibilityRole='button'
			accessibilityLabel={
				favorited ? 'Remove from favorites' : 'Add to favorites'
			}
		>
			<Ionicons
				name={favorited ? 'star' : 'star-outline'}
				size={24}
				color='#E8242F'
			/>
		</Pressable>
	);
}
