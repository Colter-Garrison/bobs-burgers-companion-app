import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SearchCategory } from '../hooks/useSearchableItems';

export type CategoryFilter = SearchCategory | 'All';

const CATEGORIES: SearchCategory[] = [
	'Burgers of the Day',
	'Characters',
	'End Credits',
	'Episodes',
	'Pest Control Trucks',
	'Stores Next Door',
];

const OPTIONS: CategoryFilter[] = ['All', ...CATEGORIES];

interface CategoryFilterPillsProps {
	selected: CategoryFilter;
	onSelect: (category: CategoryFilter) => void;
}

export function CategoryFilterPills({
	selected,
	onSelect,
}: CategoryFilterPillsProps) {
	return (
		<View
			className='gap-2 p-2'
			style={{ flexDirection: 'row', flexWrap: 'wrap' }}
			testID='category-filter-pills'
		>
			{OPTIONS.map((option) => {
				const isSelected = option === selected;
				return (
					<Pressable
						key={option}
						onPress={() => onSelect(option)}
						hitSlop={5}
						accessibilityRole='button'
						accessibilityLabel={`Filter by ${option}`}
						accessibilityState={{ selected: isSelected }}
						className={
							isSelected
								? 'items-center justify-center rounded-full border-4 border-lightAccent dark:border-darkAccent bg-lightAccent dark:bg-darkAccent px-4 py-2'
								: 'items-center justify-center rounded-full border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface px-4 py-2'
						}
					>
						<Text
							className={
								isSelected
									? 'font-chewy text-[14px] text-lightSurface dark:text-darkOnAccent'
									: 'font-chewy text-[14px] text-lightAccent dark:text-darkAccent'
							}
						>
							{option}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}
