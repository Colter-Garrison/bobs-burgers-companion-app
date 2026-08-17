import React, { useCallback } from 'react';
import {
	Image,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Character, getCharacters } from '../../hooks/fetchCharacters';
import { useCategoryData } from '../../hooks/useCategoryData';
import { useCategorySearch } from '../../hooks/useCategorySearch';
import { useAttributeFilters } from '../../hooks/useAttributeFilters';
import { useFavorites } from '../../hooks/useFavorites';
import { composeCharacterShortBio } from '../../lib/categoryBio';
import { FavoriteButton } from '../../components/FavoriteButton';
import { FilterPanel } from '../../components/FilterPanel';
import { CategorySkeleton } from '../../components/CategorySkeleton';
import { ErrorState } from '../../components/ErrorState';
import { OfflineBanner } from '../../components/OfflineBanner';

// Name only, not the bio — the bio's "First appeared in <episode title>"
// and relatives text pulls in unrelated matches (e.g. searching "Linda"
// surfacing every character who first appeared in an episode with
// "Linda" in the title), which isn't what a character name search means.
const getSearchableText = (character: Character) => character.name;

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
	const {
		query,
		setQuery,
		filteredItems: searchedCharacters,
	} = useCategorySearch(characters, getSearchableText);
	const attributeFilters = useAttributeFilters<Character>();

	// Same reasoning as app/index.tsx: this is a Drawer.Screen that stays
	// mounted when you navigate away, so a typed-in query/filter/sort
	// would otherwise still be sitting here the next time you land back.
	useFocusEffect(
		useCallback(() => {
			return () => {
				setQuery('');
				attributeFilters.reset();
			};
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []),
	);

	const visibleCharacters = attributeFilters.sortItems(
		searchedCharacters.filter(attributeFilters.matches),
		(character) => character.name,
	);

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
				<TextInput
					placeholder='Search Characters...'
					placeholderTextColor='#E8242F'
					value={query}
					onChangeText={setQuery}
					className='font-chewy rounded-lg border-4 border-bbRed bg-bbYellow p-2 text-[18px] text-bbRed'
				/>
				<FilterPanel
					showGenderHairFilters
					sortDirection={attributeFilters.sortDirection}
					onToggleSort={attributeFilters.toggleSort}
					genders={attributeFilters.genders}
					hairColors={attributeFilters.hairColors}
					onToggleGender={attributeFilters.toggleGender}
					onToggleHair={attributeFilters.toggleHair}
					activeCount={attributeFilters.activeCount}
				/>
				{cachedAt ? (
					<OfflineBanner cachedAt={cachedAt} onRetry={retry} />
				) : null}
				{visibleCharacters.length > 0 ? (
					visibleCharacters.map((character) => {
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
