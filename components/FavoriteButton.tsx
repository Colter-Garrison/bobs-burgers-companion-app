import React from 'react';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
			// Every card puts this next to a flexible-width text column —
			// a long wrapped bio's last line otherwise runs right up
			// against the icon with no breathing room. Left margin only:
			// the spacing on every other side already comes from the
			// card's own layout and looked right as-is.
			className='ml-1'
			accessibilityRole='button'
			accessibilityLabel={
				favorited ? 'Remove from favorites' : 'Add to favorites'
			}
		>
			{/* MaterialCommunityIcons' "hamburger" has no outline variant
			the way Ionicons' star/star-outline pair does, so favorited vs
			not is shown via opacity on the same glyph instead. */}
			<MaterialCommunityIcons
				name='hamburger'
				size={24}
				color='#E8242F'
				style={{ opacity: favorited ? 1 : 0.5 }}
			/>
		</Pressable>
	);
}
