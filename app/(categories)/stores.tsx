import React, { useCallback } from 'react';
import {
	Image,
	Pressable,
	ScrollView,
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
import { useFavorites } from '../../hooks/useFavorites';
import { composeStoreShortBio } from '../../lib/categoryBio';
import { FavoriteButton } from '../../components/FavoriteButton';
import { FilterPanel } from '../../components/FilterPanel';
import { CategorySkeleton } from '../../components/CategorySkeleton';
import { ErrorState } from '../../components/ErrorState';
import { OfflineBanner } from '../../components/OfflineBanner';

const getSearchableText = (store: Store) =>
	`${store.name} ${composeStoreShortBio(store)}`;

export default function Stores() {
	const router = useRouter();
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

	const visibleStores = attributeFilters.sortItems(
		searchedStores,
		(store) => store.name,
	);

	const handlePress = (store: Store) => {
		router.push({
			pathname: '/detail/[category]/[id]',
			params: { category: 'stores', id: String(store.id) },
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
					placeholder='Search Stores Next Door...'
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
				{visibleStores.length > 0 ? (
					visibleStores.map((store) => (
						<View
							key={store.id}
							className='flex-row items-center justify-between gap-2 rounded-lg border-4 border-bbRed bg-bbYellow p-2'
						>
							<Pressable
								className='flex-1 flex-row items-center gap-2'
								onPress={() => handlePress(store)}
							>
								{store.image ? (
									<Image
										source={{ width: 100, height: 100, uri: store.image }}
										width={100}
										height={100}
										resizeMode='contain'
									/>
								) : null}
								<View className='max-w-[70%] flex-col'>
									<Text
										testID='card-title'
										className='font-chewy text-base text-bbRed'
									>
										{store.name}
									</Text>
									<Text className='font-chewy text-base text-bbRed'>
										{composeStoreShortBio(store)}
									</Text>
								</View>
							</Pressable>
							<FavoriteButton
								favorited={isFavorited('store', store.id)}
								onToggle={() =>
									isFavorited('store', store.id)
										? removeFavorite('store', store.id)
										: addFavorite('store', store.id)
								}
							/>
						</View>
					))
				) : (
					<View className='flex-1 flex-col items-center justify-center'>
						<Text className='font-chewy text-[44px]'>
							Store Next Door UH OH...
						</Text>
					</View>
				)}
			</View>
		</ScrollView>
	);
}
