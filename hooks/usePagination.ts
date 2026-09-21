import { useState } from 'react'

export const PAGE_SIZE = 20

export function usePagination<T>(items: T[]) {
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

	// Back to the first page whenever the list itself changes (a new
	// search or filter), adjusted during render rather than in an effect.
	const [prevItems, setPrevItems] = useState(items)
	if (items !== prevItems) {
		setPrevItems(items)
		setVisibleCount(PAGE_SIZE)
	}

	const loadMore = () => {
		setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, items.length))
	}

	return {
		visibleItems: items.slice(0, visibleCount),
		hasMore: visibleCount < items.length,
		loadMore,
	}
}
