import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList, Text, TextInput, View } from 'react-native';
import { SearchItem, useSearchableItems } from '../../hooks/useSearchableItems';
import { detailHref } from '../../lib/detailRoute';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../hooks/useAuth';
import { PAGE_SIZE, usePagination } from '../../hooks/usePagination';
import { useAttributeFilters } from '../../hooks/useAttributeFilters';
import { SearchResultCard } from '../../components/SearchResultCard';
import { CategoryFilter } from '../../components/CategoryFilterPills';
import { FilterPanel } from '../../components/FilterPanel';
import { CategorySkeleton } from '../../components/CategorySkeleton';
import { OfflineBanner } from '../../components/OfflineBanner';

export default function Favorites() {
	const router = useRouter();
	const { token, loading: authLoading } = useAuth();
	const {
		items,
		loading: itemsLoading,
		cachedAt,
		retry,
	} = useSearchableItems();
	const {
		isFavorited,
		removeFavorite,
		loading: favoritesLoading,
	} = useFavorites();
	const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
	const [query, setQuery] = useState('');
	const attributeFilters = useAttributeFilters<SearchItem>();

	// Reachable by direct URL, not just the drawer link (which already
	// hides itself when logged out) — same guard as app/account.tsx,
	// deliberately depending on `authLoading` alone rather than `token`
	// (see the comment there for why: Drawer screens never unmount, so
	// this guard must only check "did we arrive here already logged
	// out," not react to every later token change, or it can race
	// Account's own post-logout navigation to /).
	useEffect(() => {
		if (!authLoading && !token) {
			router.push('/login');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [authLoading]);

	// Same reasoning as app/index.tsx: this is a Drawer.Screen that stays
	// mounted when you navigate away, so a chosen filter pill would
	// otherwise still be sitting here the next time you land back here.
	useFocusEffect(
		useCallback(() => {
			return () => {
				setCategoryFilter('All');
				setQuery('');
				attributeFilters.reset();
			};
			// attributeFilters.reset is stable (useCallback with no deps in
			// useAttributeFilters) — omitted here so this effect doesn't
			// re-run (and re-register its cleanup) on every render.
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []),
	);

	const handleResultPress = useCallback(
		(item: SearchItem) => {
			router.push(detailHref(item.category, item.itemId));
		},
		[router],
	);

	const favoritedItems = useMemo(() => {
		const trimmedQuery = query.trim().toLowerCase();
		return attributeFilters.sortItems(
			items
				.filter((item) => isFavorited(item.favoriteCategory, item.itemId))
				.filter(
					(item) =>
						categoryFilter === 'All' || item.category === categoryFilter,
				)
				.filter(
					(item) =>
						!trimmedQuery || item.label.toLowerCase().includes(trimmedQuery),
				)
				.filter(attributeFilters.matches),
			(item) => item.label,
		);
		// attributeFilters itself is a fresh object every render — its
		// `matches`/`sortItems` functions are what this actually reads,
		// and those are independently memoized (stable unless the
		// filters/sort they close over actually changed).
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		items,
		isFavorited,
		categoryFilter,
		query,
		attributeFilters.matches,
		attributeFilters.sortItems,
	]);
	const { visibleItems, loadMore } = usePagination(favoritedItems);
	const loading = itemsLoading || favoritesLoading;

	// Defined once, up front, and handed to FlatList as `renderItem` —
	// mirroring app/index.tsx's own list.
	const renderItem = useCallback(
		({ item }: { item: SearchItem }) => (
			<SearchResultCard
				item={item}
				favorited
				onToggleFavorite={() =>
					removeFavorite(item.favoriteCategory, item.itemId)
				}
				onPress={() => handleResultPress(item)}
			/>
		),
		[removeFavorite, handleResultPress],
	);

	if (!token) {
		return null;
	}

	if (loading) {
		return <CategorySkeleton />;
	}

	return (
		<FlatList
			className='flex-1 bg-bbGreen'
			contentContainerClassName='flex-col gap-[10px] p-[10px]'
			data={visibleItems}
			renderItem={renderItem}
			keyExtractor={(item) => item.id}
			onEndReached={loadMore}
			onEndReachedThreshold={0.5}
			// usePagination already caps `data` to one page at a time, so
			// there's no need for FlatList's own default windowing
			// (initialNumToRender=10) to further sub-render within that —
			// the whole current page should mount together.
			initialNumToRender={PAGE_SIZE}
			ListHeaderComponent={
				<View className='gap-[10px]'>
					<TextInput
						placeholder='Search your favorites...'
						placeholderTextColor='#E8242F'
						value={query}
						onChangeText={setQuery}
						className='font-chewy rounded-lg border-4 border-bbRed bg-bbYellow p-2 text-[18px] text-bbRed'
					/>
					<FilterPanel
						categoryFilter={categoryFilter}
						onSelectCategory={setCategoryFilter}
						showGenderHairFilters={categoryFilter === 'Characters'}
						genders={attributeFilters.genders}
						hairColors={attributeFilters.hairColors}
						sortDirection={attributeFilters.sortDirection}
						onToggleGender={attributeFilters.toggleGender}
						onToggleHair={attributeFilters.toggleHair}
						onToggleSort={attributeFilters.toggleSort}
						activeCount={attributeFilters.activeCount}
					/>
					{cachedAt ? (
						<OfflineBanner cachedAt={cachedAt} onRetry={retry} />
					) : null}
				</View>
			}
			ListEmptyComponent={
				<Text className='font-chewy text-bbRed'>No favorites yet.</Text>
			}
		/>
	);
}
