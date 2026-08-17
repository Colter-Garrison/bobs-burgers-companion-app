import React, { useCallback } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Burger, getBurgersOfTheDay } from '../../hooks/fetchBurgersOfTheDay';
import { useCategoryData } from '../../hooks/useCategoryData';
import { useCategorySearch } from '../../hooks/useCategorySearch';
import { useAttributeFilters } from '../../hooks/useAttributeFilters';
import { useFavorites } from '../../hooks/useFavorites';
import { composeBurgerShortBio } from '../../lib/categoryBio';
import { FavoriteButton } from '../../components/FavoriteButton';
import { FilterPanel } from '../../components/FilterPanel';
import { CategorySkeleton } from '../../components/CategorySkeleton';
import { ErrorState } from '../../components/ErrorState';
import { OfflineBanner } from '../../components/OfflineBanner';

const getSearchableText = (burger: Burger) =>
	`${burger.name} ${composeBurgerShortBio(burger)}`;

export default function Burgers() {
	const router = useRouter();
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

	const handlePress = (burger: Burger) => {
		router.push({
			pathname: '/detail/[category]/[id]',
			params: { category: 'burgers', id: String(burger.id) },
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
					placeholder='Search Burgers of the Day...'
					placeholderTextColor='#E8242F'
					value={query}
					onChangeText={setQuery}
					className='font-chewy rounded-lg border-4 border-bbRed bg-bbYellow p-2 text-[18px] text-bbRed'
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
				{visibleBurgers.length > 0 ? (
					visibleBurgers.map((burger) => (
						<View
							key={burger.id}
							className='flex-row items-start justify-between gap-2 rounded-lg border-4 border-bbRed bg-bbYellow p-2'
						>
							<Pressable
								className='flex-1 flex-col'
								onPress={() => handlePress(burger)}
							>
								<Text
									testID='card-title'
									className='font-chewy text-base text-bbRed'
								>
									{burger.name}
								</Text>
								<Text className='font-chewy text-base text-bbRed'>
									{composeBurgerShortBio(burger)}
								</Text>
							</Pressable>
							<FavoriteButton
								favorited={isFavorited('burger', burger.id)}
								onToggle={() =>
									isFavorited('burger', burger.id)
										? removeFavorite('burger', burger.id)
										: addFavorite('burger', burger.id)
								}
							/>
						</View>
					))
				) : (
					<View className='flex-1 flex-col items-center justify-center'>
						<Text className='font-chewy text-[44px]'>
							Burger of the Day UH OH...
						</Text>
					</View>
				)}
			</View>
		</ScrollView>
	);
}
