import React from 'react';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

interface FavoriteButtonProps {
	favorited: boolean;
	onToggle: () => void;
	// Required, not optional — every card lives in a list of many, and a
	// screen-reader user swiping through relies on this to tell which
	// item's favorite button they're on. Without it, every button in a
	// list of 20 announces the same generic "Add to favorites."
	itemName: string;
}

export function FavoriteButton({
	favorited,
	onToggle,
	itemName,
}: FavoriteButtonProps) {
	const { token } = useAuth();
	const router = useRouter();
	// Was hardcoded to the light-mode red in both themes — on the dark
	// card background (#323233) that measured ~2.9:1 contrast, below even
	// the 3:1 floor for graphical objects. #FF66CC (a brighter/lighter
	// take on the dark palette's own magenta, #FF00AA) gets ~4.9:1 instead.
	const { isDark } = useTheme();

	return (
		<Pressable
			onPress={() => (token ? onToggle() : router.push('/login'))}
			// 24px icon: 8pt hitSlop per edge landed at 40x40, just under
			// the 44x44 minimum touch target guideline — 10pt closes the
			// gap exactly.
			hitSlop={10}
			// Every card puts this next to a flexible-width text column —
			// a long wrapped bio's last line otherwise runs right up
			// against the icon with no breathing room. Left margin only:
			// the spacing on every other side already comes from the
			// card's own layout and looked right as-is.
			className='ml-1'
			accessibilityRole='button'
			accessibilityLabel={
				favorited
					? `Remove ${itemName} from favorites`
					: `Add ${itemName} to favorites`
			}
		>
			{/* MaterialCommunityIcons' "hamburger" has no outline variant
			the way Ionicons' star/star-outline pair does, so favorited vs
			not is shown via opacity on the same glyph instead. */}
			<MaterialCommunityIcons
				name='hamburger'
				size={24}
				color={isDark ? '#FF66CC' : '#2C4A63'}
				style={{ opacity: favorited ? 1 : 0.5 }}
			/>
		</Pressable>
	);
}
