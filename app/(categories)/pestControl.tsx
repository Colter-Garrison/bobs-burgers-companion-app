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
import {
	Truck,
	getPestControlTrucks,
} from '../../hooks/fetchPestControlTrucks';
import { useCategoryData } from '../../hooks/useCategoryData';
import { useCategorySearch } from '../../hooks/useCategorySearch';
import { useAttributeFilters } from '../../hooks/useAttributeFilters';
import { PAGE_SIZE, usePagination } from '../../hooks/usePagination';
import { useFavorites } from '../../hooks/useFavorites';
import { composeTruckShortBio } from '../../lib/categoryBio';
import { FavoriteButton } from '../../components/FavoriteButton';
import { LoadMoreButton } from '../../components/LoadMoreButton';
import { FilterPanel } from '../../components/FilterPanel';
import { CategorySkeleton } from '../../components/CategorySkeleton';
import { ErrorState } from '../../components/ErrorState';
import { OfflineBanner } from '../../components/OfflineBanner';
import { useTheme } from '../../hooks/useTheme';

const getSearchableText = (truck: Truck) =>
	`${truck.name} ${composeTruckShortBio(truck)}`;

export default function PestControl() {
	const router = useRouter();
	const { isDark, colors } = useTheme();
	const { isFavorited, addFavorite, removeFavorite } = useFavorites();
	const {
		data: trucks,
		loading,
		error,
		retry,
		cachedAt,
	} = useCategoryData<Truck>(getPestControlTrucks, 'pestControlTrucks');
	const {
		query,
		setQuery,
		filteredItems: searchedTrucks,
	} = useCategorySearch(trucks, getSearchableText);
	const attributeFilters = useAttributeFilters<Truck>();

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

	const visibleTrucks = attributeFilters.sortItems(
		searchedTrucks,
		(truck) => truck.name,
	);
	const { visibleItems, loadMore, hasMore } = usePagination(visibleTrucks);

	const handlePress = useCallback(
		(truck: Truck) => {
			router.push({
				pathname: '/detail/[category]/[id]',
				params: { category: 'pestControl', id: String(truck.id) },
			});
		},
		[router],
	);

	const renderItem = useCallback(
		({ item: truck }: { item: Truck }) => (
			<View className='flex-row items-start justify-between gap-2 rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-2'>
				<Pressable
					className='flex-1 flex-row items-center gap-2'
					onPress={() => handlePress(truck)}
					accessibilityRole='button'
					accessibilityLabel={`View details for ${truck.name}`}
				>
					{truck.image ? (
						<Image
							source={{ width: 100, height: 100, uri: truck.image }}
							width={100}
							height={100}
							resizeMode='contain'
							// iOS's Smart Invert Colors accessibility setting
							// would otherwise flip this photo's colors along
							// with the rest of the UI, which looks wrong for
							// real photographic content.
							accessibilityIgnoresInvertColors
							// Decorative — the name is shown as its own text
							// right beside it, so a screen reader announcing
							// the image too would just repeat that.
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
							{truck.name}
						</Text>
						<Text className='font-chewy text-base text-lightAccent dark:text-darkAccent'>
							{composeTruckShortBio(truck)}
						</Text>
					</View>
				</Pressable>
				<FavoriteButton
					itemName={truck.name}
					favorited={isFavorited('pest_control_truck', truck.id)}
					onToggle={() =>
						isFavorited('pest_control_truck', truck.id)
							? removeFavorite('pest_control_truck', truck.id)
							: addFavorite('pest_control_truck', truck.id)
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
			keyExtractor={(truck) => String(truck.id)}
			onEndReached={loadMore}
			onEndReachedThreshold={0.5}
			initialNumToRender={PAGE_SIZE}
			ListHeaderComponent={
				<View className='flex-col gap-2'>
					<TextInput
						placeholder='Search Pest Control Trucks...'
						accessibilityLabel='Search Pest Control Trucks'
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
						Pest Control Truck UH OH...
					</Text>
				</View>
			}
			ListFooterComponent={
				hasMore ? <LoadMoreButton onPress={loadMore} /> : null
			}
		/>
	);
}
