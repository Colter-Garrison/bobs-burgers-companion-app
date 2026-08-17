import { useCallback, useState } from 'react';

// Only Characters carry gender/hair at all, so these filters have no
// effect on the other five categories' items — they just pass through
// unfiltered by these two facets.
export const GENDER_OPTIONS = ['Male', 'Female'] as const;
// The API's own hair values are extremely long-tail (~90 distinct raw
// strings for 598 characters — many-near duplicate spellings and
// multi-character entries like "Blond (CJ) Black (Darnell)"), so this is
// a curated set of common colors matched by substring, not the literal
// values. "Other" catches anyone with a hair value that doesn't contain
// any of the named colors.
export const HAIR_OPTIONS = [
	'Blonde',
	'Brown',
	'Black',
	'Red',
	'Gray',
	'Bald',
	'Other',
] as const;

export type GenderOption = (typeof GENDER_OPTIONS)[number];
export type HairOption = (typeof HAIR_OPTIONS)[number];
export type SortDirection = 'asc' | 'desc';

// Plain substring matching would make a "Male" filter also match
// "Female" — "male" is literally a substring of "female". Word-boundary
// matching avoids that false positive while still matching "Male" inside
// a multi-character entry like "Male (Brom) Female (Eleanor)", since
// there's a real word boundary (a space) around "Male" there.
function matchesWord(haystack: string, word: string): boolean {
	return new RegExp(`\\b${word}\\b`, 'i').test(haystack);
}

function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
	const next = new Set(set);
	if (next.has(value)) {
		next.delete(value);
	} else {
		next.add(value);
	}
	return next;
}

// "Blonde" should also catch the API's "Blond" spelling, and vice versa —
// substring matching alone wouldn't bridge that, so this covers both
// spellings for whichever of the two is picked as a filter option.
function hairSubstringsFor(option: HairOption): string[] {
	if (option === 'Blonde') return ['blonde', 'blond'];
	return [option.toLowerCase()];
}

// Generic over T (unconstrained, rather than `T extends { gender?,
// hair? }`) so this one hook serves both Home/Favorites' SearchItem
// lists and, now, the six single-category screens' own raw item types
// (Character, Burger, Episode, ...) — most of which have neither field
// at all. TypeScript's "weak type" detection rejects a real type with
// zero overlap (e.g. Burger) against an all-optional constraint like
// that, even though it's exactly the intended case here, so matches()
// reads item.gender/item.hair through a narrow internal cast instead.
// sortItems takes an explicit key extractor for the same underlying
// reason: there's no single field name ("label" vs "name" vs a composed
// bio) common across all of them.
export function useAttributeFilters<T>() {
	const [genders, setGenders] = useState<Set<GenderOption>>(new Set());
	const [hairColors, setHairColors] = useState<Set<HairOption>>(new Set());
	const [sortDirection, setSortDirection] = useState<SortDirection | null>(
		null,
	);

	const toggleGender = useCallback((option: GenderOption) => {
		setGenders((prev) => toggleInSet(prev, option));
	}, []);

	const toggleHair = useCallback((option: HairOption) => {
		setHairColors((prev) => toggleInSet(prev, option));
	}, []);

	const toggleSort = useCallback(() => {
		setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
	}, []);

	const reset = useCallback(() => {
		setGenders(new Set());
		setHairColors(new Set());
		setSortDirection(null);
	}, []);

	// Narrower than reset() — leaves sort untouched. Callers (Home,
	// Favorites) use this when the category picker moves away from
	// "Characters": gender/hair selections stop being visible in the UI
	// at that point (FilterPanel's showGenderHairFilters goes false), but
	// without this they'd silently keep filtering — every other
	// category's items lack gender/hair fields entirely, so matches()
	// would reject all of them and the list would just go empty with no
	// visible explanation why.
	const clearGenderHair = useCallback(() => {
		setGenders(new Set());
		setHairColors(new Set());
	}, []);

	// Within a facet (any selected gender, any selected hair color), a
	// match on any one selection is enough — OR. Across facets (gender
	// AND hair AND whatever the caller applies separately, like category
	// or the search query), every active facet must match — the standard
	// faceted-filter combination.
	const matches = useCallback(
		(item: T) => {
			// See the function comment above the hook itself for why this
			// reads through a cast rather than a generic constraint.
			const { gender, hair: hairValue } = item as {
				gender?: string;
				hair?: string;
			};

			if (genders.size > 0) {
				if (
					!gender ||
					![...genders].some((option) => matchesWord(gender, option))
				) {
					return false;
				}
			}

			if (hairColors.size > 0) {
				if (!hairValue) return false;
				const hair = hairValue.toLowerCase();
				const matchesAny = [...hairColors].some((option) => {
					if (option === 'Other') {
						return !HAIR_OPTIONS.filter((o) => o !== 'Other').some(
							(namedColor) =>
								hairSubstringsFor(namedColor).some((s) => hair.includes(s)),
						);
					}
					return hairSubstringsFor(option).some((s) => hair.includes(s));
				});
				if (!matchesAny) return false;
			}

			return true;
		},
		[genders, hairColors],
	);

	const sortItems = useCallback(
		(items: T[], getSortKey: (item: T) => string) => {
			if (!sortDirection) return items;
			const sorted = [...items].sort((a, b) =>
				getSortKey(a).localeCompare(getSortKey(b)),
			);
			return sortDirection === 'desc' ? sorted.reverse() : sorted;
		},
		[sortDirection],
	);

	const activeCount = genders.size + hairColors.size + (sortDirection ? 1 : 0);

	return {
		genders,
		hairColors,
		sortDirection,
		toggleGender,
		toggleHair,
		toggleSort,
		matches,
		sortItems,
		reset,
		clearGenderHair,
		activeCount,
	};
}
