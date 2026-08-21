import { act, renderHook } from '@testing-library/react-native'
import { useCategorySearch } from './useCategorySearch'

interface Item {
	id: number
	name: string
}

const items: Item[] = [
	{ id: 1, name: 'Bob Belcher' },
	{ id: 2, name: 'Linda Belcher' },
	{ id: 3, name: 'Teddy' },
]

const getName = (item: Item) => item.name

describe('useCategorySearch', () => {
	it('shows every item by default, before any query is typed', () => {
		const { result } = renderHook(() => useCategorySearch(items, getName))
		expect(result.current.filteredItems).toEqual(items)
	})

	it('narrows to items whose searchable text contains the query, case-insensitively', () => {
		const { result } = renderHook(() => useCategorySearch(items, getName))

		act(() => {
			result.current.setQuery('belcher')
		})

		expect(result.current.filteredItems).toEqual([
			{ id: 1, name: 'Bob Belcher' },
			{ id: 2, name: 'Linda Belcher' },
		])
	})

	it('matches on a partial substring, not just whole words', () => {
		const { result } = renderHook(() => useCategorySearch(items, getName))

		act(() => {
			result.current.setQuery('edd')
		})

		expect(result.current.filteredItems).toEqual([{ id: 3, name: 'Teddy' }])
	})

	it('returns every item again once the query is cleared', () => {
		const { result } = renderHook(() => useCategorySearch(items, getName))

		act(() => {
			result.current.setQuery('bob')
		})
		expect(result.current.filteredItems).toHaveLength(1)

		act(() => {
			result.current.setQuery('')
		})
		expect(result.current.filteredItems).toEqual(items)
	})

	it('treats a whitespace-only query the same as empty', () => {
		const { result } = renderHook(() => useCategorySearch(items, getName))

		act(() => {
			result.current.setQuery('   ')
		})

		expect(result.current.filteredItems).toEqual(items)
	})

	it('returns an empty list when nothing matches', () => {
		const { result } = renderHook(() => useCategorySearch(items, getName))

		act(() => {
			result.current.setQuery('zzzznomatch')
		})

		expect(result.current.filteredItems).toEqual([])
	})
})
