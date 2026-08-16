import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface ErrorStateProps {
	message?: string;
	onRetry: () => void;
}

// Shown in place of a category screen's list when its fetch fails —
// distinct from an empty API result, which each screen still handles on
// its own with a "no data" message.
export function ErrorState({ message, onRetry }: ErrorStateProps) {
	return (
		<View className='flex-1 flex-col items-center justify-center gap-[10px] bg-bbGreen p-[10px]'>
			<Text className='font-chewy text-[20px] text-center text-bbRed'>
				{message ?? 'Something went wrong.'}
			</Text>
			<Pressable
				onPress={onRetry}
				accessibilityRole='button'
				className='items-center justify-center rounded-lg border-4 border-bbRed bg-bbYellow p-2'
			>
				<Text className='font-chewy text-[20px] text-bbRed'>Retry</Text>
			</Pressable>
		</View>
	);
}
