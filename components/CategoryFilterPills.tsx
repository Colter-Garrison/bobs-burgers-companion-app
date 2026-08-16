import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
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
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			testID='category-filter-pills'
		>
			<View className='flex-row gap-2 p-2'>
				{OPTIONS.map((option) => {
					const isSelected = option === selected;
					return (
						<Pressable
							key={option}
							onPress={() => onSelect(option)}
							accessibilityRole='button'
							accessibilityLabel={`Filter by ${option}`}
							accessibilityState={{ selected: isSelected }}
							className={
								isSelected
									? 'items-center justify-center rounded-full border-4 border-bbRed bg-bbRed px-3 py-1'
									: 'items-center justify-center rounded-full border-4 border-bbRed bg-bbYellow px-3 py-1'
							}
						>
							<Text
								className={
									isSelected
										? 'font-chewy text-[14px] text-bbYellow'
										: 'font-chewy text-[14px] text-bbRed'
								}
							>
								{option}
							</Text>
						</Pressable>
					);
				})}
			</View>
		</ScrollView>
	);
}
