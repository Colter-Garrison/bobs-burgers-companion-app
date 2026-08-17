import { useMemo, useState } from 'react';

// Shared by all six category screens' new "search just this category"
// bar (Home's own search already covers all six at once via
// useSearchableItems — this is deliberately narrower, scoped to
// whatever list the screen already has loaded). Unlike Home, the full
// list shows by default; typing narrows it, rather than requiring a
// query before anything appears — these screens' primary job has always
// been "browse the whole category," search is additive here, not the
// entry point.
export function useCategorySearch<T>(
	items: T[],
	getSearchableText: (item: T) => string,
) {
	const [query, setQuery] = useState('');

	const filteredItems = useMemo(() => {
		const trimmed = query.trim().toLowerCase();
		if (!trimmed) return items;
		return items.filter((item) =>
			getSearchableText(item).toLowerCase().includes(trimmed),
		);
	}, [items, query, getSearchableText]);

	return { query, setQuery, filteredItems };
}
