import React from 'react';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

interface FavoriteButtonProps {
	favorited: boolean;
	onToggle: () => void;
	itemName: string;
}

export function FavoriteButton({
	favorited,
	onToggle,
	itemName,
}: FavoriteButtonProps) {
	const { token } = useAuth();
	const router = useRouter();
	const { colors } = useTheme();
	const iconColor = colors.accent;

	return (
		<Pressable
			onPress={() => (token ? onToggle() : router.push('/login'))}
			hitSlop={10}
			className='ml-1'
			accessibilityRole='button'
			accessibilityLabel={
				favorited
					? `Remove ${itemName} from favorites`
					: `Add ${itemName} to favorites`
			}
		>
			<MaterialCommunityIcons
				name='hamburger'
				size={24}
				color={iconColor}
				style={{ opacity: favorited ? 1 : 0.5 }}
			/>
		</Pressable>
	);
}
