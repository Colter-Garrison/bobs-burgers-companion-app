import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Character, getCharacters } from '../../hooks/fetchCharacters';
import { useCategoryData } from '../../hooks/useCategoryData';
import { useFavorites } from '../../hooks/useFavorites';
import { composeCharacterShortBio } from '../../lib/categoryBio';
import { FavoriteButton } from '../../components/FavoriteButton';
import { CategorySkeleton } from '../../components/CategorySkeleton';
import { ErrorState } from '../../components/ErrorState';
import { OfflineBanner } from '../../components/OfflineBanner';

export default function Characters() {
	const router = useRouter();
	const { isFavorited, addFavorite, removeFavorite } = useFavorites();
	const {
		data: characters,
		loading,
		error,
		retry,
		cachedAt,
	} = useCategoryData<Character>(getCharacters, 'characters');

	const handlePress = (character: Character) => {
		router.push({
			pathname: '/detail/[category]/[id]',
			params: { category: 'characters', id: String(character.id) },
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
				{characters.length > 0 ? (
					characters.map((character) => {
						return (
							<View
								key={character.id}
								className='flex-row items-center justify-between gap-2 rounded-lg border-4 border-bbRed bg-bbYellow p-2'
							>
								<Pressable
									className='flex-1 flex-row items-center gap-2'
									onPress={() => handlePress(character)}
								>
									{character.image ? (
										<Image
											source={{ width: 100, height: 100, uri: character.image }}
											width={100}
											height={100}
											resizeMode='contain'
										/>
									) : null}
									<View className='max-w-[70%] flex-col md:max-w-[90%]'>
										<Text
											testID='card-title'
											className='font-chewy text-base text-bbRed'
										>
											{character.name}
										</Text>
										<Text className='font-chewy text-base text-bbRed'>
											{composeCharacterShortBio(character)}
										</Text>
									</View>
								</Pressable>
								<FavoriteButton
									favorited={isFavorited('character', character.id)}
									onToggle={() =>
										isFavorited('character', character.id)
											? removeFavorite('character', character.id)
											: addFavorite('character', character.id)
									}
								/>
							</View>
						);
					})
				) : (
					<View className='flex-1 flex-col items-center justify-center'>
						<Text className='font-chewy text-[44px]'>Character UH OH...</Text>
					</View>
				)}
			</View>
		</ScrollView>
	);
}
