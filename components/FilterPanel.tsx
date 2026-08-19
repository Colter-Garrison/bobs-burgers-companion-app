import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
	GENDER_OPTIONS,
	GenderOption,
	HAIR_OPTIONS,
	HairOption,
	SortDirection,
} from '../hooks/useAttributeFilters';
import { useTheme } from '../hooks/useTheme';
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
		? 'items-center justify-center rounded-full border-4 border-lightAccent dark:border-darkAccent bg-lightAccent dark:bg-darkAccent px-4 py-2'
		: 'items-center justify-center rounded-full border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface px-4 py-2';

const pillTextClassName = (isSelected: boolean) =>
	isSelected
		? 'font-chewy text-[14px] text-lightSurface dark:text-darkOnAccent'
		: 'font-chewy text-[14px] text-lightAccent dark:text-darkAccent';

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
	// MaterialCommunityIcons' `color` prop is a plain prop, not a
	// className — NativeWind's dark: variant can't reach it, so (like
	// app/_layout.tsx's screenOptions) the color has to be picked
	// explicitly. `colors` is already resolved for the current isDark +
	// colorblindMode combination.
	const { colors } = useTheme();
	// Category counts toward the badge too, now that it's tucked inside
	// this panel instead of always sitting visible on its own — otherwise
	// a collapsed panel with a category chosen would look like nothing
	// was filtered.
	const displayCount =
		activeCount + (categoryFilter && categoryFilter !== 'All' ? 1 : 0);

	// Web-only keyboard support — native has no keyboard/Escape concept.
	// View has no `ref`-accessible DOM node type in RN's own types, so
	// this is deliberately typed loosely and only ever touched on web.
	const optionsRef = useRef<View>(null);

	useEffect(() => {
		if (Platform.OS !== 'web' || !isExpanded) {
			return;
		}
		// Moves focus into the newly revealed content instead of leaving a
		// keyboard user's focus sitting on the toggle button with no
		// indication anything changed. The panel itself, not any specific
		// control inside it — which control is actually first varies
		// (category pills, then gender/hair, then sort, depending on which
		// sections this screen passes in), so focusing the container is
		// the one thing that's always correct regardless of that shape.
		// tabIndex is set imperatively (not as a prop) since it only
		// matters on web and isn't part of View's own RN type.
		const node = optionsRef.current as unknown as HTMLElement | null;
		if (node) {
			node.setAttribute('tabindex', '-1');
			node.focus();
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsExpanded(false);
			}
		};
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isExpanded]);

	return (
		<View className='gap-2 p-2'>
			<Pressable
				onPress={() => setIsExpanded((prev) => !prev)}
				// px-4 py-2 around 14px text measures under the 44x44
				// minimum touch target guideline — 5pt hitSlop closes most
				// of that gap without changing the pill's visual size.
				hitSlop={5}
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
										const isSelected = genders.has(option);
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
										);
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
										const isSelected = hairColors.has(option);
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
										);
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
	);
}
