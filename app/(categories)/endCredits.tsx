import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
	EndCredit,
	getEndCreditsSequences,
} from '../../hooks/fetchEndCreditsSequences';
import { useCategoryData } from '../../hooks/useCategoryData';
import { useFavorites } from '../../hooks/useFavorites';
import { composeEndCreditShortBio } from '../../lib/categoryBio';
import { FavoriteButton } from '../../components/FavoriteButton';
import { CategorySkeleton } from '../../components/CategorySkeleton';
import { ErrorState } from '../../components/ErrorState';
import { OfflineBanner } from '../../components/OfflineBanner';

export default function EndCredits() {
	const router = useRouter();
	const { isFavorited, addFavorite, removeFavorite } = useFavorites();
	const {
		data: endCredits,
		loading,
		error,
		retry,
		cachedAt,
	} = useCategoryData<EndCredit>(getEndCreditsSequences, 'endCredits');

	const handlePress = (endCredit: EndCredit) => {
		router.push({
			pathname: '/detail/[category]/[id]',
			params: { category: 'endCredits', id: String(endCredit.id) },
		});
	};

	if (loading) {
		return <CategorySkeleton />;
	}

	if (error) {
		return <ErrorState message={error} onRetry={retry} />;
	}

	return (
		<ScrollView className='bg-bbGreen'>
			<View className='flex-col gap-2 p-2'>
				{cachedAt ? (
					<OfflineBanner cachedAt={cachedAt} onRetry={retry} />
				) : null}
				{endCredits.length > 0 ? (
					endCredits.map((credits) => (
						<View
							key={credits.id}
							className='flex-row items-center justify-between gap-2 rounded-lg border-4 border-bbRed bg-bbYellow p-2'
						>
							<Pressable
								className='flex-1 flex-row items-center gap-2'
								onPress={() => handlePress(credits)}
							>
								{credits.image ? (
									<Image
										source={{ width: 100, height: 100, uri: credits.image }}
										width={100}
										height={100}
										resizeMode='contain'
									/>
								) : null}
								<View className='max-w-[70%] flex-col'>
									<Text className='font-chewy text-base text-bbRed'>
										{composeEndCreditShortBio(credits)}
									</Text>
								</View>
							</Pressable>
							<FavoriteButton
								favorited={isFavorited('end_credit', credits.id)}
								onToggle={() =>
									isFavorited('end_credit', credits.id)
										? removeFavorite('end_credit', credits.id)
										: addFavorite('end_credit', credits.id)
								}
							/>
						</View>
					))
				) : (
					<View className='flex-1 flex-col items-center justify-center'>
						<Text className='font-chewy text-[44px]'>End Credits UH OH...</Text>
					</View>
				)}
			</View>
		</ScrollView>
	);
}
