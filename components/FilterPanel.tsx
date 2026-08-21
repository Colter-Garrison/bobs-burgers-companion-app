import React, { useEffect, useRef, useState } from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import {
	GENDER_OPTIONS,
	GenderOption,
	HAIR_OPTIONS,
	HairOption,
	SortDirection,
} from '../hooks/useAttributeFilters'
import { useTheme } from '../hooks/useTheme'
import { CategoryFilterPills, CategoryFilter } from './CategoryFilterPills'

interface FilterPanelProps {
	categoryFilter?: CategoryFilter
	onSelectCategory?: (category: CategoryFilter) => void
	showGenderHairFilters?: boolean
	genders: Set<GenderOption>
	hairColors: Set<HairOption>
	sortDirection: SortDirection | null
	onToggleGender: (option: GenderOption) => void
	onToggleHair: (option: HairOption) => void
	onToggleSort: () => void
	activeCount: number
}

const pillClassName = (isSelected: boolean) =>
	isSelected
		? 'items-center justify-center rounded-full border-4 border-lightAccent dark:border-darkAccent bg-lightAccent dark:bg-darkAccent px-4 py-2'
		: 'items-center justify-center rounded-full border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface px-4 py-2'

const pillTextClassName = (isSelected: boolean) =>
	isSelected
		? 'font-chewy text-[14px] text-lightSurface dark:text-darkOnAccent'
		: 'font-chewy text-[14px] text-lightAccent dark:text-darkAccent'

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
	const [isExpanded, setIsExpanded] = useState(false)
	const { colors } = useTheme()
	const displayCount =
		activeCount + (categoryFilter && categoryFilter !== 'All' ? 1 : 0)
	const optionsRef = useRef<View>(null)

	useEffect(() => {
		if (Platform.OS !== 'web' || !isExpanded) {
			return
		}
		const node = optionsRef.current as unknown as HTMLElement | null
		if (node) {
			node.setAttribute('tabindex', '-1')
			node.focus()
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsExpanded(false)
			}
		}
		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [isExpanded])

	return (
		<View className='gap-2 p-2'>
			<Pressable
				onPress={() => setIsExpanded((prev) => !prev)}
				hitSlop={5}
				accessibilityRole='button'
				accessibilityLabel={
					isExpanded ? 'Hide filter options' : 'Show filter options'
				}
				accessibilityState={{ expanded: isExpanded }}
				style={{ alignSelf: 'flex-start' }}
				className='flex-row items-center gap-1 rounded-full border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface px-4 py-2'
			>
				<MaterialCommunityIcons
					name='filter-outline'
					size={16}
					color={colors.accent}
				/>
				<Text className='font-chewy text-[14px] text-lightAccent dark:text-darkAccent'>
					Filter By{displayCount > 0 ? ` (${displayCount})` : ''}
				</Text>
			</Pressable>

			{isExpanded ? (
				<View ref={optionsRef} className='gap-2' testID='filter-panel-options'>
					{categoryFilter && onSelectCategory ? (
						<View className='gap-1'>
							<Text className='font-chewy text-[12px] text-lightAccent dark:text-darkAccent'>
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
								<Text className='font-chewy text-[12px] text-lightAccent dark:text-darkAccent'>
									Gender
								</Text>
								<View
									className='gap-2'
									style={{ flexDirection: 'row', flexWrap: 'wrap' }}
								>
									{GENDER_OPTIONS.map((option) => {
										const isSelected = genders.has(option)
										return (
											<Pressable
												key={option}
												onPress={() => onToggleGender(option)}
												hitSlop={5}
												accessibilityRole='button'
												accessibilityLabel={`Filter by gender: ${option}`}
												accessibilityState={{ selected: isSelected }}
												className={pillClassName(isSelected)}
											>
												<Text className={pillTextClassName(isSelected)}>
													{option}
												</Text>
											</Pressable>
										)
									})}
								</View>
							</View>

							<View className='gap-1'>
								<Text className='font-chewy text-[12px] text-lightAccent dark:text-darkAccent'>
									Hair Color
								</Text>
								<View
									className='gap-2'
									style={{ flexDirection: 'row', flexWrap: 'wrap' }}
								>
									{HAIR_OPTIONS.map((option) => {
										const isSelected = hairColors.has(option)
										return (
											<Pressable
												key={option}
												onPress={() => onToggleHair(option)}
												hitSlop={5}
												accessibilityRole='button'
												accessibilityLabel={`Filter by hair color: ${option}`}
												accessibilityState={{ selected: isSelected }}
												className={pillClassName(isSelected)}
											>
												<Text className={pillTextClassName(isSelected)}>
													{option}
												</Text>
											</Pressable>
										)
									})}
								</View>
							</View>
						</>
					) : null}

					<View className='gap-1'>
						<Text className='font-chewy text-[12px] text-lightAccent dark:text-darkAccent'>
							Sort
						</Text>
						<Pressable
							onPress={onToggleSort}
							hitSlop={5}
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
								color={sortDirection !== null ? colors.onAccent : colors.accent}
							/>
							<Text className={pillTextClassName(sortDirection !== null)}>
								{sortDirection === 'desc' ? 'Z-A' : 'A-Z'}
							</Text>
						</Pressable>
					</View>
				</View>
			) : null}
		</View>
	)
}
