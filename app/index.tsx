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
import { CategoryFilter } from '../components/CategoryFilterPills';
import { FilterPanel } from '../components/FilterPanel';
import { CategorySkeleton } from '../components/CategorySkeleton';
import { OfflineBanner } from '../components/OfflineBanner';
import { CharacterOfTheDayCard } from '../components/CharacterOfTheDayCard';
import { useCharacterOfTheDay } from '../hooks/useCharacterOfTheDay';
import { useTheme } from '../hooks/useTheme';

export default function Index() {
	const router = useRouter();
	const { isDark } = useTheme();
	const { items, error, retry, cachedAt } = useSearchableItems();
	const { isFavorited, addFavorite, removeFavorite } = useFavorites();
	const { character: characterOfTheDay, blurb: characterOfTheDayBlurb } =
		useCharacterOfTheDay();
	const [query, setQuery] = useState('');
	const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
	const attributeFilters = useAttributeFilters<SearchItem>();

	// Same reasoning as login.tsx/signup.tsx: Home is a Drawer.Screen that
	// stays mounted when you navigate away, so a typed-in query (and a
	// chosen filter pill) would otherwise still be sitting here — filtered
	// results and all — the next time you land back on Home.
	useFocusEffect(
		useCallback(() => {
			return () => {
				setQuery('');
				setCategoryFilter('All');
				attributeFilters.reset();
			};
			// attributeFilters.reset is stable (useCallback with no deps in
			// useAttributeFilters) — omitted here so this effect doesn't
			// re-run (and re-register its cleanup) on every render.
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
		// attributeFilters itself is a fresh object every render — its
		// `matches`/`sortItems` functions are what this actually reads,
		// and those are independently memoized (stable unless the
		// filters/sort they close over actually changed).
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		items,
		query,
		categoryFilter,
		attributeFilters.matches,
		attributeFilters.sortItems,
	]);

	const { visibleItems, loadMore } = usePagination(filteredItems);

	// Gender/Hair Color only make sense (and only show, via
	// showGenderHairFilters below) while filtering by Characters — moving
	// to any other category must also clear any selections made there, or
	// they'd keep silently filtering every other category's items down to
	// nothing. See clearGenderHair's own comment in useAttributeFilters.ts.
	const handleSelectCategory = useCallback(
		(category: CategoryFilter) => {
			setCategoryFilter(category);
			if (category !== 'Characters') {
				attributeFilters.clearGenderHair();
			}
		},
		// attributeFilters.clearGenderHair is stable (useCallback, no deps)
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

	// The background fetch on mount (below the surface, inside
	// useSearchableItems) is usually fast enough that it's already done
	// by the time a user actually gets around to typing — meaning
	// `loading` would rarely be true and the skeleton would rarely have
	// anything to show for. Re-fetching on the first keystroke of each
	// search gives the skeleton real work to reflect instead, without
	// faking a delay that isn't there.
	//
	// This has to happen inside the change handler itself, synchronously
	// alongside setQuery — not in a useEffect watching isSearching, which
	// only runs after the render commits and only calls setLoading(true)
	// once the (async) retry() gets around to it. That round trip was the
	// visible lag: the skeleton wouldn't appear until a second render,
	// one or two frames after the keystroke that should have shown it.
	const [searchLoading, setSearchLoading] = useState(false);
	// isNewSearchRef gates re-fetching to once per search (not once per
	// keystroke). searchRequestIdRef additionally guards against a rarer
	// case: clearing and starting a new search fast enough that the
	// previous search's fetch is still in flight — without this, that
	// stale fetch resolving could clear searchLoading out from under the
	// new search before its own (newer) fetch has actually finished.
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

	// Defined once, up front, and handed to FlatList as `renderItem` —
	// rather than an inline arrow function rebuilt (and re-rendering
	// every card) on every keystroke.
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
			className='flex-1 bg-bbGreen dark:bg-darkBg'
			contentContainerClassName='flex-col gap-[10px] p-[10px]'
			data={isSearching && !searchLoading ? visibleItems : []}
			renderItem={renderItem}
			keyExtractor={(item) => item.id}
			onEndReached={isSearching && !searchLoading ? loadMore : undefined}
			onEndReachedThreshold={0.5}
			// usePagination already caps `data` to one page at a time, so
			// there's no need for FlatList's own default windowing
			// (initialNumToRender=10) to further sub-render within that —
			// the whole current page should mount together.
			initialNumToRender={PAGE_SIZE}
			ListHeaderComponent={
				<View className='gap-[10px]'>
					<TextInput
						placeholder='Search burgers, characters, episodes...'
						placeholderTextColor={isDark ? '#ECEDEE' : '#E8242F'}
						value={query}
						onChangeText={handleQueryChange}
						className='font-chewy rounded-lg border-4 border-bbRed dark:border-darkRed bg-bbYellow dark:bg-darkSurface p-2 text-[18px] text-bbRed dark:text-darkRed'
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
						// Some categories failed to load, but the ones that
						// succeeded are still shown below — this banner
						// doesn't replace the results the way a category
						// screen's full ErrorState does.
						<View className='flex-row items-center justify-between gap-[10px] rounded-lg border-4 border-bbRed dark:border-darkRed bg-bbYellow dark:bg-darkSurface p-[10px]'>
							<Text className='flex-1 font-chewy text-bbRed dark:text-darkRed'>
								{error}
							</Text>
							<Pressable onPress={retry} accessibilityRole='button'>
								<Text className='font-chewy text-bbRed dark:text-darkRed underline'>
									Retry
								</Text>
							</Pressable>
						</View>
					) : null}
				</View>
			}
			ListEmptyComponent={
				isSearching && !searchLoading ? (
					<Text className='font-chewy text-bbRed dark:text-darkRed'>
						No results found.
					</Text>
				) : !isSearching && characterOfTheDay && characterOfTheDayBlurb ? (
					<CharacterOfTheDayCard
						character={characterOfTheDay}
						blurb={characterOfTheDayBlurb}
					/>
				) : null
			}
		/>
	);
}
