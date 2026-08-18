import React, { useCallback } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Burger, getBurgersOfTheDay } from '../../hooks/fetchBurgersOfTheDay';
import { useCategoryData } from '../../hooks/useCategoryData';
import { useCategorySearch } from '../../hooks/useCategorySearch';
import { useAttributeFilters } from '../../hooks/useAttributeFilters';
import { PAGE_SIZE, usePagination } from '../../hooks/usePagination';
import { useFavorites } from '../../hooks/useFavorites';
import { composeBurgerShortBio } from '../../lib/categoryBio';
import { FavoriteButton } from '../../components/FavoriteButton';
import { FilterPanel } from '../../components/FilterPanel';
import { CategorySkeleton } from '../../components/CategorySkeleton';
import { ErrorState } from '../../components/ErrorState';
import { OfflineBanner } from '../../components/OfflineBanner';
import { useTheme } from '../../hooks/useTheme';

const getSearchableText = (burger: Burger) =>
	`${burger.name} ${composeBurgerShortBio(burger)}`;

export default function Burgers() {
	const router = useRouter();
	const { isDark } = useTheme();
	const { isFavorited, addFavorite, removeFavorite } = useFavorites();
	const {
		data: burgers,
		loading,
		error,
		retry,
		cachedAt,
	} = useCategoryData<Burger>(getBurgersOfTheDay, 'burgers');
	const {
		query,
		setQuery,
		filteredItems: searchedBurgers,
	} = useCategorySearch(burgers, getSearchableText);
	const attributeFilters = useAttributeFilters<Burger>();

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

	const visibleBurgers = attributeFilters.sortItems(
		searchedBurgers,
		(burger) => burger.name,
	);
	const { visibleItems, loadMore } = usePagination(visibleBurgers);

	const handlePress = useCallback(
		(burger: Burger) => {
			router.push({
				pathname: '/detail/[category]/[id]',
				params: { category: 'burgers', id: String(burger.id) },
			});
		},
		[router],
	);

	// Defined once, up front, and handed to FlatList as `renderItem` —
	// matching app/index.tsx's own list, rather than an inline arrow
	// function rebuilt on every render.
	const renderItem = useCallback(
		({ item: burger }: { item: Burger }) => (
			<View className='flex-row items-start justify-between gap-2 rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-2'>
				<Pressable
					className='flex-1 flex-col'
					onPress={() => handlePress(burger)}
				>
					<Text
						testID='card-title'
						accessibilityRole='header'
						className='font-chewy text-base text-lightAccent dark:text-darkAccent'
					>
						{burger.name}
					</Text>
					<Text className='font-chewy text-base text-lightAccent dark:text-darkAccent'>
						{composeBurgerShortBio(burger)}
					</Text>
				</Pressable>
				<FavoriteButton
					itemName={burger.name}
					favorited={isFavorited('burger', burger.id)}
					onToggle={() =>
						isFavorited('burger', burger.id)
							? removeFavorite('burger', burger.id)
							: addFavorite('burger', burger.id)
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
			keyExtractor={(burger) => String(burger.id)}
			onEndReached={loadMore}
			onEndReachedThreshold={0.5}
			// usePagination already caps `data` to one page at a time, so
			// there's no need for FlatList's own default windowing
			// (initialNumToRender=10) to further sub-render within that —
			// the whole current page should mount together.
			initialNumToRender={PAGE_SIZE}
			ListHeaderComponent={
				<View className='flex-col gap-2'>
					<TextInput
						placeholder='Search Burgers of the Day...'
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
					<Text
						accessibilityRole='header'
						className='font-chewy text-[44px] text-lightAccent dark:text-darkAccent'
					>
						Burger of the Day UH OH...
					</Text>
				</View>
			}
		/>
	);
}
