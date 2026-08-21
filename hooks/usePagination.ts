import { useEffect, useState } from 'react';

export const PAGE_SIZE = 20;

export function usePagination<T>(items: T[]) {
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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
