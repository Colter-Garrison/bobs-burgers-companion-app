import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
	GENDER_OPTIONS,
	GenderOption,
	HAIR_OPTIONS,
	HairOption,
	SortDirection,
} from '../hooks/useAttributeFilters';
import { CategoryFilterPills, CategoryFilter } from './CategoryFilterPills';

interface FilterPanelProps {
	// Omitted entirely on a single-category screen (Burgers, Characters,
	// End Credits, Episodes, Pest Control Trucks, Stores) — there's
	// nothing to pick a category FROM when the screen already is one.
	// Home and Favorites, which search/filter across all six, pass both.
	categoryFilter?: CategoryFilter;
	onSelectCategory?: (category: CategoryFilter) => void;
	// Only Characters carry gender/hair — Home/Favorites derive this from
	// categoryFilter === 'Characters'; the standalone Characters screen
	// passes true unconditionally (no category picker to derive it
	// from); the other five category screens pass false (or omit it).
	showGenderHairFilters?: boolean;
	genders: Set<GenderOption>;
	hairColors: Set<HairOption>;
	sortDirection: SortDirection | null;
	onToggleGender: (option: GenderOption) => void;
	onToggleHair: (option: HairOption) => void;
	onToggleSort: () => void;
	activeCount: number;
}

const pillClassName = (isSelected: boolean) =>
	isSelected
		? 'items-center justify-center rounded-full border-4 border-bbRed bg-bbRed px-4 py-2'
		: 'items-center justify-center rounded-full border-4 border-bbRed bg-bbYellow px-4 py-2';

const pillTextClassName = (isSelected: boolean) =>
	isSelected
		? 'font-chewy text-[14px] text-bbYellow'
		: 'font-chewy text-[14px] text-bbRed';

export function FilterPanel({
	categoryFilter,
	onSelectCategory,
	showGenderHairFilters = false,
	genders,
	hairColors,
	sortDirection,
	onToggleGender,
	onToggleHair,
	onToggleSort,
	activeCount,
}: FilterPanelProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	// Category counts toward the badge too, now that it's tucked inside
	// this panel instead of always sitting visible on its own — otherwise
	// a collapsed panel with a category chosen would look like nothing
	// was filtered.
	const displayCount =
		activeCount + (categoryFilter && categoryFilter !== 'All' ? 1 : 0);

	return (
		<View className='gap-2 p-2'>
			<Pressable
				onPress={() => setIsExpanded((prev) => !prev)}
				accessibilityRole='button'
				accessibilityLabel={
					isExpanded ? 'Hide filter options' : 'Show filter options'
				}
				accessibilityState={{ expanded: isExpanded }}
				// `self-start` as a className doesn't take effect here (a
				// NativeWind bug also hit by CategoryFilterPills/the gender
				// and hair rows above — see their `flexWrap` inline styles)
				// — without it, this Pressable stretches to the full width
				// of its column-direction parent instead of hugging its
				// content.
				style={{ alignSelf: 'flex-start' }}
				className='flex-row items-center gap-1 rounded-full border-4 border-bbRed bg-bbYellow px-4 py-2'
			>
				<MaterialCommunityIcons
					name='filter-outline'
					size={16}
					color='#E8242F'
				/>
				<Text className='font-chewy text-[14px] text-bbRed'>
					Filter By{displayCount > 0 ? ` (${displayCount})` : ''}
				</Text>
			</Pressable>

			{isExpanded ? (
				<View className='gap-2' testID='filter-panel-options'>
					{categoryFilter && onSelectCategory ? (
						<View className='gap-1'>
							<Text className='font-chewy text-[12px] text-bbRed'>
								Category
							</Text>
							<CategoryFilterPills
								selected={categoryFilter}
								onSelect={onSelectCategory}
							/>
						</View>
					) : null}

					{showGenderHairFilters ? (
						<>
							<View className='gap-1'>
								<Text className='font-chewy text-[12px] text-bbRed'>
									Gender
								</Text>
								<View
									className='gap-2'
									style={{ flexDirection: 'row', flexWrap: 'wrap' }}
								>
									{GENDER_OPTIONS.map((option) => {
										const isSelected = genders.has(option);
										return (
											<Pressable
												key={option}
												onPress={() => onToggleGender(option)}
												accessibilityRole='button'
												accessibilityLabel={`Filter by gender: ${option}`}
												accessibilityState={{ selected: isSelected }}
												className={pillClassName(isSelected)}
											>
												<Text className={pillTextClassName(isSelected)}>
													{option}
												</Text>
											</Pressable>
										);
									})}
								</View>
							</View>

							<View className='gap-1'>
								<Text className='font-chewy text-[12px] text-bbRed'>
									Hair Color
								</Text>
								<View
									className='gap-2'
									style={{ flexDirection: 'row', flexWrap: 'wrap' }}
								>
									{HAIR_OPTIONS.map((option) => {
										const isSelected = hairColors.has(option);
										return (
											<Pressable
												key={option}
												onPress={() => onToggleHair(option)}
												accessibilityRole='button'
												accessibilityLabel={`Filter by hair color: ${option}`}
												accessibilityState={{ selected: isSelected }}
												className={pillClassName(isSelected)}
											>
												<Text className={pillTextClassName(isSelected)}>
													{option}
												</Text>
											</Pressable>
										);
									})}
								</View>
							</View>
						</>
					) : null}

					<View className='gap-1'>
						<Text className='font-chewy text-[12px] text-bbRed'>Sort</Text>
						<Pressable
							onPress={onToggleSort}
							accessibilityRole='button'
							accessibilityLabel={
								sortDirection === 'desc'
									? 'Sorted Z to A. Tap to sort A to Z'
									: sortDirection === 'asc'
										? 'Sorted A to Z. Tap to sort Z to A'
										: 'Tap to sort A to Z'
							}
							style={{ alignSelf: 'flex-start' }}
							className={`flex-row items-center gap-1 ${pillClassName(
								sortDirection !== null,
							)}`}
						>
							<MaterialCommunityIcons
								name={
									sortDirection === 'desc'
										? 'sort-alphabetical-descending'
										: 'sort-alphabetical-ascending'
								}
								size={16}
								color={sortDirection !== null ? '#F8DF24' : '#E8242F'}
							/>
							<Text className={pillTextClassName(sortDirection !== null)}>
								{sortDirection === 'desc' ? 'Z-A' : 'A-Z'}
							</Text>
						</Pressable>
					</View>
				</View>
			) : null}
		</View>
	);
}
