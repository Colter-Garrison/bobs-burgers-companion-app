import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { FlatList, Text, TextInput, View } from 'react-native'
import { SearchItem, useSearchableItems } from '../../hooks/useSearchableItems'
import { detailHref } from '../../lib/detailRoute'
import { useFavorites } from '../../hooks/useFavorites'
import { useAuth } from '../../hooks/useAuth'
import { PAGE_SIZE, usePagination } from '../../hooks/usePagination'
import { useAttributeFilters } from '../../hooks/useAttributeFilters'
import { SearchResultCard } from '../../components/SearchResultCard'
import { LoadMoreButton } from '../../components/LoadMoreButton'
import { CategoryFilter } from '../../components/CategoryFilterPills'
import { FilterPanel } from '../../components/FilterPanel'
import { CategorySkeleton } from '../../components/CategorySkeleton'
import { OfflineBanner } from '../../components/OfflineBanner'
import { useTheme } from '../../hooks/useTheme'

export default function Favorites() {
	const router = useRouter()
	const { isDark, colors } = useTheme()
	const { token, loading: authLoading } = useAuth()
	const { items, loading: itemsLoading, cachedAt, retry } = useSearchableItems()
	const {
		isFavorited,
		removeFavorite,
		loading: favoritesLoading,
	} = useFavorites()
	const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All')
	const [query, setQuery] = useState('')
	const attributeFilters = useAttributeFilters<SearchItem>()

	useEffect(() => {
		if (!authLoading && !token) {
			router.push('/login')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [authLoading])

	useFocusEffect(
		useCallback(() => {
			return () => {
				setCategoryFilter('All')
				setQuery('')
				attributeFilters.reset()
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []),
	)

	const handleResultPress = useCallback(
		(item: SearchItem) => {
			router.push(detailHref(item.category, item.itemId))
		},
		[router],
	)

	const handleSelectCategory = useCallback(
		(category: CategoryFilter) => {
			setCategoryFilter(category)
			if (category !== 'Characters') {
				attributeFilters.clearGenderHair()
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	)

	const favoritedItems = useMemo(() => {
		const trimmedQuery = query.trim().toLowerCase()
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
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		items,
		isFavorited,
		categoryFilter,
		query,
		attributeFilters.matches,
		attributeFilters.sortItems,
	])
	const { visibleItems, loadMore, hasMore } = usePagination(favoritedItems)
	const loading = itemsLoading || favoritesLoading

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
	)

	if (!token) {
		return null
	}

	if (loading) {
		return <CategorySkeleton />
	}

	return (
		<FlatList
			className='flex-1 bg-lightBg dark:bg-darkBg'
			contentContainerClassName='flex-col gap-[10px] p-[10px]'
			data={visibleItems}
			renderItem={renderItem}
			keyExtractor={(item) => item.id}
			onEndReached={loadMore}
			onEndReachedThreshold={0.5}
			initialNumToRender={PAGE_SIZE}
			ListHeaderComponent={
				<View className='gap-[10px]'>
					<TextInput
						placeholder='Search your favorites...'
						accessibilityLabel='Search your favorites'
						placeholderTextColor={isDark ? '#F0F0F0' : colors.accent}
						value={query}
						onChangeText={setQuery}
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
					{cachedAt ? (
						<OfflineBanner cachedAt={cachedAt} onRetry={retry} />
					) : null}
				</View>
			}
			ListEmptyComponent={
				<Text className='font-chewy text-lightAccent dark:text-darkAccent'>
					No favorites yet.
				</Text>
			}
			ListFooterComponent={
				hasMore ? <LoadMoreButton onPress={loadMore} /> : null
			}
		/>
	)
}
