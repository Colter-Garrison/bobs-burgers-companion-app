import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SearchItem, useSearchableItems } from '../hooks/useSearchableItems';
import { detailHref } from '../lib/detailRoute';
import { useFavorites } from '../hooks/useFavorites';
import { PAGE_SIZE, usePagination } from '../hooks/usePagination';
import { useAttributeFilters } from '../hooks/useAttributeFilters';
import { SearchResultCard } from '../components/SearchResultCard';
import { LoadMoreButton } from '../components/LoadMoreButton';
import { CategoryFilter } from '../components/CategoryFilterPills';
import { FilterPanel } from '../components/FilterPanel';
import { CategorySkeleton } from '../components/CategorySkeleton';
import { OfflineBanner } from '../components/OfflineBanner';
import { CharacterOfTheDayCard } from '../components/CharacterOfTheDayCard';
import { useCharacterOfTheDay } from '../hooks/useCharacterOfTheDay';
import { useTheme } from '../hooks/useTheme';

export default function Index() {
	const router = useRouter();
	const { isDark, colors } = useTheme();
	const { items, error, retry, cachedAt } = useSearchableItems();
	const { isFavorited, addFavorite, removeFavorite } = useFavorites();
	const { character: characterOfTheDay, blurb: characterOfTheDayBlurb } =
		useCharacterOfTheDay();
	const [query, setQuery] = useState('');
	const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
	const attributeFilters = useAttributeFilters<SearchItem>();

	useFocusEffect(
		useCallback(() => {
			return () => {
				setQuery('');
				setCategoryFilter('All');
				attributeFilters.reset();
			};
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []),
	);

	const filteredItems = useMemo(() => {
		const trimmed = query.trim().toLowerCase();
		if (!trimmed) return [];
		const matching = items
			.filter((item) => item.label.toLowerCase().includes(trimmed))
			.filter(
				(item) => categoryFilter === 'All' || item.category === categoryFilter,
			)
			.filter(attributeFilters.matches);
		return attributeFilters.sortItems(matching, (item) => item.label);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		items,
		query,
		categoryFilter,
		attributeFilters.matches,
		attributeFilters.sortItems,
	]);

	const { visibleItems, loadMore, hasMore } = usePagination(filteredItems);

	const handleSelectCategory = useCallback(
		(category: CategoryFilter) => {
			setCategoryFilter(category);
			if (category !== 'Characters') {
				attributeFilters.clearGenderHair();
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	const handleResultPress = useCallback(
		(item: SearchItem) => {
			router.push(detailHref(item.category, item.itemId));
		},
		[router],
	);

	const isSearching = query.trim().length > 0;

	const [searchLoading, setSearchLoading] = useState(false);
	const isNewSearchRef = useRef(true);
	const searchRequestIdRef = useRef(0);
	const handleQueryChange = (text: string) => {
		setQuery(text);
		const willBeSearching = text.trim().length > 0;

		if (!willBeSearching) {
			isNewSearchRef.current = true;
			searchRequestIdRef.current += 1;
			setSearchLoading(false);
			return;
		}

		if (isNewSearchRef.current) {
			isNewSearchRef.current = false;
			setSearchLoading(true);
			const requestId = ++searchRequestIdRef.current;
			retry().finally(() => {
				if (searchRequestIdRef.current === requestId) {
					setSearchLoading(false);
				}
			});
		}
	};

	const renderItem = useCallback(
		({ item }: { item: SearchItem }) => (
			<SearchResultCard
				item={item}
				favorited={isFavorited(item.favoriteCategory, item.itemId)}
				onToggleFavorite={() =>
					isFavorited(item.favoriteCategory, item.itemId)
						? removeFavorite(item.favoriteCategory, item.itemId)
						: addFavorite(item.favoriteCategory, item.itemId)
				}
				onPress={() => handleResultPress(item)}
			/>
		),
		[isFavorited, addFavorite, removeFavorite, handleResultPress],
	);

	return (
		<FlatList
			testID='search-results-list'
			className='flex-1 bg-lightBg dark:bg-darkBg'
			contentContainerClassName='flex-col gap-[10px] p-[10px]'
			data={isSearching && !searchLoading ? visibleItems : []}
			renderItem={renderItem}
			keyExtractor={(item) => item.id}
			onEndReached={isSearching && !searchLoading ? loadMore : undefined}
			onEndReachedThreshold={0.5}
			initialNumToRender={PAGE_SIZE}
			ListHeaderComponent={
				<View className='gap-[10px]'>
					<TextInput
						placeholder='Search burgers, characters, episodes...'
						accessibilityLabel='Search burgers, characters, episodes'
						placeholderTextColor={isDark ? '#F0F0F0' : colors.accent}
						value={query}
						onChangeText={handleQueryChange}
						className='font-chewy rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-2 text-[18px] text-lightAccent dark:text-darkAccent'
					/>
					<FilterPanel
						categoryFilter={categoryFilter}
						onSelectCategory={handleSelectCategory}
						showGenderHairFilters={categoryFilter === 'Characters'}
						genders={attributeFilters.genders}
						hairColors={attributeFilters.hairColors}
						sortDirection={attributeFilters.sortDirection}
						onToggleGender={attributeFilters.toggleGender}
						onToggleHair={attributeFilters.toggleHair}
						onToggleSort={attributeFilters.toggleSort}
						activeCount={attributeFilters.activeCount}
					/>
					{isSearching && searchLoading ? (
						<CategorySkeleton count={3} fullScreen={false} />
					) : null}
					{isSearching && !searchLoading && cachedAt ? (
						<OfflineBanner cachedAt={cachedAt} onRetry={retry} />
					) : null}
					{isSearching && !searchLoading && error ? (
						<View className='flex-row items-center justify-between gap-[10px] rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-[10px]'>
							<Text
								accessibilityLiveRegion='polite'
								className='flex-1 font-chewy text-lightAccent dark:text-darkAccent'
							>
								{error}
							</Text>
							<Pressable
								onPress={retry}
								accessibilityRole='button'
								accessibilityLabel='Retry loading'
							>
								<Text className='font-chewy text-lightAccent dark:text-darkAccent underline'>
									Retry
								</Text>
							</Pressable>
						</View>
					) : null}
				</View>
			}
			ListEmptyComponent={
				isSearching && !searchLoading ? (
					<Text className='font-chewy text-lightAccent dark:text-darkAccent'>
						No results found.
					</Text>
				) : !isSearching && characterOfTheDay && characterOfTheDayBlurb ? (
					<CharacterOfTheDayCard
						character={characterOfTheDay}
						blurb={characterOfTheDayBlurb}
					/>
				) : null
			}
			ListFooterComponent={
				isSearching && !searchLoading && hasMore ? (
					<LoadMoreButton onPress={loadMore} />
				) : null
			}
		/>
	);
}
