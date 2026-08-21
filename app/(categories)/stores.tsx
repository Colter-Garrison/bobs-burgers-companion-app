import React, { useCallback } from 'react';
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
import { Store, getStoresNextDoor } from '../../hooks/fetchStoresNextDoor';
import { useCategoryData } from '../../hooks/useCategoryData';
import { useCategorySearch } from '../../hooks/useCategorySearch';
import { useAttributeFilters } from '../../hooks/useAttributeFilters';
import { PAGE_SIZE, usePagination } from '../../hooks/usePagination';
import { useFavorites } from '../../hooks/useFavorites';
import { composeStoreShortBio } from '../../lib/categoryBio';
import { FavoriteButton } from '../../components/FavoriteButton';
import { LoadMoreButton } from '../../components/LoadMoreButton';
import { FilterPanel } from '../../components/FilterPanel';
import { CategorySkeleton } from '../../components/CategorySkeleton';
import { ErrorState } from '../../components/ErrorState';
import { OfflineBanner } from '../../components/OfflineBanner';
import { useTheme } from '../../hooks/useTheme';

const getSearchableText = (store: Store) =>
	`${store.name} ${composeStoreShortBio(store)}`;

export default function Stores() {
	const router = useRouter();
	const { isDark, colors } = useTheme();
	const { isFavorited, addFavorite, removeFavorite } = useFavorites();
	const {
		data: stores,
		loading,
		error,
		retry,
		cachedAt,
	} = useCategoryData<Store>(getStoresNextDoor, 'stores');
	const {
		query,
		setQuery,
		filteredItems: searchedStores,
	} = useCategorySearch(stores, getSearchableText);
	const attributeFilters = useAttributeFilters<Store>();

	useFocusEffect(
		useCallback(() => {
			return () => {
				setQuery('');
				attributeFilters.reset();
			};
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []),
	);

	const visibleStores = attributeFilters.sortItems(
		searchedStores,
		(store) => store.name,
	);
	const { visibleItems, loadMore, hasMore } = usePagination(visibleStores);

	const handlePress = useCallback(
		(store: Store) => {
			router.push({
				pathname: '/detail/[category]/[id]',
				params: { category: 'stores', id: String(store.id) },
			});
		},
		[router],
	);

	const renderItem = useCallback(
		({ item: store }: { item: Store }) => (
			<View className='flex-row items-start justify-between gap-2 rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-2'>
				<Pressable
					className='flex-1 flex-row items-center gap-2'
					onPress={() => handlePress(store)}
					accessibilityRole='button'
					accessibilityLabel={`View details for ${store.name}`}
				>
					{store.image ? (
						<Image
							source={{ width: 100, height: 100, uri: store.image }}
							width={100}
							height={100}
							resizeMode='contain'
							accessibilityIgnoresInvertColors
							accessible={false}
							accessibilityElementsHidden
							importantForAccessibility='no-hide-descendants'
						/>
					) : null}
					<View className='max-w-[70%] flex-col'>
						<Text
							testID='card-title'
							accessibilityRole='header'
							className='font-chewy text-base text-lightAccent dark:text-darkAccent'
						>
							{store.name}
						</Text>
						<Text className='font-chewy text-base text-lightAccent dark:text-darkAccent'>
							{composeStoreShortBio(store)}
						</Text>
					</View>
				</Pressable>
				<FavoriteButton
					itemName={store.name}
					favorited={isFavorited('store', store.id)}
					onToggle={() =>
						isFavorited('store', store.id)
							? removeFavorite('store', store.id)
							: addFavorite('store', store.id)
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
			keyExtractor={(store) => String(store.id)}
			onEndReached={loadMore}
			onEndReachedThreshold={0.5}
			initialNumToRender={PAGE_SIZE}
			ListHeaderComponent={
				<View className='flex-col gap-2'>
					<TextInput
						placeholder='Search Stores Next Door...'
						accessibilityLabel='Search Stores Next Door'
						placeholderTextColor={isDark ? '#F0F0F0' : colors.accent}
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
						Store Next Door UH OH...
					</Text>
				</View>
			}
			ListFooterComponent={
				hasMore ? <LoadMoreButton onPress={loadMore} /> : null
			}
		/>
	);
}
