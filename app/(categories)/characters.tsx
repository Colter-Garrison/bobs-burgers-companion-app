import React, { useCallback, useMemo } from 'react';
import {
	FlatList,
	Image,
	Pressable,
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
import { PAGE_SIZE, usePagination } from '../../hooks/usePagination';
import { useFavorites } from '../../hooks/useFavorites';
import { composeCharacterShortBio } from '../../lib/categoryBio';
import { FavoriteButton } from '../../components/FavoriteButton';
import { LoadMoreButton } from '../../components/LoadMoreButton';
import { FilterPanel } from '../../components/FilterPanel';
import { CategorySkeleton } from '../../components/CategorySkeleton';
import { ErrorState } from '../../components/ErrorState';
import { OfflineBanner } from '../../components/OfflineBanner';
import { useTheme } from '../../hooks/useTheme';

const getSearchableText = (character: Character) => character.name;

export default function Characters() {
	const router = useRouter();
	const { isDark, colors } = useTheme();
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

	useFocusEffect(
		useCallback(() => {
			return () => {
				setQuery('');
				attributeFilters.reset();
			};
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []),
	);

	const visibleCharacters = useMemo(
		() =>
			attributeFilters.sortItems(
				searchedCharacters.filter(attributeFilters.matches),
				(character) => character.name,
			),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[searchedCharacters, attributeFilters.matches, attributeFilters.sortItems],
	);
	const { visibleItems, loadMore, hasMore } = usePagination(visibleCharacters);

	const handlePress = useCallback(
		(character: Character) => {
			router.push({
				pathname: '/detail/[category]/[id]',
				params: { category: 'characters', id: String(character.id) },
			});
		},
		[router],
	);

	const renderItem = useCallback(
		({ item: character }: { item: Character }) => (
			<View className='flex-row items-start justify-between gap-2 rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-2'>
				<Pressable
					className='flex-1 flex-row items-center gap-2'
					onPress={() => handlePress(character)}
					accessibilityRole='button'
					accessibilityLabel={`View details for ${character.name}`}
				>
					{character.image ? (
						<Image
							source={{ width: 100, height: 100, uri: character.image }}
							width={100}
							height={100}
							resizeMode='contain'
							accessibilityIgnoresInvertColors
							accessible={false}
							accessibilityElementsHidden
							importantForAccessibility='no-hide-descendants'
						/>
					) : null}
					<View className='max-w-[70%] flex-col md:max-w-[90%]'>
						<Text
							testID='card-title'
							accessibilityRole='header'
							className='font-chewy text-base text-lightAccent dark:text-darkAccent'
						>
							{character.name}
						</Text>
						<Text className='font-chewy text-base text-lightAccent dark:text-darkAccent'>
							{composeCharacterShortBio(character)}
						</Text>
					</View>
				</Pressable>
				<FavoriteButton
					itemName={character.name}
					favorited={isFavorited('character', character.id)}
					onToggle={() =>
						isFavorited('character', character.id)
							? removeFavorite('character', character.id)
							: addFavorite('character', character.id)
					}
				/>
			</View>
		),
		[isFavorited, addFavorite, removeFavorite, handlePress],
	);

	if (loading) {
		return <CategorySkeleton />;
	}

	if (error) {
		return <ErrorState message={error} onRetry={retry} />;
	}

	return (
		<FlatList
			className='flex-1 bg-lightBg dark:bg-darkBg'
			contentContainerClassName='flex-col gap-2 p-2'
			data={visibleItems}
			renderItem={renderItem}
			keyExtractor={(character) => String(character.id)}
			onEndReached={loadMore}
			onEndReachedThreshold={0.5}
			initialNumToRender={PAGE_SIZE}
			ListHeaderComponent={
				<View className='flex-col gap-2'>
					<TextInput
						placeholder='Search Characters...'
						accessibilityLabel='Search Characters'
						placeholderTextColor={isDark ? '#F0F0F0' : colors.accent}
						value={query}
						onChangeText={setQuery}
						className='font-chewy rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-2 text-[18px] text-lightAccent dark:text-darkAccent'
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
				</View>
			}
			ListEmptyComponent={
				<View className='flex-1 flex-col items-center justify-center'>
					<Text
						accessibilityRole='header'
						className='font-chewy text-[44px] text-lightAccent dark:text-darkAccent'
					>
						Character UH OH...
					</Text>
				</View>
			}
			ListFooterComponent={
				hasMore ? <LoadMoreButton onPress={loadMore} /> : null
			}
		/>
	);
}
