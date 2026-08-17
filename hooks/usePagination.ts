import { useEffect, useState } from 'react';

export const PAGE_SIZE = 20;

// Shared by Home and Favorites: both render a (usually long) filtered list
// and want to show it 20 at a time, revealing more as the user scrolls,
// rather than rendering everything in the list at once.
export function usePagination<T>(items: T[]) {
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

	// Reset to the first page whenever the underlying list changes — a
	// new search query, a different filter pill, or freshly (re)loaded
	// data. Without this, switching to a shorter filtered list while
	// scrolled past its length would just show nothing.
	useEffect(() => {
		setVisibleCount(PAGE_SIZE);
	}, [items]);

	const loadMore = () => {
		setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, items.length));
	};

	return {
		visibleItems: items.slice(0, visibleCount),
		hasMore: visibleCount < items.length,
		loadMore,
	};
}
