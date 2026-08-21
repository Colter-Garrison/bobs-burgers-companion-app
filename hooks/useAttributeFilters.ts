import { useCallback, useState } from 'react'

export const GENDER_OPTIONS = ['Male', 'Female'] as const
export const HAIR_OPTIONS = [
	'Blonde',
	'Brown',
	'Black',
	'Red',
	'Gray',
	'Bald',
	'Other',
] as const

export type GenderOption = (typeof GENDER_OPTIONS)[number]
export type HairOption = (typeof HAIR_OPTIONS)[number]
export type SortDirection = 'asc' | 'desc'

function matchesWord(haystack: string, word: string): boolean {
	return new RegExp(`\\b${word}\\b`, 'i').test(haystack)
}

function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
	const next = new Set(set)
	if (next.has(value)) {
		next.delete(value)
	} else {
		next.add(value)
	}
	return next
}

function hairSubstringsFor(option: HairOption): string[] {
	if (option === 'Blonde') return ['blonde', 'blond']
	return [option.toLowerCase()]
}

export function useAttributeFilters<T>() {
	const [genders, setGenders] = useState<Set<GenderOption>>(new Set())
	const [hairColors, setHairColors] = useState<Set<HairOption>>(new Set())
	const [sortDirection, setSortDirection] = useState<SortDirection | null>(null)

	const toggleGender = useCallback((option: GenderOption) => {
		setGenders((prev) => toggleInSet(prev, option))
	}, [])

	const toggleHair = useCallback((option: HairOption) => {
		setHairColors((prev) => toggleInSet(prev, option))
	}, [])

	const toggleSort = useCallback(() => {
		setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
	}, [])

	const reset = useCallback(() => {
		setGenders(new Set())
		setHairColors(new Set())
		setSortDirection(null)
	}, [])

	const clearGenderHair = useCallback(() => {
		setGenders(new Set())
		setHairColors(new Set())
	}, [])

	const matches = useCallback(
		(item: T) => {
			const { gender, hair: hairValue } = item as {
				gender?: string
				hair?: string
			}

			if (genders.size > 0) {
				if (
					!gender ||
					![...genders].some((option) => matchesWord(gender, option))
				) {
					return false
				}
			}

			if (hairColors.size > 0) {
				if (!hairValue) return false
				const hair = hairValue.toLowerCase()
				const matchesAny = [...hairColors].some((option) => {
					if (option === 'Other') {
						return !HAIR_OPTIONS.filter((o) => o !== 'Other').some(
							(namedColor) =>
								hairSubstringsFor(namedColor).some((s) => hair.includes(s)),
						)
					}
					return hairSubstringsFor(option).some((s) => hair.includes(s))
				})
				if (!matchesAny) return false
			}

			return true
		},
		[genders, hairColors],
	)

	const sortItems = useCallback(
		(items: T[], getSortKey: (item: T) => string) => {
			if (!sortDirection) return items
			const sorted = [...items].sort((a, b) =>
				getSortKey(a).localeCompare(getSortKey(b)),
			)
			return sortDirection === 'desc' ? sorted.reverse() : sorted
		},
		[sortDirection],
	)

	const activeCount = genders.size + hairColors.size + (sortDirection ? 1 : 0)

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
	}
}
