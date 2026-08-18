import React, { useCallback } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Episode, getEpisodes } from '../../hooks/fetchEpisodes';
import { useCategoryData } from '../../hooks/useCategoryData';
import { useCategorySearch } from '../../hooks/useCategorySearch';
import { useAttributeFilters } from '../../hooks/useAttributeFilters';
import { PAGE_SIZE, usePagination } from '../../hooks/usePagination';
import { useFavorites } from '../../hooks/useFavorites';
import { composeEpisodeShortBio } from '../../lib/categoryBio';
import { FavoriteButton } from '../../components/FavoriteButton';
import { FilterPanel } from '../../components/FilterPanel';
import { CategorySkeleton } from '../../components/CategorySkeleton';
import { ErrorState } from '../../components/ErrorState';
import { OfflineBanner } from '../../components/OfflineBanner';
import { useTheme } from '../../hooks/useTheme';

const getSearchableText = (episode: Episode) =>
	`${episode.name} ${composeEpisodeShortBio(episode)}`;

export default function Episodes() {
	const router = useRouter();
	const { isDark } = useTheme();
	const { isFavorited, addFavorite, removeFavorite } = useFavorites();
	const {
		data: episodes,
		loading,
		error,
		retry,
		cachedAt,
	} = useCategoryData<Episode>(getEpisodes, 'episodes');
	const {
		query,
		setQuery,
		filteredItems: searchedEpisodes,
	} = useCategorySearch(episodes, getSearchableText);
	const attributeFilters = useAttributeFilters<Episode>();

	// Same reasoning as app/index.tsx: this is a Drawer.Screen that stays
	// mounted when you navigate away, so a typed-in query/sort would
	// otherwise still be sitting here the next time you land back here.
	useFocusEffect(
		useCallback(() => {
			return () => {
				setQuery('');
				attributeFilters.reset();
			};
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []),
	);

	const visibleEpisodes = attributeFilters.sortItems(
		searchedEpisodes,
		(episode) => episode.name,
	);
	const { visibleItems, loadMore } = usePagination(visibleEpisodes);

	const handlePress = useCallback(
		(episode: Episode) => {
			router.push({
				pathname: '/detail/[category]/[id]',
				params: { category: 'episodes', id: String(episode.id) },
			});
		},
		[router],
	);

	const renderItem = useCallback(
		({ item: episode }: { item: Episode }) => (
			<View className='flex-row items-start justify-between gap-2 rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-2'>
				<Pressable
					className='flex-1 flex-col'
					onPress={() => handlePress(episode)}
				>
					<Text
						testID='card-title'
						className='font-chewy text-base text-lightAccent dark:text-darkAccent'
					>
						{episode.name}
					</Text>
					<Text className='font-chewy text-base text-lightAccent dark:text-darkAccent'>
						{composeEpisodeShortBio(episode)}
					</Text>
				</Pressable>
				<FavoriteButton
					favorited={isFavorited('episode', episode.id)}
					onToggle={() =>
						isFavorited('episode', episode.id)
							? removeFavorite('episode', episode.id)
							: addFavorite('episode', episode.id)
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
			keyExtractor={(episode) => String(episode.id)}
			onEndReached={loadMore}
			onEndReachedThreshold={0.5}
			initialNumToRender={PAGE_SIZE}
			ListHeaderComponent={
				<View className='flex-col gap-2'>
					<TextInput
						placeholder='Search Episodes...'
						placeholderTextColor={isDark ? '#F0F0F0' : '#2C4A63'}
						value={query}
						onChangeText={setQuery}
						className='font-chewy rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-2 text-[18px] text-lightAccent dark:text-darkAccent'
					/>
					<FilterPanel
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
					<Text className='font-chewy text-[44px] text-lightAccent dark:text-darkAccent'>
						Episode UH OH...
					</Text>
				</View>
			}
		/>
	);
}
