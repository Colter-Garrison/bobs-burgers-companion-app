import React from 'react';
import {
	Image,
	Linking,
	Pressable,
	ScrollView,
	Text,
	View,
} from 'react-native';
import { Character, getCharacters } from '../../hooks/fetchCharacters';
import { useCategoryData } from '../../hooks/useCategoryData';
import { useFavorites } from '../../hooks/useFavorites';
import { FavoriteButton } from '../../components/FavoriteButton';
import { CategorySkeleton } from '../../components/CategorySkeleton';
import { ErrorState } from '../../components/ErrorState';

export default function Characters() {
	const { isFavorited, addFavorite, removeFavorite } = useFavorites();
	const {
		data: characters,
		loading,
		error,
		retry,
	} = useCategoryData<Character>(getCharacters);
	const handlePress = (character: Character) => {
		Linking.openURL(character.wikiUrl);
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
										<Text className='font-chewy text-base text-bbRed'>
											Name: {character.name}
										</Text>
										<Text>
											{character.relatives.length > 0 ? (
												<Text className='font-chewy text-base text-bbRed'>
													Relatives:{' '}
													{character.relatives
														.map((relative) => relative.name)
														.join(', ')}
												</Text>
											) : (
												<Text className='font-chewy text-base text-bbRed'>
													Relatives: None
												</Text>
											)}
										</Text>
										<Text>
											{character.occupation ? (
												<Text className='font-chewy text-base text-bbRed'>
													Occupation: {character.occupation}
												</Text>
											) : (
												<Text className='font-chewy text-base text-bbRed'>
													Occupation: None
												</Text>
											)}
										</Text>
										<Text className='font-chewy text-base text-bbRed'>
											First Episode: {character.firstEpisode}
										</Text>
										<Text>
											{character.voicedBy ? (
												<Text className='font-chewy text-base text-bbRed'>
													Voiced By: {character.voicedBy}
												</Text>
											) : (
												<Text className='font-chewy text-base text-bbRed'>
													Voiced By: Unknown
												</Text>
											)}
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
