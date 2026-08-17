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
import {
	EndCredit,
	getEndCreditsSequences,
} from '../../hooks/fetchEndCreditsSequences';
import { useCategoryData } from '../../hooks/useCategoryData';
import { useCategorySearch } from '../../hooks/useCategorySearch';
import { useAttributeFilters } from '../../hooks/useAttributeFilters';
import { useFavorites } from '../../hooks/useFavorites';
import { composeEndCreditShortBio } from '../../lib/categoryBio';
import { FavoriteButton } from '../../components/FavoriteButton';
import { FilterPanel } from '../../components/FilterPanel';
import { CategorySkeleton } from '../../components/CategorySkeleton';
import { ErrorState } from '../../components/ErrorState';
import { OfflineBanner } from '../../components/OfflineBanner';

const getSearchableText = (credits: EndCredit) =>
	composeEndCreditShortBio(credits);

export default function EndCredits() {
	const router = useRouter();
	const { isFavorited, addFavorite, removeFavorite } = useFavorites();
	const {
		data: endCredits,
		loading,
		error,
		retry,
		cachedAt,
	} = useCategoryData<EndCredit>(getEndCreditsSequences, 'endCredits');
	const {
		query,
		setQuery,
		filteredItems: searchedEndCredits,
	} = useCategorySearch(endCredits, getSearchableText);
	const attributeFilters = useAttributeFilters<EndCredit>();

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

	const visibleEndCredits = attributeFilters.sortItems(
		searchedEndCredits,
		getSearchableText,
	);

	const handlePress = (endCredit: EndCredit) => {
		router.push({
			pathname: '/detail/[category]/[id]',
			params: { category: 'endCredits', id: String(endCredit.id) },
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
					placeholder='Search End Credits...'
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
				{visibleEndCredits.length > 0 ? (
					visibleEndCredits.map((credits) => (
						<View
							key={credits.id}
							className='flex-row items-center justify-between gap-2 rounded-lg border-4 border-bbRed bg-bbYellow p-2'
						>
							<Pressable
								className='flex-1 flex-row items-center gap-2'
								onPress={() => handlePress(credits)}
							>
								{credits.image ? (
									<Image
										source={{ width: 100, height: 100, uri: credits.image }}
										width={100}
										height={100}
										resizeMode='contain'
									/>
								) : null}
								<View className='max-w-[70%] flex-col'>
									<Text className='font-chewy text-base text-bbRed'>
										{composeEndCreditShortBio(credits)}
									</Text>
								</View>
							</Pressable>
							<FavoriteButton
								favorited={isFavorited('end_credit', credits.id)}
								onToggle={() =>
									isFavorited('end_credit', credits.id)
										? removeFavorite('end_credit', credits.id)
										: addFavorite('end_credit', credits.id)
								}
							/>
						</View>
					))
				) : (
					<View className='flex-1 flex-col items-center justify-center'>
						<Text className='font-chewy text-[44px]'>End Credits UH OH...</Text>
					</View>
				)}
			</View>
		</ScrollView>
	);
}
